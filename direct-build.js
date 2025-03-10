#!/usr/bin/env node

/*
 * Paper.js - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Node.js 20+ 호환성을 위한 직접 빌드 스크립트
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 빌드 함수
async function build() {
  console.log('직접 빌드 시작...');
  
  try {
    // 1. 필요한 디렉토리 생성
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist');
    }
    if (!fs.existsSync('dist/node')) {
      fs.mkdirSync('dist/node');
    }
    
    // 2. src/node 파일 복사
    console.log('Node.js 파일 복사 중...');
    const nodeFiles = fs.readdirSync('src/node');
    nodeFiles.forEach(file => {
      if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join('src/node', file), 'utf8');
        fs.writeFileSync(path.join('dist/node', file), content);
        console.log(`  - ${file} 복사 완료`);
      }
    });
    
    // 3. 소스 파일 복사 및 처리
    console.log('소스 파일 처리 중...');
    
    // paper-full.js 생성
    createPaperVersion('full', true);
    
    // paper-core.js 생성
    createPaperVersion('core', false);
    
    console.log('빌드 완료!');
  } catch (err) {
    console.error('빌드 실패:', err);
    process.exit(1);
  }
}

// Paper.js 버전 생성 함수
function createPaperVersion(version, includePaperScript) {
  console.log(`paper-${version}.js 생성 중...`);
  
  // 소스 파일 읽기
  const paperSource = fs.readFileSync('src/paper.js', 'utf8');
  
  // 상수 파일 읽기
  const constantsSource = fs.readFileSync('src/constants.js', 'utf8');
  
  // 전처리 옵션
  const options = {
    paperScript: includePaperScript
  };
  
  // 전처리 (간단한 구현)
  let processedSource = paperSource;
  
  // 상수 치환
  const constants = {};
  const constantsRegex = /var\s+([A-Z_]+)\s*=\s*([^;]+);/g;
  let match;
  while ((match = constantsRegex.exec(constantsSource)) !== null) {
    const name = match[1];
    const value = match[2].trim();
    constants[name] = value;
  }
  
  // 상수 치환 적용
  Object.keys(constants).forEach(key => {
    const regex = new RegExp(`/\\*#=\\*/\\s*${key}`, 'g');
    processedSource = processedSource.replace(regex, constants[key]);
  });
  
  // PaperScript 포함 여부에 따른 처리
  if (!includePaperScript) {
    processedSource = processedSource.replace(/\/\/ #if .*?PaperScript.*?\/\/ #endif/gs, '');
  }
  
  // 주석 제거
  processedSource = processedSource.replace(/\/\*[\s\S]*?\*\//g, '');
  processedSource = processedSource.replace(/\/\/.*$/gm, '');
  
  // 공백 처리
  processedSource = processedSource.replace(/\t/g, '    ');
  processedSource = processedSource.replace(/[ \t]+$/gm, '');
  
  // 파일 저장
  fs.writeFileSync(`dist/paper-${version}.js`, processedSource);
  console.log(`  - paper-${version}.js 생성 완료`);
}

// 빌드 실행
build(); 