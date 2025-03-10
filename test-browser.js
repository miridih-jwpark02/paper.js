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

const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

// 간단한 HTTP 서버 생성
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

// 서버 시작
const PORT = 8080;
server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  
  // Playwright를 사용하여 브라우저 테스트 실행
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 테스트 결과 수집
  let testsFailed = false;
  
  page.on('console', msg => {
    console.log(msg.text());
    if (msg.text().includes('FAILED:')) {
      testsFailed = true;
    }
  });
  
  // 테스트 페이지 로드
  await page.goto(`http://localhost:${PORT}/test/index.html`);
  
  // 테스트 완료 대기
  await page.waitForFunction(() => window.QUnit && window.QUnit.config.queue.length === 0 && window.QUnit.config.stats.bad + window.QUnit.config.stats.all === window.QUnit.config.stats.total, { timeout: 60000 });
  
  // 테스트 결과 확인
  const testResults = await page.evaluate(() => {
    return {
      total: window.QUnit.config.stats.total,
      passed: window.QUnit.config.stats.all,
      failed: window.QUnit.config.stats.bad
    };
  });
  
  console.log(`\nBrowser Tests: Total: ${testResults.total}, Passed: ${testResults.passed}, Failed: ${testResults.failed}`);
  
  // 브라우저 및 서버 종료
  await browser.close();
  server.close();
  
  // 테스트 실패 시 종료 코드 설정
  if (testsFailed || testResults.failed > 0) {
    process.exit(1);
  }
}); 