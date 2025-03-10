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
const { main: build } = require('./build');
const chokidar = require('chokidar');

/**
 * 파일 변경 감시 함수
 */
async function watch() {
  console.log('Paper.js 파일 변경 감시 시작...');
  
  try {
    // 1. 초기 빌드 실행
    await build();
    
    // 2. 파일 변경 감시 설정
    const watcher = chokidar.watch('src/**/*.js', {
      ignored: /(^|[\/\\])\../, // 숨김 파일 무시
      persistent: true
    });
    
    // 3. 변경 이벤트 처리
    watcher
      .on('change', async (filePath) => {
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`\n파일 변경 감지: ${relativePath}`);
        
        // 파일 변경 시 빌드 실행
        await build();
        
        // 린트 실행
        try {
          execSync(`npx jshint ${filePath}`, { stdio: 'inherit' });
          console.log(`${relativePath} 린트 통과!`);
        } catch (err) {
          console.error(`${relativePath} 린트 실패!`);
        }
      })
      .on('error', error => console.error(`감시 오류: ${error}`));
    
    console.log('파일 변경 감시 중... (종료하려면 Ctrl+C를 누르세요)');
    
    // 4. 프로세스 종료 처리
    process.on('SIGINT', () => {
      console.log('\n파일 변경 감시 종료!');
      watcher.close();
      process.exit(0);
    });
    
    // 5. 개발 서버 실행
    const PORT = 8080;
    const http = require('http');
    
    const server = http.createServer((req, res) => {
      let filePath = '.' + req.url;
      if (filePath === './') {
        filePath = './examples/index.html';
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
    
    server.listen(PORT, () => {
      console.log(`개발 서버 실행 중: http://localhost:${PORT}/`);
    });
    
    return true;
  } catch (err) {
    console.error('파일 변경 감시 실패:', err);
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우에만 watch 함수 호출
if (require.main === module) {
  watch();
}

module.exports = {
  watch
}; 