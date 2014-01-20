/* jshint node: true */
/* global describe, it */

var should = require('should');
var gutil = require('gulp-util');
var qunit = require('../index');

describe('gulp-useref', function() {
    it('file should pass through', function(done) {
        var a = 0;

        var fakeFile = new gutil.File({
            path: './test/fixture/file.js',
            cwd: './test/',
            base: './test/fixture/',
            contents: new Buffer('wadup();')
        });

        var stream = qunit();
        stream.on('data', function(newFile){
            should.exist(newFile);
            should.exist(newFile.path);
            should.exist(newFile.relative);
            should.exist(newFile.contents);
            newFile.path.should.equal('./test/fixture/file.js');
            newFile.relative.should.equal('file.js');
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(1);
            done();
        });

        stream.write(fakeFile);
        stream.end();
    });
});