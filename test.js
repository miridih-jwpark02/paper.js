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

const { spawn } = require('child_process');
const path = require('path');

// 기본적으로 모든 테스트 실행
console.log('Running all tests...');

// Node.js 테스트 실행
console.log('Running Node.js tests...');
const nodeTest = spawn('node', ['test-node.js'], { stdio: 'inherit' });

nodeTest.on('close', (code) => {
  if (code !== 0) {
    console.error(`Node.js tests failed with code ${code}`);
    process.exit(code);
  }
  
  // Browser 테스트 실행
  console.log('Running browser tests...');
  const browserTest = spawn('node', ['test-browser.js'], { stdio: 'inherit' });
  
  browserTest.on('close', (code) => {
    if (code !== 0) {
      console.error(`Browser tests failed with code ${code}`);
      process.exit(code);
    }
    
    console.log('All tests completed successfully!');
  });
}); 