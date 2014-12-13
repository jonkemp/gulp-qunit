'use strict';

var path = require('path'),
    childProcess = require('child_process'),
    gutil = require('gulp-util'),
    chalk = require('chalk'),
    through = require('through2'),
    phantomjs = require('phantomjs'),
    binPath = phantomjs.path;

module.exports = function (params) {
    var options = params || {};

    return through.obj(function (file, enc, cb) {
        var absolutePath = path.resolve(file.path),
            isAbsolutePath = absolutePath.indexOf(file.path) >= 0;

        var childArgs = [];
        if (options['phantomjs-options'] && options['phantomjs-options'].length) {
            childArgs = childArgs.concat( options['phantomjs-options'] );
        }

        childArgs = childArgs.concat([
            path.normalize('./node_modules/qunit-phantomjs-runner/runner.js'),
            (isAbsolutePath ? 'file:///' + absolutePath.replace(/\\/g, '/') : file.path)
        ]);

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-qunit', 'Streaming not supported'));
            return cb();
        }

        childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
            var passed = true;

            gutil.log('Testing ' + file.relative);

            if (stdout) {
                stdout = stdout.trim(); // Trim trailing cr-lf
                gutil.log(stdout);
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
            }

            this.emit('gulp-qunit.finished', {'passed': passed});

            this.push(file);

            return cb();
        }.bind(this));
    });
};
