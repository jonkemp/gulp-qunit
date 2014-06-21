'use strict';
var path = require('path');
var childProcess = require('child_process');
var gutil = require('gulp-util');
var chalk = require('chalk');
var through = require('through2');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

module.exports = function(){
    return through.obj(function (file, enc, cb) {
        var absolutePath = path.resolve(file.path),
            isAbsolutePath = absolutePath.indexOf(file.path) >= 0;

        var childArgs = [
            path.join(__dirname, 'runner.js'),
            (isAbsolutePath ? 'file:///' + absolutePath.replace(/\\/g, '/') : file.path)
        ];

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-qunit', 'Streaming not supported'));
            return cb();
        }

        childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
            gutil.log('Testing ' + file.relative);

            if (stdout) {
                try {
                    var result = JSON.parse(stdout.trim());
                    var output = 'Took ' + result.runtime + ' ms to run ' + chalk.blue(result.total) + ' tests. ' + chalk.green(result.passed) + ' passed, ' + chalk.red(result.failed) + ' failed.';
                    gutil.log(output);
                } catch(e) {
                    gutil.log(stdout.trim());
                }
            }

            if (stderr) {
                gutil.log(stderr);
                this.emit('error', new gutil.PluginError('gulp-qunit', stderr));
            }

            if (err) {
                gutil.log('gulp-qunit: ' + chalk.red('✖ ') + 'QUnit assertions failed in ' + chalk.blue(file.relative));
                this.emit('error', new gutil.PluginError('gulp-qunit', err));
            }

            this.push(file);

            return cb();
        }.bind(this));
    });
};
