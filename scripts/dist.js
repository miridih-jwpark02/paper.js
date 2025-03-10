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
const { minify } = require('./minify');
const { docs } = require('./docs');

/**
 * 배포 파일 생성 함수
 */
async function dist() {
  console.log('Paper.js 배포 파일 생성 시작...');
  
  try {
    // 1. 빌드 실행
    await build();
    
    // 2. 압축 실행
    await minify();
    
    // 3. 문서 생성 시도
    try {
      await docs();
    } catch (docErr) {
      console.warn('문서 생성 중 오류가 발생했습니다. 배포 과정은 계속됩니다:', docErr);
    }
    
    console.log('Paper.js 배포 파일 생성 완료!');
    return true;
  } catch (err) {
    console.error('배포 파일 생성 실패:', err);
    process.exit(1);
  }
}

/**
 * 배포 파일 압축 함수
 */
async function zip() {
  console.log('Paper.js 배포 파일 압축 시작...');
  
  try {
    // 1. 배포 파일 생성
    await dist();
    
    // 2. 기존 zip 파일 삭제
    const zipPath = path.join(__dirname, '../dist/paperjs.zip');
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    
    // 3. 파일 압축
    const files = [
      'dist/paper-full.js',
      'dist/paper-full.min.js',
      'dist/paper-core.js',
      'dist/paper-core.min.js',
      'dist/paper.d.ts',
      'dist/paper-core.d.ts',
      'dist/node/**/*',
      'LICENSE.txt',
      'examples/**/*',
      'dist/docs/**/*'
    ].join(' ');
    
    // 압축 명령 실행
    execSync(`cd ${path.join(__dirname, '..')} && zip -r dist/paperjs.zip ${files}`, { stdio: 'inherit' });
    
    console.log('Paper.js 배포 파일 압축 완료!');
    return true;
  } catch (err) {
    console.error('배포 파일 압축 실패:', err);
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우에만 dist 함수 호출
if (require.main === module) {
  dist();
}

module.exports = {
  dist,
  zip
}; 