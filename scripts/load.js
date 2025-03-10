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

/**
 * 개발 모드 로드 함수
 * 소스 파일을 직접 로드하기 위한 심볼릭 링크 생성
 */
async function load() {
  console.log('Paper.js 개발 모드 로드 시작...');
  
  try {
    // 1. dist 디렉토리 확인
    const distPath = path.join(__dirname, '../dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    
    // 2. 기존 파일 삭제
    const files = ['paper-full.js', 'paper-core.js'];
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    // 3. 심볼릭 링크 생성
    const srcPath = path.join(__dirname, '../src/load.js');
    
    files.forEach(file => {
      const targetPath = path.join(distPath, file);
      fs.symlinkSync(srcPath, targetPath);
      console.log(`  - ${file} 심볼릭 링크 생성 완료`);
    });
    
    // 4. Node.js 모듈 디렉토리 생성
    const nodePath = path.join(distPath, 'node');
    if (!fs.existsSync(nodePath)) {
      fs.mkdirSync(nodePath, { recursive: true });
    }
    
    console.log('Paper.js 개발 모드 로드 완료!');
    return true;
  } catch (err) {
    console.error('개발 모드 로드 실패:', err);
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우에만 load 함수 호출
if (require.main === module) {
  load();
}

module.exports = {
  load
}; 