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
            childArgs.push( options['phantomjs-options'] );
        }

        childArgs.push(
            path.join(__dirname, './node_modules/qunit-phantomjs-runner/runner.js'),
            (isAbsolutePath ? 'file:///' + absolutePath.replace(/\\/g, '/') : file.path)
        );

        if ( options.timeout ) {
            childArgs.push( options.timeout );
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-qunit', 'Streaming not supported'));
            return cb();
        }

        childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
            var passed = true;

            gutil.log('Testing ' + file.relative);

            if (stdout) {
                try {
                  var out = JSON.parse(stdout.trim());
                  var result = out.result;
                  var output = 'Took ' + result.runtime + ' ms to run ' + chalk.blue(result.total) + ' tests. ' + chalk.green(result.passed) + ' passed, ' + chalk.red(result.failed) + ' failed.';
                  gutil.log(output);

                  if(out.exceptions) {
                    for(var test in out.exceptions) {
                      output = '\n' + chalk.red('Test failed') + ': ' + chalk.red(test) + ': \n' + out.exceptions[test].join('\n  ');
                      gutil.log(output);
                    }
                  }
                } catch(e) {}
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

            this.emit('gulp-qunit.finished', {'passed': passed});

            this.push(file);

            return cb();
        }.bind(this));
    });
};
