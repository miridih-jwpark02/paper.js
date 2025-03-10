#!/usr/bin/env node

/**
 * Paper.js - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Copyright (c) 2011 - 2020, Jürg Lehni & Jonathan Puckey
 * http://juerglehni.com/ & https://puckey.studio/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { minifyAcorn } = require('./minify');
const QUnit = require('qunitjs');
const { JSDOM } = require('jsdom');
const http = require('http');
const { chromium } = require('playwright');

/**
 * Node.js 테스트 실행 함수
 */
async function testNode() {
  console.log('Node.js 테스트 실행 중...');
  
  try {
    // 1. acorn 압축
    await minifyAcorn();
    
    // 2. QUnit 설정
    QUnit.config.autostart = false;
    QUnit.config.testTimeout = 20000;
    
    // 3. 결과 출력 설정
    QUnit.log((details) => {
      console.log(
        details.result ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m',
        details.module,
        details.name,
        details.message || ''
      );
      
      if (!details.result && details.actual !== undefined) {
        console.log(`  Expected: ${details.expected}`);
        console.log(`  Actual: ${details.actual}`);
      }
    });
    
    QUnit.testDone((details) => {
      if (details.failed > 0) {
        console.log(`\x1b[31m${details.name}: ${details.failed} failed of ${details.total}\x1b[0m`);
      }
    });
    
    // 4. 테스트 완료 이벤트 처리
    let testsFailed = false;
    
    QUnit.done((details) => {
      console.log(`\nNode.js Tests: Total: ${details.total}, Failed: ${details.failed}, Passed: ${details.passed}, Runtime: ${details.runtime}ms`);
      
      if (details.failed > 0) {
        testsFailed = true;
      }
    });
    
    // 5. JSDOM 환경 설정
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost/',
      pretendToBeVisual: true
    });
    
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    
    // Canvas 설정 (모킹)
    global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
    global.HTMLCanvasElement.prototype.getContext = function() {
      // 빈 객체 반환
      return {
        fillRect: () => {},
        clearRect: () => {},
        getImageData: (x, y, w, h) => ({
          data: new Array(w * h * 4).fill(0)
        }),
        putImageData: () => {},
        createImageData: () => ({ data: [] }),
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        scale: () => {},
        rotate: () => {},
        translate: () => {},
        transform: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        fill: () => {},
        rect: () => {},
        arc: () => {},
        measureText: () => ({ width: 0 })
      };
    };
    global.HTMLCanvasElement.prototype.toDataURL = function() {
      return '';
    };
    
    // 6. ChangeFlag 및 __options 정의
    // ChangeFlag 정의 (src/item/ChangeFlag.js에서 가져옴)
    global.ChangeFlag = {
      APPEARANCE: 0x1,
      CHILDREN: 0x2,
      INSERTION: 0x4,
      GEOMETRY: 0x8,
      MATRIX: 0x10,
      SEGMENTS: 0x20,
      STROKE: 0x40,
      STYLE: 0x80,
      ATTRIBUTE: 0x100,
      CONTENT: 0x200,
      PIXELS: 0x400,
      CLIPPING: 0x800,
      VIEW: 0x1000
    };
    
    // Change 정의
    global.Change = {
      CHILDREN: global.ChangeFlag.CHILDREN | global.ChangeFlag.GEOMETRY | global.ChangeFlag.APPEARANCE,
      INSERTION: global.ChangeFlag.INSERTION | global.ChangeFlag.APPEARANCE,
      GEOMETRY: global.ChangeFlag.GEOMETRY | global.ChangeFlag.APPEARANCE,
      MATRIX: global.ChangeFlag.MATRIX | global.ChangeFlag.GEOMETRY | global.ChangeFlag.APPEARANCE,
      SEGMENTS: global.ChangeFlag.SEGMENTS | global.ChangeFlag.GEOMETRY | global.ChangeFlag.APPEARANCE,
      STROKE: global.ChangeFlag.STROKE | global.ChangeFlag.STYLE | global.ChangeFlag.APPEARANCE,
      STYLE: global.ChangeFlag.STYLE | global.ChangeFlag.APPEARANCE,
      ATTRIBUTE: global.ChangeFlag.ATTRIBUTE | global.ChangeFlag.APPEARANCE,
      CONTENT: global.ChangeFlag.CONTENT | global.ChangeFlag.GEOMETRY | global.ChangeFlag.APPEARANCE,
      PIXELS: global.ChangeFlag.PIXELS | global.ChangeFlag.APPEARANCE,
      VIEW: global.ChangeFlag.VIEW | global.ChangeFlag.APPEARANCE
    };
    
    // __options 정의
    global.__options = {
      version: require('../package.json').version,
      paperScript: true
    };
    
    // 7. Paper.js 로드
    try {
      require('../dist/paper-full.js');
      global.paper = window.paper;
    } catch (err) {
      console.error('Paper.js 로드 실패:', err);
      return false;
    }
    
    // 8. 테스트 파일 로드
    const testDir = path.join(__dirname, '../test/tests');
    const testFiles = fs.readdirSync(testDir)
      .filter(file => file.endsWith('.js') && file !== 'load.js');
    
    // 9. 헬퍼 로드
    try {
      require('../test/helpers.js');
    } catch (err) {
      console.error('헬퍼 로드 실패:', err);
    }
    
    // 10. 각 테스트 파일 로드
    testFiles.forEach(file => {
      try {
        require(path.join(testDir, file));
      } catch (err) {
        console.error(`테스트 파일 로드 실패 (${file}):`, err);
        testsFailed = true;
      }
    });
    
    // 11. 테스트 시작
    QUnit.start();
    
    // 12. 테스트 결과 반환
    return !testsFailed;
  } catch (err) {
    console.error('Node.js 테스트 실패:', err);
    return false;
  }
}

