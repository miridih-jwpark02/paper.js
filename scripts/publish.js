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
const { dist } = require('./dist');
const { zip } = require('./dist');
const { load } = require('./load');

// 패키지 목록
const packages = ['paper-jsdom', 'paper-jsdom-canvas'];

/**
 * 버전 정보 업데이트 함수
 */
async function updateVersion() {
  console.log('버전 정보 업데이트 중...');
  
  try {
    // package.json 읽기
    const packagePath = path.join(__dirname, '../package.json');
    const packageJson = require(packagePath);
    
    // develop 브랜치에서 -develop 접미사 제거
    const version = packageJson.version.replace(/-develop$/, '');
    
    // package.json 업데이트
    packageJson.version = version;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`버전 정보 업데이트 완료: ${version}`);
    return version;
  } catch (err) {
    console.error('버전 정보 업데이트 실패:', err);
    return null;
  }
}

/**
 * 패키지 버전 업데이트 함수
 * @param {string} version - 업데이트할 버전
 */
async function updatePackages(version) {
  console.log('패키지 버전 업데이트 중...');
  
  try {
    for (const pkg of packages) {
      const pkgPath = path.join(__dirname, `../packages/${pkg}/package.json`);
      
      if (fs.existsSync(pkgPath)) {
        const pkgJson = require(pkgPath);
        
        // 버전 업데이트
        pkgJson.version = version;
        
        // 의존성 업데이트
        if (pkgJson.dependencies && pkgJson.dependencies.paper) {
          pkgJson.dependencies.paper = version;
        }
        
        // 파일 저장
        fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
        console.log(`  - ${pkg} 버전 업데이트 완료: ${version}`);
      }
    }
    
    console.log('패키지 버전 업데이트 완료!');
    return true;
  } catch (err) {
    console.error('패키지 버전 업데이트 실패:', err);
    return false;
  }
}

/**
 * Git 커밋 및 태그 생성 함수
 * @param {string} version - 태그 버전
 */
