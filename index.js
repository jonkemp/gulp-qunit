const path = require('path');
const childProcess = require('child_process');
const PluginError = require('plugin-error');
const log = require('fancy-log');
const chalk = require('chalk');
const through = require('through2');
const phantomjs = require('phantomjs-prebuilt');
let binPath = phantomjs.path;

module.exports = params => {
    const options = params || {};

    binPath = options.binPath || binPath;

    return through.obj(function (file, enc, cb) {
        const absolutePath = path.resolve(file.path);
        const isAbsolutePath = absolutePath.indexOf(file.path) >= 0;
        let childArgs = [];
        const runner = options.runner || require.resolve('qunit-phantomjs-runner');
        let proc;
        let passed = true;

        if (options['phantomjs-options'] && options['phantomjs-options'].length) {
            if (Array.isArray(options['phantomjs-options'])) {
                childArgs = childArgs.concat(options['phantomjs-options']);
            } else {
                childArgs.push(options['phantomjs-options']);
            }
        }

        childArgs.push(
            runner,
            (isAbsolutePath ? `file:///${absolutePath.replace(/\\/g, '/')}` : file.path)
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
            cb(new PluginError('gulp-qunit', 'Streaming not supported'));
            return;
        }

        log(`Testing ${chalk.blue(file.relative)}`);

        try {
            proc = childProcess.spawn(binPath, childArgs);

            proc.stdout.on('data', data => {
                let out;
                let test;
                let message;
                const line = data.toString().trim();

                try {
                    out = JSON.parse(line);
                } catch (err) {
                    log(line);
                    return;
                }

                if (out.exceptions) {
                    for (test in out.exceptions) {
                        log(`\n${chalk.red('Test failed')}: ${chalk.red(test)}: \n${out.exceptions[test].join('\n  ')}`);
                    }
                }

                if (out.result) {
                    message = `Took ${out.result.runtime} ms to run ${out.result.total} tests. ${out.result.passed} passed, ${out.result.failed} failed.`;

                    log(out.result.failed > 0 ? chalk.red(message) : chalk.green(message));
                }
            });

            proc.stderr.on('data', function (data) {
                const stderr = data.toString().trim();

                log(stderr);
                this.emit('error', new PluginError('gulp-qunit', stderr));
                passed = false;
            });

            proc.on('close', function (code) {
                if (code === 1) {
                    log(`gulp-qunit: ${chalk.red('✖ ')}QUnit assertions failed in ${chalk.blue(file.relative)}`);
                    passed = false;
                } else {
                    log(`gulp-qunit: ${chalk.green('✔ ')}QUnit assertions all passed in ${chalk.blue(file.relative)}`);
                }

                this.emit('gulp-qunit.finished', { 'passed': passed });
            });
        } catch (e) {
            this.emit('error', new PluginError('gulp-qunit', e));
        }

        this.push(file);

        cb();
    });
};
