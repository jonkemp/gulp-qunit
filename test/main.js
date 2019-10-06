/* eslint-disable */
/* global describe, it */

'use strict';

var assert = require('assert'),
    stripAnsi = require('strip-ansi'),
    Vinyl = require('vinyl'),
    path = require('path'),
    qunit = require('../index'),
    out = process.stdout.write.bind(process.stdout);

describe('gulp-qunit', function() {
    this.timeout(10000);

    it('tests should pass', function(done) {
        var stream = qunit();

        process.stdout.write = function (str) {
            //out(str);
            str = stripAnsi(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                done();
            }
        };

        stream.write(new Vinyl({
            path: './test/fixtures/passing.html',
            contents: Buffer.from('')
        }));

        stream.end();
    });

    it('tests should fail', function(done) {
        var stream = qunit();

        process.stdout.write = function (str) {
            //out(str);
            str = stripAnsi(str);

            if (/10 passed. 1 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                done();
            }
        };

        stream.write(new Vinyl({
            path: './test/fixtures/failing.html',
            contents: Buffer.from('')
        }));

        stream.end();
    });

    it('tests should not be affected by console.log in test code', function(done) {
        var stream = qunit();

        process.stdout.write = function (str) {
            //out(str);
            str = stripAnsi(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                done();
            }
        };

        stream.write(new Vinyl({
            path: './test/fixtures/console-log.html',
            contents: Buffer.from('')
        }));

        stream.end();
    });

    it('tests should pass with options', function(done) {
        var stream = qunit({'phantomjs-options': ['--ssl-protocol=any']});

        process.stdout.write = function (str) {
            //out(str);
            str = stripAnsi(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                done();
            }
        };

        stream.write(new Vinyl({
            path: './test/fixtures/passing.html',
            contents: Buffer.from('')
        }));

        stream.end();
    });

    it('tests should pass with more than one options', function(done) {
        var stream = qunit({'phantomjs-options': ['--ignore-ssl-errors=true', '--web-security=false']});

        process.stdout.write = function (str) {
            str = stripAnsi(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                done();
            }
        };

        stream.write(new Vinyl({
            path: './test/fixtures/passing.html',
            contents: Buffer.from('')
        }));

        stream.end();
    });

    it('should set custom viewport', function (done) {
        var stream = qunit({'page': {
                viewportSize: { width: 1280, height: 800 }
            }});

        process.stdout.write = function (str) {
            //out(str);
            str = stripAnsi(str);

            if (/2 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                done();
            }
        };

        stream.write(new Vinyl({
            path: './test/fixtures/custom-viewport.html',
            contents: Buffer.from('')
        }));

        stream.end();
    });

    it('tests should time out', function(done) {
        this.timeout(10000);

        var stream = qunit({ 'timeout': 1 });

        process.stdout.write = function (str) {
            //out(str);

            if (/The specified timeout of 1 seconds has expired. Aborting.../.test(str)) {
                assert(true);
                process.stdout.write = out;
                done();
            }
        };

        stream.on('error', function () {});

        stream.write(new Vinyl({
            path: './test/fixtures/async.html',
            contents: Buffer.from('')
        }));

        stream.end();
    });

    it('tests should not run when passing --help to PhantomJS', function(done) {
        var stream = qunit({'phantomjs-options': ['--help']});

        process.stdout.write = function (str) {
            //out(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(false, 'No tests should run when passing --help to PhantomJS');
                process.stdout.write = out;
                done();
                return;
            }

            var lines = str.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/.*--help.*Shows this message and quits/.test(line)) {
                    assert(true);
                    process.stdout.write = out;
                    done();
                }
            }
        };

        stream.write(new Vinyl({
            path: './test/fixtures/passing.html',
            contents: Buffer.from('')
        }));

        stream.end();
    });

    it('tests should pass with absolute source paths', function(done) {
        var stream = qunit();

        process.stdout.write = function (str) {
            //out(str);
            str = stripAnsi(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                done();
            }
        };

        stream.write(new Vinyl({
            path: path.resolve('./test/fixtures/passing.html'),
            contents: Buffer.from('')
        }));

        stream.end();
    });

    it('tests should pass and emit finished event', function(done) {
        var stream = qunit();

        stream.on('gulp-qunit.finished', function() {
            assert(true, 'phantom finished with errors');
        });

        process.stdout.write = function (str) {
            //out(str);
            str = stripAnsi(str);

            if (/10 passed. 0 failed./.test(str)) {
                assert(true);
                process.stdout.write = out;
                done();
            }
        };

        stream.write(new Vinyl({
            path: path.resolve('./test/fixtures/passing.html'),
            contents: Buffer.from('')
        }));

        stream.end();
    });
});
