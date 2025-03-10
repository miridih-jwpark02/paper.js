/*
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

var gulp = require('gulp'),
    qunits = require('gulp-qunits'),
    webserver = require('gulp-webserver');

// Gulp 4 문법으로 변경
gulp.task('test', gulp.parallel('test:phantom', 'test:node'));

gulp.task('test:phantom', gulp.series('minify:acorn', function() {
    return gulp.src('index.html', { cwd: 'test' })
        .pipe(qunits({
            checkGlobals: true,
            timeout: 40
        }));
}));

gulp.task('test:node', gulp.series('minify:acorn', function() {
    return gulp.src('load.js', { cwd: 'test' })
        .pipe(qunits({
            require: [
                // To dynamically load the tests files from the sources, we need
                // to require Prepro.js first.
                'prepro/lib/node.js',
                // Note that loading dist/paper-full.js also works in
                // combination with `gulp load`, in which case Prepro.js is
                // present and handles the loading transparently.
                { path: '../dist/paper-full.js', namespace: 'paper' }
            ],
            timeout: 40
        }));
}));

gulp.task('test:browser', gulp.series('minify:acorn', function() {
    return gulp.src('.')
        .pipe(webserver({
            open: '/test'
        }));
}));

