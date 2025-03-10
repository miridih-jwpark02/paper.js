#!/bin/bash

# Node.js 버전 확인 스크립트
# 이 스크립트는 nvm을 사용하여 적절한 Node.js 버전으로 빌드를 실행합니다.

# nvm이 설치되어 있는지 확인
if [ -z "$(command -v nvm)" ]; then
  if [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "nvm이 발견되었지만 활성화되지 않았습니다. 활성화합니다..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  else
    echo "nvm이 설치되어 있지 않습니다. 설치 방법:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
    echo "또는 https://github.com/nvm-sh/nvm#installing-and-updating 참조"
    exit 1
  fi
fi

# .nvmrc 파일에서 Node.js 버전 읽기
NODE_VERSION=$(cat .nvmrc)
echo "필요한 Node.js 버전: $NODE_VERSION"

# 필요한 Node.js 버전이 설치되어 있는지 확인
if ! nvm ls $NODE_VERSION > /dev/null 2>&1; then
  echo "Node.js $NODE_VERSION 버전을 설치합니다..."
  nvm install $NODE_VERSION
fi

# 필요한 Node.js 버전 사용
echo "Node.js $NODE_VERSION 버전을 사용합니다..."
nvm use $NODE_VERSION

# 현재 Node.js 버전 확인
CURRENT_NODE_VERSION=$(node -v)
echo "현재 Node.js 버전: $CURRENT_NODE_VERSION"

# pnpm이 설치되어 있는지 확인
if ! command -v pnpm &> /dev/null; then
  echo "pnpm이 설치되어 있지 않습니다. 설치합니다..."
  npm install -g pnpm
fi

# 의존성 설치
echo "의존성을 설치합니다..."
pnpm install

# 빌드 실행
echo "빌드를 실행합니다..."
pnpm run build

echo "빌드가 완료되었습니다." 