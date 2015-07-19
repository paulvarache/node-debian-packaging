// Copyright (C) 2015 Paul Varache
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
// CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

var Promise = require('es6-promise').Promise,
    path = require('path'),
    fs = require('fs-extra-promise'),
    spawn = require('child_process').spawn,
    assert = require('assert'),
    exec = require('child_process').exec;

function Packager (opts) {
    this.opts = opts;
    this.TMP_DIR = '.tmp';
    if(!fs.existsSync(this.TMP_DIR)) {
        fs.mkdirSync(this.TMP_DIR);
    }
}

Packager.requiredFields = ['Package', 'Version', 'Architecture', 'Maintainer', 'Description'];

Packager.prototype.check = function () {
    return fs.readdirAsync(this.opts.control)
        .then(function (controlContent) {
            if(controlContent.indexOf('control') === -1) {
                throw new Error('Missing required `control` file in ' + this.opts.control);
            }
            return this.readControlFile(path.join(this.opts.control, 'control'))
                .then(function (control) {
                    for (var i in Packager.requiredFields) {
                        if (Object.keys(control).indexOf(Packager.requiredFields[i]) === -1) {
                            throw new Error('Missing required field in control file: ' + Packager.requiredFields[i]);
                        }
                    }
                });
        }.bind(this));
};

Packager.prototype.package = function () {
    var tasks = [this.createBinary(),
                this.makeArchive('control.tar.gz', this.opts.control),
                this.makeArchive('data.tar.gz', this.opts.data)];
    return Promise.all(tasks).then(function (files) {
        return this.ar(this.opts.dest, files);
    }.bind(this))
    .then(function () {
        return fs.removeAsync(this.TMP_DIR);
    }.bind(this));
};

Packager.prototype.makeArchive = function (name, dir) {
    return new Promise(function (resolve, reject) {
        var outputFile = path.resolve(path.join(this.TMP_DIR, name));
        var cmd = 'tar -zcvf ' + outputFile + ' *';
        exec(cmd, { cwd: dir }, function (err, stdout, stderr) {
            if (err) return reject(err);
            resolve(outputFile);
        });

    }.bind(this));
};

Packager.prototype.createBinary = function () {
    return new Promise(function (resolve, reject) {
        var outputFile = path.join(this.TMP_DIR, 'debian-binary');
        fs.writeFile(outputFile, '2.0\n', function (err) {
            if (err) return reject(err);
            resolve(outputFile);
        });
    }.bind(this));
};

Packager.prototype.readControlFile = function (controlFile) {
    return fs.readFileAsync(controlFile, 'utf-8')
        .then(function (content) {
            return content.split(/\n/).filter(function (line) {
                return line !== '' && line.substr(0, 1) !== ' ';
            }).reduce(function (total, line, index) {
                var s = line.split(': ');
                if (s.length < 2) {
                    throw new Error('Malformed line on control file `' + controlFile + '` on line ' + (index + 1));
                }
                total[s[0]] = s[1];
                return total;
            }, {});
        });
};

Packager.prototype.ar = function (dest, files) {
    return new Promise(function (resolve, reject) {
        var params = ['rcv', dest].concat(files);
        var ar = spawn('ar', params);
        ar.on('exit', function (code) {
            if (code !== 0) {
                return reject(new Error(stderr));
            }
            resolve();
        });
    });
};

module.exports = Packager;
