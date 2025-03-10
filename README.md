# Paper.js - The Swiss Army Knife of Vector Graphics Scripting [![Build Status](https://travis-ci.org/paperjs/paper.js.svg?branch=develop)](https://travis-ci.org/paperjs/paper.js) [![NPM](https://img.shields.io/npm/v/paper.svg)](https://www.npmjs.com/package/paper)

If you want to work with Paper.js, simply download the latest "stable" version
from [http://paperjs.org/download/](http://paperjs.org/download/)

- Website: <http://paperjs.org/>
- Questions: <https://stackoverflow.com/questions/tagged/paperjs>
- Discussion forum: <https://groups.google.com/group/paperjs>
- Mainline source code: <https://github.com/paperjs/paper.js>
- Twitter: [@paperjs](https://twitter.com/paperjs)
- Latest releases: <http://paperjs.org/download/>
- Pre-built development versions:
  [`prebuilt/module`](https://github.com/paperjs/paper.js/tree/prebuilt/module)
  and [`prebuilt/dist`](https://github.com/paperjs/paper.js/tree/prebuilt/dist)
  branches.

## Installing Paper.js

The recommended way to install and maintain Paper.js as a dependency in your
project is through the [Node.js Package Manager (NPM)](https://www.npmjs.com/)
for browsers, Node.js or Electron.

If NPM is already installed, simply type one of these commands in your project
folder:

```sh
npm install paper
```

Upon execution, you will find a `paper` folder inside the project's
`node_modules` folder.

For more information on how to install Node.js and NPM, read the chapter
[Installing Node.js and NPM](#installing-nodejs-and-npm).

### Which Version to Use

The various distributions come with two different pre-build versions of
Paper.js, in minified and normal variants:

- `paper-full.js` – The full version for the browser, including PaperScript
  support and Acorn.js
- `paper-core.js` – The core version for the browser, without PaperScript
  support nor Acorn.js. You can use this to shave off some bytes and compilation
  time when working with JavaScript directly.

### Installing Node.js and NPM

Node.js comes with the Node Package Manager (NPM). There are many tutorials
explaining the different ways to install Node.js on different platforms. It is
generally not recommended to install Node.js through OS-supplied package
managers, as the its development cycles move fast and these versions are often
out-of-date.

On macOS, [Homebrew](https://brew.sh/) is a good option if one version of
Node.js that is kept up to date with `brew upgrade` is enough:  
<https://treehouse.github.io/installation-guides/mac/node-mac.html>

[NVM](https://github.com/creationix/nvm) can be used instead to install and
maintain multiple versions of Node.js on the same platform, as often required by
different projects:  
<https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/>

Homebrew is recommended on macOS also if you intend to install Paper.js with
rendering to the Canvas on Node.js, as described in the next paragraph.

For Linux, see <https://nodejs.org/download/> to locate 32-bit and 64-bit
Node.js binaries as well as sources, or use NVM, as described in the paragraph
above.

### Installing Paper.js Using NPM

Paper.js comes in three different versions on NPM: `paper`, `paper-jsdom` and
`paper-jsdom-canvas`. Depending on your use case, you need to required a
different one:

- `paper` is the main library, and can be used directly in a browser
  context, e.g. a web browser or worker.
- `paper-jsdom` is a shim module for Node.js, offering headless use with SVG
  importing and exporting through [jsdom](https://github.com/tmpvar/jsdom).
- `paper-jsdom-canvas` is a shim module for Node.js, offering canvas rendering
  through [Node-Canvas](https://github.com/Automattic/node-canvas) as well as
  SVG importing and exporting through [jsdom](https://github.com/tmpvar/jsdom).

In order to install `paper-jsdom-canvas`, you need the [Cairo Graphics
library](https://cairographics.org/) installed in your system:

### Installing Native Dependencies

Paper.js relies on [Node-Canvas](https://github.com/Automattic/node-canvas) for
rendering, which in turn relies on the native libraries
[Cairo](https://cairographics.org/) and [Pango](https://www.pango.org/).

#### Installing Native Dependencies on macOS

Paper.js relies on Node-Canvas for rendering, which in turn relies on Cairo and
Pango. The easiest way to install Cairo is through
[Homebrew](https://brew.sh/), by issuing the command:

    brew install cairo pango

Note that currently there is an issue on macOS with Cairo. If the above causes
errors, the following will most likely fix it:

    PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig/ npm install paper

Also, whenever you would like to update the modules, you will need to execute:

    PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig/ npm update

If you keep forgetting about this requirement, or would like to be able to type
simple and clean commands, add this to your `.bash_profile` file:

    # PKG Config for Pango / Cairo
    export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig

After adding this line, your commands should work in the expected way:

    npm install paper
    npm update

#### Installing Native Dependencies on Debian/Ubuntu Linux

    sudo apt-get install pkg-config libcairo2-dev libpango1.0-dev libssl-dev libjpeg62-dev libgif-dev

You might also need to install the build-essential package if you don't usually
build from c++ sources:

    sudo apt-get install build-essential

#### Installing Native Dependencies for Electron

In order to build Node-Canvas for use of `paper-jsdom-canvas` in Electron, which
is likely to use a different version of V8 than the Node binary installed in
your system, you need to manually specify the location of Electron's headers.
Follow these steps to do so:

[Electron — Using Native Node
Modules](https://electron.atom.io/docs/tutorial/using-native-node-modules/)

#### After Native Dependencies have been installed

You should now be able to install the Paper.js module with jsdom and Canvas
rendering from NPM:

    npm install paper-jsdom-canvas

## Node.js 호환성 안내

이 프로젝트는 Node.js 14 버전과 Node.js 20 이상 버전에서 모두 작동합니다.

### Node.js 20+ 사용 방법

Node.js 20 이상 버전에서는 다음 명령어로 빌드할 수 있습니다:

```
pnpm install
pnpm build
```

이 방법은 Vite를 사용하여 빌드하므로 더 빠르고 현대적인 빌드 환경을 제공합니다. 또한 ES 모듈 형식의 출력도 생성합니다.

또는 다음 명령어로 직접 빌드 스크립트를 사용할 수도 있습니다:

```
pnpm install
pnpm build:direct
```

### Node.js 14 사용 방법 (기존 방식)

여전히 Node.js 14 버전을 사용하고 싶다면 다음과 같이 할 수 있습니다:

1. [nvm(Node Version Manager)](https://github.com/nvm-sh/nvm)을 설치하세요.
2. 프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 적절한 Node.js 버전을 설치하고 사용하세요:
   ```
   nvm install 14
   nvm use 14
   ```
3. 그 후 빌드 명령어를 실행하세요:
   ```
   pnpm install
   pnpm build:gulp
   ```

## Development

The main Paper.js source tree is hosted on
[GitHub](https://github.com/paperjs/paper.js/). `git` is required to create a
clone of the repository, and can be easily installed through your preferred
package manager on your platform.

### Get the Source

    git clone --recursive git://github.com/paperjs/paper.js.git
    cd paper.js

To refresh your clone and fetch changes from origin, run:

    git fetch origin

To update the `jsdoc-toolkit` submodule, used to generate the documentation,
run:

    git submodule update  --init --recursive

### Setting Up For Building

Paper.js uses [Gulp.js](https://gulpjs.com/) for building, and has a couple of
dependencies as NPM modules. Read the chapter [Installing Node.js and
NPM](#installing-nodejs-and-npm) if you still need to install these.

Due to a conflict in Gulp 3 that could only be resolved using package
resolution, we recently switched from NPM to `yarn` for development, which also
needs to be installed now. See
[Installing Yarn](https://classic.yarnpkg.com/en/docs/install/) for details.

In order to be able to build Paper.js, after checking out the repository, paper
has dependencies that need to be installed. Install them by issuing the
following commands from the Paper.js directory:

    yarn install

### Building the Library

The Paper.js sources are distributed across many separate files, organised in
subfolders inside the `src` folder. To compile them all into distributable
files, you can run the `build` task:

    yarn build

You will then find the built library files inside the `dist` folder, named
`paper-full.js` and `paper-core.js`, along with their minified versions. Read
more about this in [Which Version to Use?](#which-version-to-use).

### Running Directly from Separate Source Files

As a handy alternative to building the library after each change to try it out
in your scripts, there is the `load` task, that replaces the built libraries
with symbolic links to the `scrc/load.js` script. This script then load the
library directly from all the separate source files in the `src` folder, through
the [Prepro.js](https://github.com/lehni/prepro.js) JavaScript preprocessing
library.

This means you can switch between loading from sources and loading a built
library simply by running.

    yarn load

And to go back to a built library

    yarn build

Note that your PaperScripts examples do not need to change, they can keep
loading `dist/paper-full.js`, which will always do the right thing. Note also
that `src/load.js` handles both browsers and Node.js, as supported by Prepro.js.

### Other Build Tasks

Create a final zipped distribution file inside the `dist` folder:

    yarn dist

### Branch structure

Since the release of version `0.9.22`, Paper.js has adopted aspects of the Git-
Flow workflow. All development is taking place in the
[`develop`](https://github.com/paperjs/paper.js/tree/develop) branch, which is
only merged into [`master`](https://github.com/paperjs/paper.js/tree/master)
when a new release occurs.

As of version `0.9.26`, the `dist` folder is excluded on all branches, and the
building is now part of the `yarn publish` process by way of the `prepublish`
script.

We also offer prebuilt versions of the latest state of the `develop` branch on
[`prebuilt/module`](https://github.com/paperjs/paper.js/tree/prebuilt/module)
and [`prebuilt/dist`](https://github.com/paperjs/paper.js/tree/prebuilt/dist).

### Building the Documentation

Similarly to building the library, you can run the `docs` task to build the
documentation:

    yarn docs

Your docs will then be located at `dist/docs`.

### Testing

Paper.js was developed and tested from day 1 using proper unit testing through
jQuery's [Qunit](https://qunitjs.com/). To run the tests after any
change to the library's source, simply open `index.html` inside the `test`
folder in your web browser. There should be a green bar at the top, meaning all
tests have passed. If the bar is red, some tests have not passed. These will be
highlighted and become visible when scrolling down.

If you are testing on Chrome, some of the tests will fail due to the browser's
CORS restrictions. In order to run the browser based tests on Chrome, you need
to run a local web-server through Gulp.js. The following command will handle it
for you, and will also open the browser at the right address straight away:

    yarn test:browser

You can also run the unit tests through PhantomJS in Gulp directly on the
command line:

    yarn test:phantom

To test the Node.js version of Paper.js, use this command:

    yarn test:node

And to test both the PhantomJS and Node.js environments together, simply run:

    yarn test

### Contributing [![Open Source Helpers](https://www.codetriage.com/paperjs/paper.js/badges/users.svg)](https://www.codetriage.com/paperjs/paper.js)

The main Paper.js source tree is hosted on GitHub, thus you should create a fork
of the repository in which you perform development. See
<https://help.github.com/articles/fork-a-repo/>.

We prefer that you send a
[pull request on GitHub](https://help.github.com/articles/about-pull-requests/) 
which will then be merged into the official main line repository.
You need to sign the Paper.js CLA to be able to contribute (see below).

Also, in your first contribution, add yourself to the end of `AUTHORS.md` (which
of course is optional).

In addition to contributing code you can also triage issues which may include
reproducing bug reports or asking for vital information, such as version numbers
or reproduction instructions. If you would like to start triaging issues, one
easy way to get started is to
[subscribe to paper.js on CodeTriage](https://www.codetriage.com/paperjs/paper.js).

**Get the source (for contributing):**

If you want to contribute to the project you will have to [make a
fork](https://help.github.com/articles/fork-a-repo/). Then do this:

    git clone --recursive git@github.com:yourusername/paper.js.git
    cd paper.js
    git remote add upstream git@github.com:paperjs/paper.js.git

To then fetch changes from upstream, run

    git fetch upstream

#### Creating and Submitting a Patch

As mentioned above, we prefer that you send a
[pull request](https://help.github.com/articles/about-pull-requests/) on GitHub:

1. Create a fork of the upstream repository by visiting
   <https://github.com/paperjs/paper.js/fork>. If you feel insecure, here's a
   great guide: <https://help.github.com/articles/fork-a-repo/>

2. Clone of your repository: `git clone
   https://yourusername@github.com/yourusername/paper.js.git`

3. This is important: Create a so-called *topic branch* based on the `develop`
   branch: `git checkout -tb name-of-my-patch develop` where `name-of-my-patch`
   is a short but descriptive name of the patch you're about to create. Don't
   worry about the perfect name though -- you can change this name at any time
   later on.

4. Hack! Make your changes, additions, etc., commit them then push them to your
   GitHub fork: `git push origin name-of-my-patch`

5. Send a pull request to the upstream repository's owner by visiting your
   repository's site at GitHub (i.e. https://github.com/yourusername/paper.js)
   and press the "Pull Request" button. Make sure you are creating the pull
   request to the `develop` branch, not the `master` branch. Here's a good guide
   on pull requests: <https://help.github.com/articles/about-pull-requests/>

##### Use one topic branch per feature:

Don't mix different kinds of patches in the same branch. Instead, merge them all
together into your `develop` branch (or develop everything in your `develop`
branch and then cherry-pick-and-merge into the different topic branches). Git
provides for an extremely flexible workflow, which in many ways causes more
confusion than it helps you when new to collaborative software development. The
guides provided by GitHub at <https://help.github.com/> are a really good
starting point and reference. If you are fixing an issue, a convenient way to
name the branch is to use the issue number as a prefix, like this: `git checkout
-tb issue-937-feature-add-text-styling`.

#### Contributor License Agreement

Before we can accept any contributions to Paper.js, you need to sign this
[CLA](https://en.wikipedia.org/wiki/Contributor_License_Agreement):

[Contributor License Agreement](https://spreadsheets.google.com/a/paperjs.org/spreadsheet/embeddedform?formkey=dENxd0JBVDY2REo3THVuRmh4YjdWRlE6MQ)

> The purpose of this agreement is to clearly define the terms under which
> intellectual property has been contributed to Paper.js and thereby allow us to
> defend the project should there be a legal dispute regarding the software at
> some future time.

For a list of authors and contributors, please see 
[AUTHORS](https://github.com/paperjs/paper.js/blob/master/AUTHORS.md).

## License

Distributed under the MIT license. See 
[LICENSE](https://github.com/paperjs/paper.js/blob/master/LICENSE.txt)
for details.

## 개요

Paper.js는 HTML5 Canvas 위에서 동작하는 벡터 그래픽 스크립팅 프레임워크입니다. 이 프로젝트는 [Scriptographer](http://scriptographer.org)의 핵심 아이디어를 기반으로 하며, 완전히 새롭게 설계되고 구현되었습니다.

## 빌드 시스템

Paper.js는 Vite를 사용하여 빌드됩니다. 다음 명령어를 사용하여 프로젝트를 빌드하고 개발할 수 있습니다.

### 설치

```bash
pnpm install
```

### 빌드

```bash
pnpm build
```

이 명령어는 다음 파일들을 생성합니다:
- `dist/paper-full.js`: PaperScript 기능을 포함한 전체 버전
- `dist/paper-core.js`: PaperScript 기능을 제외한 코어 버전
- `dist/paper-full.min.js`: 압축된 전체 버전
- `dist/paper-core.min.js`: 압축된 코어 버전
- `dist/paper-full.es.js`: ES 모듈 형식의 전체 버전
- `dist/paper-core.es.js`: ES 모듈 형식의 코어 버전

### 압축

```bash
pnpm minify
```

이 명령어는 빌드된 파일들을 압축합니다.

### 배포 파일 생성

```bash
pnpm dist
```

이 명령어는 빌드, 압축, 문서 생성을 모두 수행하여 배포 파일을 생성합니다.

### 개발 모드

```bash
pnpm load
```

이 명령어는 개발 모드에서 소스 파일을 직접 로드하기 위한 심볼릭 링크를 생성합니다.

### 파일 변경 감시

```bash
pnpm watch
```

이 명령어는 소스 파일의 변경을 감시하고, 변경이 감지되면 자동으로 빌드를 실행합니다. 또한 개발 서버를 실행하여 예제를 확인할 수 있습니다.

### 문서 생성

```bash
pnpm docs
```

이 명령어는 API 문서와 TypeScript 정의 파일을 생성합니다.

## 라이선스

Paper.js는 MIT 라이선스로 배포됩니다. 자세한 내용은 [LICENSE.txt](LICENSE.txt) 파일을 참조하세요.

## 기여

Paper.js에 기여하고 싶다면, [GitHub 저장소](https://github.com/paperjs/paper.js)에서 이슈를 제기하거나 풀 리퀘스트를 보내주세요.

## 웹사이트

Paper.js 웹사이트는 [http://paperjs.org](http://paperjs.org)에서 확인할 수 있습니다.
