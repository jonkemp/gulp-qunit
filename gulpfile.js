/* eslint-disable */
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const qunit = require('./index');

const paths = {
    scripts: ['./*.js', '!./gulpfile.js']
};

gulp.task('lint', () => gulp.src(paths.scripts)
    .pipe(eslint({fix: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()));

gulp.task('test', () => gulp.src('./test/*.js')
    .pipe(mocha()));

gulp.task('qunit:pass', () => gulp.src('./test/fixtures/passing.html')
    .pipe(qunit()));

gulp.task('qunit:fail', () => gulp.src('./test/fixtures/failing.html')
    .pipe(qunit())
    .on('error', function (err) {
        console.log(err.toString());
        this.emit('end');
    }));

gulp.task('watch', () => {
    gulp.watch(paths.scripts, gulp.parallel('lint', 'test'));
});

gulp.task('default', gulp.parallel('lint', 'test', 'watch'));
