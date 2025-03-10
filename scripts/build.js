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
const { build } = require('vite');
const { execSync } = require('child_process');

// 빌드 옵션
const buildOptions = {
  full: { paperScript: true },
  core: { paperScript: false }
};

/**
 * 소스 파일 전처리 함수
 * @param {string} content - 처리할 소스 코드
 * @param {string} basePath - 기본 경로
 * @returns {string} - 처리된 소스 코드
 */
function processSource(content, basePath = path.join(__dirname, '../src')) {
  // include 지시문 정규식
  const includeRegex = /include\(['"]([^'"]+)['"]\);/g;
  
  // 모든 include 지시문 처리
  return content.replace(includeRegex, (match, includePath) => {
    // 상대 경로 해결
    const resolvedPath = path.resolve(basePath, includePath);
    
    // 파일이 존재하는지 확인
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`경고: 파일을 찾을 수 없음: ${resolvedPath}`);
      return `/* 파일을 찾을 수 없음: ${includePath} */`;
    }
    
    // 파일 내용 읽기
    const includeContent = fs.readFileSync(resolvedPath, 'utf8');
    
    // 포함된 파일의 디렉토리 경로
    const includeDir = path.dirname(resolvedPath);
    
    // 재귀적으로 include 처리
    return processSource(includeContent, includeDir);
  });
}

/**
 * Paper.js 버전 생성 함수
 * @param {string} version - 버전 이름 (full 또는 core)
 * @param {boolean} includePaperScript - PaperScript 포함 여부
 * @returns {string} - 생성된 파일 경로
 */