/**
 * 브라우저 테스트 실행 함수
 */
async function testBrowser() {
  console.log('브라우저 테스트 실행 중...');
  
  try {
    // 1. acorn 압축
    await minifyAcorn();
    
    // 2. 간단한 HTTP 서버 생성
    const server = http.createServer((req, res) => {
      let filePath = '.' + req.url;
      if (filePath === './') {
        filePath = './test/index.html';
      }
    
      const extname = path.extname(filePath);
      let contentType = 'text/html';
      
      switch (extname) {
        case '.js':
          contentType = 'text/javascript';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
          contentType = 'image/jpg';
          break;
      }
    
      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(500);
            res.end('Server Error: ' + error.code);
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });
    
    // 3. 서버 시작
    const PORT = 8080;
    
    return new Promise((resolve) => {
      server.listen(PORT, async () => {
        console.log(`테스트 서버 실행 중: http://localhost:${PORT}/`);
        
        // 4. Playwright를 사용하여 브라우저 테스트 실행
        const browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // 5. 테스트 결과 수집
        let testsFailed = false;
        let errorMessages = [];
        
        page.on('console', msg => {
          const text = msg.text();
          console.log(text);
          
          if (text.includes('FAILED:') || text.includes('Error:') || text.includes('ReferenceError:')) {
            testsFailed = true;
            errorMessages.push(text);
          }
        });
        
        page.on('pageerror', error => {
          console.error('페이지 오류:', error.message);
          testsFailed = true;
          errorMessages.push(error.message);
        });
        
        // 6. 테스트 페이지 로드
        try {
          await page.goto(`http://localhost:${PORT}/test/index.html`, { timeout: 60000 });
        } catch (err) {
          console.error('페이지 로드 실패:', err);
          testsFailed = true;
          errorMessages.push(`페이지 로드 실패: ${err.message}`);
          
          await browser.close();
          server.close();
          resolve(false);
          return;
        }
        
        // 7. 테스트 완료 대기 (타임아웃 증가)
        try {
          await page.waitForFunction(() => {
            return window.QUnit && 
                  window.QUnit.config.queue.length === 0 && 
                  window.QUnit.config.stats.bad + window.QUnit.config.stats.all === window.QUnit.config.stats.total;
          }, { timeout: 300000 }); // 타임아웃을 5분으로 증가
        } catch (err) {
          console.error('테스트 타임아웃:', err);
          testsFailed = true;
          errorMessages.push(`테스트 타임아웃: ${err.message}`);
          
          // 현재 상태 확인
          try {
            const status = await page.evaluate(() => {
              return {
                qunitExists: !!window.QUnit,
                queueLength: window.QUnit ? window.QUnit.config.queue.length : 'N/A',
                stats: window.QUnit ? window.QUnit.config.stats : 'N/A'
              };
            });
            console.log('QUnit 상태:', JSON.stringify(status, null, 2));
          } catch (statusErr) {
            console.error('QUnit 상태 확인 실패:', statusErr);
          }
        }
        
        // 8. 테스트 결과 확인
        let testResults = { total: 0, passed: 0, failed: 0 };
        try {
          testResults = await page.evaluate(() => {
            return {
              total: window.QUnit.config.stats.total,
              passed: window.QUnit.config.stats.all,
              failed: window.QUnit.config.stats.bad
            };
          });
        } catch (err) {
          console.error('테스트 결과 확인 실패:', err);
          testsFailed = true;
          errorMessages.push(`테스트 결과 확인 실패: ${err.message}`);
        }
        
        console.log(`\nBrowser Tests: Total: ${testResults.total}, Passed: ${testResults.passed}, Failed: ${testResults.failed}`);
        
        if (errorMessages.length > 0) {
          console.error('\n오류 메시지:');
          errorMessages.forEach((msg, i) => {
            console.error(`${i + 1}. ${msg}`);
          });
        }
        
        // 9. 브라우저 및 서버 종료
        await browser.close();
        server.close();
        
        // 10. 테스트 결과 반환
        resolve(!testsFailed && testResults.failed === 0);
      });
    });
  } catch (err) {
    console.error('브라우저 테스트 실패:', err);
    return false;
  }
}

/**
 * 테스트 메인 함수
 */
async function test() {
  console.log('Paper.js 테스트 시작...');
  
  try {
    // 0. 먼저 빌드 실행
    console.log('빌드 실행 중...');
    const { main: build } = require('./build');
    await build();
    console.log('빌드 완료!');
    
    // 1. Node.js 테스트 실행
    const nodeResult = await testNode();
    
    // 2. 브라우저 테스트 실행
    const browserResult = await testBrowser();
    
    // 3. 테스트 결과 확인
    if (nodeResult && browserResult) {
      console.log('모든 테스트 통과!');
      return true;
    } else {
      console.error('테스트 실패!');
      process.exit(1);
    }
  } catch (err) {
    console.error('테스트 실패:', err);
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우에만 test 함수 호출
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // 특정 테스트 실행
    const testType = args[0];
    
    if (testType === 'testNode') {
      console.log('Node.js 테스트만 실행합니다...');
      testNode().then(result => {
        process.exit(result ? 0 : 1);
      });
    } else if (testType === 'testBrowser') {
      console.log('브라우저 테스트만 실행합니다...');
      testBrowser().then(result => {
        process.exit(result ? 0 : 1);
      });
    } else {
      console.error(`알 수 없는 테스트 유형: ${testType}`);
      console.error('사용법: node scripts/test.js [testNode|testBrowser]');
      process.exit(1);
    }
  } else {
    // 모든 테스트 실행
    test();
  }
}

module.exports = {
  test,
  testNode,
  testBrowser
}; 