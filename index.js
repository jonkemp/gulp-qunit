'use strict';

var path = require('path'),
    childProcess = require('child_process'),
    gutil = require('gulp-util'),
    chalk = require('chalk'),
    through = require('through2'),
    phantomjs = require('phantomjs-prebuilt'),
    binPath = phantomjs.path;

module.exports = function (params) {
    var options = params || {};

    binPath = options.binPath || binPath;

    return through.obj(function (file, enc, cb) {
        var absolutePath = path.resolve(file.path),
            isAbsolutePath = absolutePath.indexOf(file.path) >= 0,
            queryParams = [],
            childArgs = [];

        if (options.noGlobals) {
            queryParams.push('noglobals');
        }

        if (options.noTryCatch) {
            queryParams.push('notrycatch');
        }

        if (options['phantomjs-options'] && options['phantomjs-options'].length) {
            if (Array.isArray(options['phantomjs-options'])) {
                childArgs = childArgs.concat(options['phantomjs-options']);
            } else {
                childArgs.push(options['phantomjs-options']);
            }
        }

        childArgs.push(
            require.resolve('qunit-phantomjs-runner'),
            (isAbsolutePath ? 'file:///' + absolutePath.replace(/\\/g, '/') : file.path) +
                (queryParams.length ? '?' + queryParams.join('&') : '')
        );

        if (options.timeout) {
            childArgs.push(options.timeout);
        }

        if (options.page) {
            // Push default timeout value unless specified otherwise
            if (!options.timeout) {
                childArgs.push(5);
            }

            childArgs.push(JSON.stringify(options.page));
        }

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-qunit', 'Streaming not supported'));
            return;
        }

        childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
            var passed = true,
                out,
                result,
                color,
                test;

            gutil.log('Testing ' + file.relative);

            if (stdout) {
                try {
                    stdout.trim().split('\n').forEach(function (line) {
                        if (line.indexOf('{') !== -1) {
                            out = JSON.parse(line.trim());
                            result = out.result;

                            color = result.failed > 0 ? chalk.red : chalk.green;

                            gutil.log('Took ' + result.runtime + ' ms to run ' + chalk.blue(result.total) + ' tests. ' + color(result.passed + ' passed, ' + result.failed + ' failed.'));

                            if (out.exceptions) {
                                for (test in out.exceptions) {
                                    gutil.log('\n' + chalk.red('Test failed') + ': ' + chalk.red(test) + ': \n' + out.exceptions[test].join('\n  '));
                                }
                            }
                        } else {
                            gutil.log(line.trim());
                        }
                    });
                } catch (e) {
                    this.emit('error', new gutil.PluginError('gulp-qunit', e));
                }
            }

            if (stderr) {
                gutil.log(stderr);
                this.emit('error', new gutil.PluginError('gulp-qunit', stderr));
                passed = false;
            }

            if (err) {
                gutil.log('gulp-qunit: ' + chalk.red('✖ ') + 'QUnit assertions failed in ' + chalk.blue(file.relative));
                this.emit('error', new gutil.PluginError('gulp-qunit', err));
                passed = false;
            } else {
                gutil.log('gulp-qunit: ' + chalk.green('✔ ') + 'QUnit assertions all passed in ' + chalk.blue(file.relative));
            }

            this.emit('gulp-qunit.finished', { 'passed': passed });

            this.push(file);

            return cb();
        }.bind(this));
    });
};
