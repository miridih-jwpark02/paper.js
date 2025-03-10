#!/usr/bin/env node

/*
 * Paper.js - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Node.js 20+ 호환성을 위한 빌드 스크립트
 */

// Node.js 20+ 호환성을 위한 polyfill
if (!global.primordials) {
  global.primordials = {
    ArrayIsArray: Array.isArray,
    ArrayPrototypeForEach: Array.prototype.forEach,
    ArrayPrototypeIncludes: Array.prototype.includes,
    ArrayPrototypeIndexOf: Array.prototype.indexOf,
    ArrayPrototypeJoin: Array.prototype.join,
    ArrayPrototypeMap: Array.prototype.map,
    ArrayPrototypePush: Array.prototype.push,
    ArrayPrototypeSlice: Array.prototype.slice,
    ArrayPrototypeSplice: Array.prototype.splice,
    Boolean,
    Error,
    FunctionPrototypeCall: Function.prototype.call,
    FunctionPrototypeBind: Function.prototype.bind,
    MathFloor: Math.floor,
    Number,
    NumberIsFinite: Number.isFinite,
    NumberIsNaN: Number.isNaN,
    NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
    NumberParseInt: Number.parseInt,
    Object,
    ObjectAssign: Object.assign,
    ObjectCreate: Object.create,
    ObjectDefineProperty: Object.defineProperty,
    ObjectFreeze: Object.freeze,
    ObjectGetOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,
    ObjectGetOwnPropertyNames: Object.getOwnPropertyNames,
    ObjectGetPrototypeOf: Object.getPrototypeOf,
    ObjectIs: Object.is,
    ObjectKeys: Object.keys,
    ObjectPrototypeHasOwnProperty: Object.prototype.hasOwnProperty,
    ObjectPrototypePropertyIsEnumerable: Object.prototype.propertyIsEnumerable,
    ObjectPrototypeToString: Object.prototype.toString,
    ObjectSetPrototypeOf: Object.setPrototypeOf,
    ReflectApply: Reflect.apply,
    RegExp,
    RegExpPrototypeExec: RegExp.prototype.exec,
    RegExpPrototypeTest: RegExp.prototype.test,
    String,
    StringPrototypeCharCodeAt: String.prototype.charCodeAt,
    StringPrototypeEndsWith: String.prototype.endsWith,
    StringPrototypeIncludes: String.prototype.includes,
    StringPrototypeIndexOf: String.prototype.indexOf,
    StringPrototypeLastIndexOf: String.prototype.lastIndexOf,
    StringPrototypeMatch: String.prototype.match,
    StringPrototypeRepeat: String.prototype.repeat,
    StringPrototypeReplace: String.prototype.replace,
    StringPrototypeSlice: String.prototype.slice,
    StringPrototypeSplit: String.prototype.split,
    StringPrototypeStartsWith: String.prototype.startsWith,
    StringPrototypeSubstr: String.prototype.substr,
    StringPrototypeToLowerCase: String.prototype.toLowerCase,
    StringPrototypeTrim: String.prototype.trim,
    Symbol,
    SymbolFor: Symbol.for,
    SymbolIterator: Symbol.iterator,
    SymbolToStringTag: Symbol.toStringTag,
    TypedArrayPrototypeSet: Object.getPrototypeOf(Uint8Array.prototype).set,
  };
}

// SafeMap polyfill
global.SafeMap = class SafeMap extends Map {
  get(key) {
    return super.get(key);
  }
  
  set(key, value) {
    return super.set(key, value);
  }
};

// 패치된 패키지 확인
try {
  require('./patch-vinyl-fs');
  require('./patch-natives');
} catch (err) {
  console.warn('패치 스크립트 로드 실패:', err);
}

// Babel 등록
require('@babel/register')({
  // Node.js 내장 모듈은 변환하지 않음
  ignore: [/node_modules\/(?!vinyl-fs|graceful-fs|natives)/]
});

// Gulp 실행
const gulp = require('gulp');

// 모든 gulp 태스크 로드
require('./gulpfile');

// 빌드 태스크 실행
console.log('Running build task...');

// 직접 빌드 단계 실행
const del = require('del');
const fs = require('fs');
const path = require('path');

// 필요한 디렉토리 생성
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}
if (!fs.existsSync('dist/node')) {
  fs.mkdirSync('dist/node');
}

// 빌드 단계 실행
async function runBuild() {
  try {
    // 1. acorn 최소화
    await new Promise((resolve, reject) => {
      gulp.series('minify:acorn')((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 2. core 빌드
    await new Promise((resolve, reject) => {
      gulp.series('clean:build:core')((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 3. full 빌드
    await new Promise((resolve, reject) => {
      gulp.series('clean:build:full')((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 4. 노드 파일 복사
    await new Promise((resolve, reject) => {
      gulp.src(['src/node/*.js'])
        .pipe(gulp.dest('dist/node'))
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log('Build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

runBuild(); 