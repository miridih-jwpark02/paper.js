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
const QUnit = require('qunitjs');
const { JSDOM } = require('jsdom');

// QUnit 설정
QUnit.config.autostart = false;
QUnit.config.testTimeout = 20000;

// 결과 출력 설정
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

QUnit.done((details) => {
  console.log(`\nTotal: ${details.total}, Failed: ${details.failed}, Passed: ${details.passed}, Runtime: ${details.runtime}ms`);
  
  if (details.failed > 0) {
    process.exit(1);
  }
});

// JSDOM 환경 설정
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;

// __options 정의 (gulp 빌드 시스템에서 사용하던 옵션)
global.__options = {
  version: require('./package.json').version,
  paperScript: true
};

// Paper.js 로드
require('./dist/paper-full.js');
global.paper = window.paper;

// 테스트 파일 로드
const testDir = path.join(__dirname, 'test', 'tests');
const testFiles = fs.readdirSync(testDir)
  .filter(file => file.endsWith('.js') && file !== 'load.js');

// 헬퍼 로드
require('./test/helpers.js');

// 각 테스트 파일 로드
testFiles.forEach(file => {
  require(path.join(testDir, file));
});

// 테스트 시작
QUnit.start(); 