function createPaperVersion(version, includePaperScript) {
  console.log(`paper-${version}.js 생성 중...`);
  
  // 임시 디렉토리 생성
  const tmpDir = path.join(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  // 소스 파일 읽기
  const paperSource = fs.readFileSync(path.join(__dirname, '../src/paper.js'), 'utf8');
  
  // 상수 파일 읽기
  const constantsSource = fs.readFileSync(path.join(__dirname, '../src/constants.js'), 'utf8');
  
  // ChangeFlag 파일 읽기
  const changeFlagSource = fs.readFileSync(path.join(__dirname, '../src/item/ChangeFlag.js'), 'utf8');
  
  // 상수 치환
  const constants = {};
  const constantsRegex = /var\s+([A-Z_]+)\s*=\s*([^;]+);/g;
  let match;
  while ((match = constantsRegex.exec(constantsSource)) !== null) {
    const name = match[1];
    const value = match[2].trim();
    constants[name] = value;
  }
  
  // 소스 처리
  let processedSource = paperSource;
  
  // ChangeFlag 직접 삽입
  // 먼저 ChangeFlag 정의를 추출
  const changeFlagDef = changeFlagSource.match(/var ChangeFlag = \{[\s\S]*?\};/)[0];
  const changeDef = changeFlagSource.match(/var Change = \{[\s\S]*?\};/)[0];
  
  // 소스 코드 시작 부분에 ChangeFlag 정의 삽입
  processedSource = processedSource.replace(
    /(\/\*\s*Paper\.js[\s\S]*?All rights reserved\.\s*\*\/\s*)/,
    '$1\n' + changeFlagDef + '\n' + changeDef + '\n'
  );
  
  // __options 객체 처리
  // 전역 __options 객체가 없을 경우 기본값 제공
  const optionsCode = `
// __options 객체 처리
var __options = typeof __options !== 'undefined' ? __options : {
  version: "${require('../package.json').version}",
  paperScript: ${includePaperScript}
};
`;
  
  // 소스 코드 시작 부분에 __options 정의 삽입
  processedSource = processedSource.replace(
    /(\/\*\s*Paper\.js[\s\S]*?All rights reserved\.\s*\*\/\s*)/,
    '$1\n' + optionsCode
  );
  
  // 상수 치환 적용
  Object.keys(constants).forEach(key => {
    const regex = new RegExp(`/\\*#=\\*/\\s*${key}`, 'g');
    processedSource = processedSource.replace(regex, constants[key]);
  });
  
  // PaperScript 포함 여부에 따른 처리
  if (!includePaperScript) {
    processedSource = processedSource.replace(/\/\/ #if .*?PaperScript.*?\/\/ #endif/gs, '');
  }
  
  // include 처리
  processedSource = processSource(processedSource);
  
  // 임시 파일 경로
  const tmpFile = path.join(tmpDir, `paper-${version}.js`);
  
  // 파일 저장
  fs.writeFileSync(tmpFile, processedSource);
  console.log(`  - paper-${version}.js 전처리 완료`);
  
  return tmpFile;
}

/**
 * Vite로 빌드 실행
 * @param {string} entry - 진입점 파일 경로
 * @param {string} name - 출력 파일 이름
 * @param {boolean} minify - 압축 여부
 */
async function buildWithVite(entry, name, minify = false) {
  console.log(`Vite로 ${name} 빌드 중...${minify ? ' (압축)' : ''}`);
  
  try {
    await build({
      configFile: false,
      build: {
        lib: {
          entry,
          name: 'paper',
          formats: ['umd', 'es'],
          fileName: (format) => `${name}.${format === 'umd' ? (minify ? 'min.js' : 'js') : format + (minify ? '.min.js' : '.js')}`
        },
        outDir: 'dist',
        emptyOutDir: false,
        minify: minify ? 'terser' : false,
        terserOptions: minify ? {
          format: {
            ascii_only: true,
            comments: /^!/
          }
        } : undefined,
        sourcemap: true
      }
    });
    
    console.log(`  - ${name} 빌드 완료${minify ? ' (압축)' : ''}`);
    return true;
  } catch (err) {
    console.error(`  - ${name} 빌드 실패:`, err);
    return false;
  }
}

/**
 * Node.js 모듈 복사
 */
function copyNodeModules() {
  console.log('Node.js 모듈 복사 중...');
  
  try {
    const sourceDir = path.join(__dirname, '../src/node');
    const targetDir = path.join(__dirname, '../dist/node');
    
    // 대상 디렉토리 확인
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // 파일 목록 가져오기
    const files = fs.readdirSync(sourceDir);
    
    // 각 파일 복사
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        const content = fs.readFileSync(sourcePath, 'utf8');
        fs.writeFileSync(targetPath, content);
        console.log(`  - ${file} 복사 완료`);
      }
    });
    
    console.log('Node.js 모듈 복사 완료');
    return true;
  } catch (err) {
    console.error('Node.js 모듈 복사 실패:', err);
    return false;
  }
}

/**
 * 임시 파일 정리
 */
function cleanup() {
  console.log('임시 파일 정리 중...');
  
  try {
    const tmpDir = path.join(__dirname, '../tmp');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    
    console.log('임시 파일 정리 완료');
  } catch (err) {
    console.warn('임시 파일 정리 실패:', err);
  }
}

/**
 * 메인 빌드 함수
 */
async function main() {
  console.log('Paper.js 빌드 시작...');
  
  try {
    // 1. 버전별 소스 파일 생성
    const fullSource = createPaperVersion('full', true);
    const coreSource = createPaperVersion('core', false);
    
    // 2. Vite로 빌드
    await buildWithVite(fullSource, 'paper-full');
    await buildWithVite(coreSource, 'paper-core');
    
    // 3. 압축 버전 빌드
    await buildWithVite(fullSource, 'paper-full', true);
    await buildWithVite(coreSource, 'paper-core', true);
    
    // 4. Node.js 모듈 복사
    copyNodeModules();
    
    console.log('Paper.js 빌드 완료!');
  } catch (err) {
    console.error('빌드 실패:', err);
    process.exit(1);
  } finally {
    // 임시 파일 정리
    cleanup();
  }
}

// 스크립트가 직접 실행된 경우에만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = {
  main,
  createPaperVersion,
  buildWithVite,
  copyNodeModules,
  cleanup
}; 