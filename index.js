var path = require('path');
var childProcess = require('child_process');
var gutil = require('gulp-util');
var chalk = require('chalk');
var through = require('through2');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

module.exports = function(){
    'use strict';
    return through.obj(function (file, enc, cb) {
        var childArgs = [
            path.join(__dirname, 'runner.js'),
            file.path
        ];

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-qunit', 'Streaming not supported'));
            return cb();
        }

        childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
            console.log('\nTesting ' + file.relative);

            console.log(stdout);

            if (stderr !== '') {
                gutil.log('gulp-qunit: Failed to open test runner ' + chalk.blue(file.relative));
                this.emit('error', new gutil.PluginError('gulp-qunit', stderr));
            }

            if (err !== null) {
                gutil.log('gulp-qunit: ' + chalk.red('✖ ') + 'QUnit assertions failed in ' + chalk.blue(file.relative));
                this.emit('error', new gutil.PluginError('gulp-qunit', err));
            }

            this.push(file);

            return cb();
        }.bind(this));
    });
};
