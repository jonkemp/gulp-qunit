/* jshint node: true */
/* global describe, it */

'use strict';

var assert = require('assert'),
    gutil = require('gulp-util'),
    path = require('path'),
    qunit = require('../index'),
    out = process.stdout.write.bind(process.stdout);

describe('gulp-qunit', function() {
    it('tests should pass', function(cb) {
        this.timeout(5000);

        var stream = qunit();

        process.stdout.write = function (str) {
            //out(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                cb();
            }
        };

        stream.write(new gutil.File({
            path: './test/fixtures/passing.html',
            contents: new Buffer('')
        }));

        stream.end();
    });

    it('tests should pass with options', function(cb) {
        this.timeout(5000);

        var stream = qunit({'phantomjs-options': ['--ssl-protocol=any']});

        process.stdout.write = function (str) {
            //out(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                cb();
            }
        };

        stream.write(new gutil.File({
            path: './test/fixtures/passing.html',
            contents: new Buffer('')
        }));

        stream.end();
    });

    it('tests should time out', function(cb) {
        this.timeout(10000);

        var stream = qunit({ 'timeout': 1 });

        process.stdout.write = function (str) {
            //out(str);

            if (/The specified timeout of 1 seconds has expired. Aborting.../.test(str)) {
                assert(true);
                process.stdout.write = out;
                cb();
            }
        };

        stream.on('error', function () {});

        stream.write(new gutil.File({
            path: './test/fixtures/async.html',
            contents: new Buffer('')
        }));

        stream.end();
    });

    it('tests should not run when passing --help to PhantomJS', function(cb) {
        this.timeout(5000);

        var stream = qunit({'phantomjs-options': ['--help']});

        process.stdout.write = function (str) {
            //out(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(false, 'No tests should run when passing --help to PhantomJS');
                process.stdout.write = out;
                cb();
                return;
            }

            var lines = str.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/.*--help.*Shows this message and quits/.test(line)) {
                    assert(true);
                    process.stdout.write = out;
                    cb();
                }
            }
        };

        stream.write(new gutil.File({
            path: './test/fixtures/passing.html',
            contents: new Buffer('')
        }));

        stream.end();
    });

    it('tests should pass with absolute source paths', function(cb) {
        this.timeout(5000);

        var stream = qunit();

        process.stdout.write = function (str) {
            //out(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                cb();
            }
        };

        stream.write(new gutil.File({
            path: path.resolve('./test/fixtures/passing.html'),
            contents: new Buffer('')
        }));

        stream.end();
    });

    it('tests should pass and emit finished event', function(cb) {
        this.timeout(5000);

        var stream = qunit();

        stream.on('gulp-qunit.finished', function() {
            assert(true, 'phantom finished with errors');
        });

        process.stdout.write = function (str) {
            //out(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                cb();
            }
        };

        stream.write(new gutil.File({
            path: path.resolve('./test/fixtures/passing.html'),
            contents: new Buffer('')
        }));

        stream.end();
    });
});