async function commitAndTag(version) {
  console.log('Git 커밋 및 태그 생성 중...');
  
  try {
    const releaseMessage = `Release version ${version}`;
    
    // yarn.lock 업데이트
    execSync('pnpm install', { stdio: 'inherit' });
    
    // 변경사항 커밋
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "${releaseMessage}"`, { stdio: 'inherit' });
    
    // 태그 생성
    execSync(`git tag -a v${version} -m "${releaseMessage}"`, { stdio: 'inherit' });
    
    console.log('Git 커밋 및 태그 생성 완료!');
    return true;
  } catch (err) {
    console.error('Git 커밋 및 태그 생성 실패:', err);
    return false;
  }
}

/**
 * 릴리스 배포 함수
 */
async function release() {
  console.log('릴리스 배포 중...');
  
  try {
    // master 브랜치로 전환
    execSync('git checkout master', { stdio: 'inherit' });
    
    // develop 브랜치 병합
    execSync('git merge develop -X theirs', { stdio: 'inherit' });
    
    // 변경사항 푸시
    execSync('git push origin master develop --tags', { stdio: 'inherit' });
    
    // npm 배포
    execSync('pnpm publish', { stdio: 'inherit' });
    
    // 패키지 배포
    for (const pkg of packages) {
      execSync(`cd packages/${pkg} && pnpm publish`, { stdio: 'inherit' });
    }
    
    console.log('릴리스 배포 완료!');
    return true;
  } catch (err) {
    console.error('릴리스 배포 실패:', err);
    return false;
  }
}

/**
 * 웹사이트 업데이트 함수
 * @param {string} version - 업데이트할 버전
 */
async function updateWebsite(version) {
  console.log('웹사이트 업데이트 중...');
  
  try {
    const sitePath = path.resolve(__dirname, '../../paperjs.org');
    
    // 웹사이트 디렉토리 확인
    if (!fs.existsSync(sitePath)) {
      console.log('웹사이트 디렉토리를 찾을 수 없습니다. 건너뜁니다.');
      return true;
    }
    
    // 웹사이트 package.json 업데이트
    const sitePackagePath = path.join(sitePath, 'package.json');
    if (fs.existsSync(sitePackagePath)) {
      const sitePackageJson = require(sitePackagePath);
      sitePackageJson.version = version;
      fs.writeFileSync(sitePackagePath, JSON.stringify(sitePackageJson, null, 2) + '\n');
    }
    
    // 문서 복사
    const referencePath = path.join(sitePath, 'content/08-Reference');
    const serverDocsPath = path.join(__dirname, '../dist/serverdocs');
    
    // 기존 문서 삭제
    if (fs.existsSync(referencePath)) {
      fs.rmSync(referencePath, { recursive: true, force: true });
    }
    
    // 새 문서 복사
    if (fs.existsSync(serverDocsPath)) {
      execSync(`cp -r ${serverDocsPath}/* ${referencePath}`, { stdio: 'inherit' });
    }
    
    // zip 파일 복사
    const downloadPath = path.join(sitePath, 'content/11-Download');
    const zipPath = path.join(__dirname, '../dist/paperjs.zip');
    
    if (fs.existsSync(zipPath) && fs.existsSync(downloadPath)) {
      execSync(`cp ${zipPath} ${downloadPath}/paperjs-v${version}.zip`, { stdio: 'inherit' });
    }
    
    // 자산 복사
    const assetPath = path.join(sitePath, 'assets/js/paper.js');
    const fullPath = path.join(__dirname, '../dist/paper-full.js');
    
    if (fs.existsSync(fullPath)) {
      // 기존 파일 삭제
      if (fs.existsSync(assetPath)) {
        fs.unlinkSync(assetPath);
      }
      
      // 새 파일 복사
      fs.copyFileSync(fullPath, assetPath);
    }
    
    // 웹사이트 변경사항 커밋
    const releaseMessage = `Release version ${version}`;
    
    execSync('git add .', { cwd: sitePath, stdio: 'inherit' });
    execSync(`git commit -m "${releaseMessage}"`, { cwd: sitePath, stdio: 'inherit' });
    execSync(`git tag -a v${version} -m "${releaseMessage}"`, { cwd: sitePath, stdio: 'inherit' });
    execSync('git push origin master --tags', { cwd: sitePath, stdio: 'inherit' });
    
    console.log('웹사이트 업데이트 완료!');
    return true;
  } catch (err) {
    console.error('웹사이트 업데이트 실패:', err);
    return false;
  }
}

/**
 * 개발 브랜치 복원 함수
 */
async function restoreDevelop() {
  console.log('개발 브랜치 복원 중...');
  
  try {
    // develop 브랜치로 전환
    execSync('git checkout develop', { stdio: 'inherit' });
    
    // 개발 모드 로드
    await load();
    
    // 변경사항 커밋
    execSync('git add dist', { stdio: 'inherit' });
    execSync('git commit -m "Switch back to load.js versions on develop branch."', { stdio: 'inherit' });
    execSync('git push origin develop', { stdio: 'inherit' });
    
    console.log('개발 브랜치 복원 완료!');
    return true;
  } catch (err) {
    console.error('개발 브랜치 복원 실패:', err);
    return false;
  }
}

/**
 * 배포 메인 함수
 */
async function publish() {
  console.log('Paper.js 배포 시작...');
  
  try {
    // 현재 브랜치 확인
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    if (currentBranch !== 'develop') {
      throw new Error('배포는 develop 브랜치에서만 가능합니다.');
    }
    
    // 1. 버전 정보 업데이트
    const version = await updateVersion();
    if (!version) {
      throw new Error('버전 정보 업데이트 실패');
    }
    
    // 2. 패키지 버전 업데이트
    await updatePackages(version);
    
    // 3. 배포 파일 생성
    await dist();
    
    // 4. Git 커밋 및 태그 생성
    await commitAndTag(version);
    
    // 5. 웹사이트 업데이트
    await updateWebsite(version);
    
    // 6. 릴리스 배포
    await release();
    
    // 7. 개발 브랜치 복원
    await restoreDevelop();
    
    console.log('Paper.js 배포 완료!');
    return true;
  } catch (err) {
    console.error('배포 실패:', err);
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우에만 publish 함수 호출
if (require.main === module) {
  publish();
}

module.exports = {
  publish,
  updateVersion,
  updatePackages,
  commitAndTag,
  release,
  updateWebsite,
  restoreDevelop
}; 