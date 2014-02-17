'use strict';

var path = require('path');
var childProcess = require('child_process');
var gutil = require('gulp-util');
var through = require('through2');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

module.exports = function(){
    return through.obj(function (file, enc, cb) {
        var childArgs = [
            path.join(__dirname, 'runner.js'),
            file.path
        ];

        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
            console.log(stdout);

            if (stderr !== '') {
                gutil.log('gulp-qunit: Failed to open test runner ' + gutil.colors.blue(file.relative));
                this.emit('error', new gutil.PluginError('gulp-qunit', stderr));
            }

            if (err !== null) {
                gutil.log('gulp-qunit: ' + gutil.colors.red("✖ ") + 'QUnit assertions failed in ' + gutil.colors.blue(file.relative));
                this.emit('error', new gutil.PluginError('gulp-qunit', err));
            }

            this.push(file);

            return cb();
        }.bind(this));
    });
};
