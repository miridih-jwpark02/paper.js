#!/usr/bin/env node

/**
 * Paper.js Vite 빌드 스크립트
 * 기존 빌드 프로세스를 사용하여 소스 파일을 생성한 후 Vite로 번들링합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { build } = require('vite');

// 임시 디렉토리 경로
const TMP_DIR = path.join(__dirname, 'tmp');
const TMP_FULL = path.join(TMP_DIR, 'paper-full.js');
const TMP_CORE = path.join(TMP_DIR, 'paper-core.js');

// 소스 디렉토리
const SRC_DIR = path.join(__dirname, 'src');

// include 지시문 처리 함수
function processIncludes(content, basePath = SRC_DIR) {
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
    return processIncludes(includeContent, includeDir);
  });
}

// 기존 빌드 스크립트 실행 함수
async function runOriginalBuild() {
  console.log('기존 빌드 스크립트 실행 중...');
  
  try {
    // 임시 디렉토리 생성
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }
    
    // direct-build.js 스크립트 실행
    execSync('node direct-build.js', { stdio: 'inherit' });
    
    // 생성된 파일 임시 디렉토리로 복사 및 include 처리
    if (fs.existsSync('dist/paper-full.js')) {
      let content = fs.readFileSync('dist/paper-full.js', 'utf8');
      content = processIncludes(content);
      fs.writeFileSync(TMP_FULL, content);
      console.log('paper-full.js 처리 완료');
    }
    
    if (fs.existsSync('dist/paper-core.js')) {
      let content = fs.readFileSync('dist/paper-core.js', 'utf8');
      content = processIncludes(content);
      fs.writeFileSync(TMP_CORE, content);
      console.log('paper-core.js 처리 완료');
    }
    
    return true;
  } catch (err) {
    console.error('기존 빌드 스크립트 실행 실패:', err);
    return false;
  }
}

// Vite 빌드 함수 (full 버전)
async function buildFullWithVite() {
  console.log('Vite로 paper-full.js 빌드 중...');
  
  try {
    await build({
      configFile: false,
      build: {
        lib: {
          entry: TMP_FULL,
          name: 'paper',
          formats: ['umd', 'es'],
          fileName: (format) => `paper-full.${format === 'umd' ? 'js' : format + '.js'}`
        },
        outDir: 'dist',
        emptyOutDir: false,
        minify: false,
        sourcemap: true
      }
    });
    
    console.log('paper-full.js 빌드 완료');
    return true;
  } catch (err) {
    console.error('paper-full.js Vite 빌드 실패:', err);
    return false;
  }
}

// Vite 빌드 함수 (core 버전)
async function buildCoreWithVite() {
  console.log('Vite로 paper-core.js 빌드 중...');
  
  try {
    await build({
      configFile: false,
      build: {
        lib: {
          entry: TMP_CORE,
          name: 'paper',
          formats: ['umd', 'es'],
          fileName: (format) => `paper-core.${format === 'umd' ? 'js' : format + '.js'}`
        },
        outDir: 'dist',
        emptyOutDir: false,
        minify: false,
        sourcemap: true
      }
    });
    
    console.log('paper-core.js 빌드 완료');
    return true;
  } catch (err) {
    console.error('paper-core.js Vite 빌드 실패:', err);
    return false;
  }
}

// Node.js 모듈 복사 함수
function copyNodeModules() {
  console.log('Node.js 모듈 복사 중...');
  
  try {
    const sourceDir = path.join(__dirname, 'src', 'node');
    const targetDir = path.join(__dirname, 'dist', 'node');
    
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

// 임시 파일 정리 함수
function cleanup() {
  console.log('임시 파일 정리 중...');
  
  try {
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }
    
    console.log('임시 파일 정리 완료');
  } catch (err) {
    console.warn('임시 파일 정리 실패:', err);
  }
}

// 메인 함수
async function main() {
  console.log('Paper.js Vite 빌드 시작...');
  
  try {
    // 1. 기존 빌드 스크립트 실행
    const buildSuccess = await runOriginalBuild();
    if (!buildSuccess) {
      throw new Error('기존 빌드 스크립트 실행 실패');
    }
    
    // 2. Vite로 빌드
    const fullSuccess = await buildFullWithVite();
    const coreSuccess = await buildCoreWithVite();
    
    if (!fullSuccess || !coreSuccess) {
      throw new Error('Vite 빌드 실패');
    }
    
    // 3. Node.js 모듈 복사
    const copySuccess = copyNodeModules();
    if (!copySuccess) {
      throw new Error('Node.js 모듈 복사 실패');
    }
    
    console.log('Paper.js Vite 빌드 완료!');
  } catch (err) {
    console.error('빌드 실패:', err);
    process.exit(1);
  } finally {
    // 임시 파일 정리
    cleanup();
  }
}

// 스크립트 실행
main(); 