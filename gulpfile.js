/* eslint-disable */
'use strict';

var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    mocha = require('gulp-mocha'),
    qunit = require('./index');

var paths = {
    scripts: ['./*.js', '!./gulpfile.js']
};

gulp.task('lint', function () {
    return gulp.src(paths.scripts)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', function () {
    return gulp.src('./test/*.js')
        .pipe(mocha());
});

gulp.task('qunit:pass', function () {
    return gulp.src('./test/fixtures/passing.html')
        .pipe(qunit());
});

gulp.task('qunit:fail', function () {
    return gulp.src('./test/fixtures/failing.html')
        .pipe(qunit())
        .on('error', function (err) {
            console.log(err.toString());
            this.emit('end');
        });
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, gulp.parallel('lint', 'test'));
});

gulp.task('default', gulp.parallel('lint', 'test', 'watch'));
