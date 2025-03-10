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

// 문서 생성 옵션
const docOptions = {
  local: 'docs', // 오프라인 문서
  server: 'serverdocs' // 웹사이트 템플릿
};

/**
 * 문서 생성 함수
 * @param {string} mode - 문서 생성 모드 (local 또는 server)
 */
async function generateDocs(mode) {
  if (!docOptions[mode]) {
    throw new Error(`알 수 없는 문서 생성 모드: ${mode}`);
  }
  
  console.log(`${mode} 문서 생성 중...`);
  
  try {
    // 1. 기존 문서 삭제
    const docsPath = path.join(__dirname, `../dist/${docOptions[mode]}`);
    if (fs.existsSync(docsPath)) {
      fs.rmSync(docsPath, { recursive: true, force: true });
    }
    
    // 2. JsDoc 실행
    const jsdocPath = path.join(__dirname, '../gulp/jsdoc');
    const version = require('../package.json').version;
    
    execSync(
      `java -cp jsrun.jar:lib/* JsRun app/run.js -c=conf/${mode}.conf -D="renderMode:${mode}" -D="version:${version}"`,
      { cwd: jsdocPath, stdio: 'inherit' }
    );
    
    console.log(`${mode} 문서 생성 완료!`);
    return true;
  } catch (err) {
    console.error(`${mode} 문서 생성 실패:`, err);
    return false;
  }
}

/**
 * TypeScript 정의 파일 생성 함수
 */
async function generateTypeScript() {
  console.log('TypeScript 정의 파일 생성 중...');
  
  try {
    // 1. 기존 정의 파일 삭제
    const dtsPath = path.join(__dirname, '../dist/paper.d.ts');
    if (fs.existsSync(dtsPath)) {
      fs.unlinkSync(dtsPath);
    }
    
    // 2. JsDoc 실행하여 데이터 생성
    const jsdocPath = path.join(__dirname, '../gulp/jsdoc');
    const typescriptPath = path.join(__dirname, '../gulp/typescript');
    const version = require('../package.json').version;
    const date = new Date().toISOString().split('T')[0];
    
    execSync(
      `java -cp jsrun.jar:lib/* JsRun app/run.js -c=conf/typescript.conf -D="file:../../gulp/typescript/typescript-definition-data.json" -D="version:${version}" -D="date:${date}"`,
      { cwd: jsdocPath, stdio: 'inherit' }
    );
    
    // 3. 정의 파일 생성
    execSync(
      `node gulp/typescript/typescript-definition-generator.js`,
      { cwd: path.join(__dirname, '..'), stdio: 'inherit' }
    );
    
    // 4. 정의 파일 테스트
    execSync(
      `node node_modules/typescript/bin/tsc --project gulp/typescript`,
      { cwd: path.join(__dirname, '..'), stdio: 'inherit' }
    );
    
    // 5. 임시 파일 정리
    const dataPath = path.join(typescriptPath, 'typescript-definition-data.json');
    const testPath = path.join(typescriptPath, 'typescript-definition-test.js');
    
    if (fs.existsSync(dataPath)) {
      fs.unlinkSync(dataPath);
    }
    
    if (fs.existsSync(testPath)) {
      fs.unlinkSync(testPath);
    }
    
    // 6. paper-core.d.ts 생성
    const paperDts = fs.readFileSync(dtsPath, 'utf8');
    const coreDts = paperDts.replace(/\/\/ #if .*?PaperScript.*?\/\/ #endif/gs, '');
    fs.writeFileSync(path.join(__dirname, '../dist/paper-core.d.ts'), coreDts);
    
    console.log('TypeScript 정의 파일 생성 완료!');
    return true;
  } catch (err) {
    console.error('TypeScript 정의 파일 생성 실패:', err);
    return false;
  }
}

/**
 * 문서 생성 메인 함수
 */
async function docs() {
  console.log('Paper.js 문서 생성 시작...');
  
  try {
    // 1. 빌드 실행
    await build();
    
    // 2. 문서 생성 시도
    try {
      // 로컬 문서 생성
      await generateDocs('local');
      
      // 서버 문서 생성
      await generateDocs('server');
      
      // TypeScript 정의 파일 생성
      await generateTypeScript();
      
      // 문서 자산 복사
      const docsAssetsPath = path.join(__dirname, '../dist/docs/assets/js');
      if (fs.existsSync(docsAssetsPath)) {
        fs.mkdirSync(docsAssetsPath, { recursive: true });
        
        fs.copyFileSync(
          path.join(__dirname, '../dist/paper-full.js'),
          path.join(docsAssetsPath, 'paper.js')
        );
      }
    } catch (docErr) {
      console.warn('문서 생성 중 오류가 발생했습니다. 빌드 과정은 계속됩니다:', docErr);
    }
    
    console.log('Paper.js 문서 생성 완료!');
    return true;
  } catch (err) {
    console.error('문서 생성 실패:', err);
    return false;
  }
}

// 스크립트가 직접 실행된 경우에만 docs 함수 호출
if (require.main === module) {
  docs();
}

module.exports = {
  docs,
  generateDocs,
  generateTypeScript
}; 