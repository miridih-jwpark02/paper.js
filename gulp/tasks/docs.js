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
    del = require('del'),
    rename = require('gulp-rename'),
    shell = require('gulp-shell'),
    options = require('../utils/options.js');

var docOptions = {
    local: 'docs', // Generates the offline docs
    server: 'serverdocs' // Generates the website templates for the online docs
};

// Gulp 4 문법으로 변경
gulp.task('docs', gulp.series('build:full', 'docs:local', 'docs:typescript', function() {
    return gulp.src('dist/paper-full.js')
        .pipe(rename({ basename: 'paper' }))
        .pipe(gulp.dest('dist/docs/assets/js/'));
}));

Object.keys(docOptions).forEach(function(name) {
    gulp.task('clean:docs:' + name, function() {
        return del(['dist/' + docOptions[name] + '/**']);
    });

    gulp.task('docs:' + name, gulp.series('clean:docs:' + name, function() {
        var mode = docOptions[name];
        return gulp.src('src')
            .pipe(shell(
                [
                    'java -cp jsrun.jar:lib/* JsRun app/run.js',
                    ' -c=conf/', name, '.conf ',
                    ' -D="renderMode:', mode, '" ',
                    ' -D="version:', options.version, '"'
                ].join(''),
                { cwd: 'gulp/jsdoc' })
            );
    }));
});

// The goal of the typescript task is to automatically generate a type
// definition for the library.
gulp.task('docs:typescript:clean:before', function() {
    return del('dist/paper.d.ts');
});

gulp.task('docs:typescript:build', function() {
    // First parse JSDoc comments and store parsed data in a temporary file...
    return gulp.src('src')
        .pipe(shell(
            [
                'java -cp jsrun.jar:lib/* JsRun app/run.js',
                ' -c=conf/typescript.conf ',
                ' -D="file:../../gulp/typescript/typescript-definition-data.json"',
                ' -D="version:', options.version, '"',
                ' -D="date:', options.date, '"'
            ].join(''),
            { cwd: 'gulp/jsdoc' })
        )
        // ...then generate definition from parsed data...
        .pipe(shell('node gulp/typescript/typescript-definition-generator.js'))
        // ...finally test the definition by compiling a typescript file.
        .pipe(shell('node node_modules/typescript/bin/tsc --project gulp/typescript'));
});

gulp.task('docs:typescript:clean:after', function() {
    return del([
        'gulp/typescript/typescript-definition-data.json',
        'gulp/typescript/typescript-definition-test.js'
    ]);
});

gulp.task('docs:typescript', gulp.series('build:full', 'docs:typescript:clean:before', 'docs:typescript:build', 'docs:typescript:clean:after'));
