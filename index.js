var path = require('path');
var childProcess = require('child_process');
var map = require('map-stream');
var gutil = require('gulp-util');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

module.exports = function(){
    return map(function (file, cb){
        var childArgs = [
            path.join(__dirname, 'runner.js'),
            file.path
        ];

        if (file.isNull()) {
            return cb(null, file);
        }

        childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
            console.log(stdout);

            if (stderr !== '') {
                console.log(stderr);
            }

            if (err !== null) {
                console.log(err);
            }
        });

        cb(null, file);
    });
};