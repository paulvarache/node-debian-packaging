var deb = require('../'),
    fs = require('fs');

describe('debian-packaging', function () {

    it('should fail on the control file check', function (done) {
        deb.createPackage({
            control: 'test/01/control',
            data: 'test/01/data',
            dest: 'output/01.deb'
        })
        .then(function () {
            done(new Error('Did not failed on control file check'));
        })
        .catch(function () {
            done();
        });
    });

    it('should fail on the control file check format', function (done) {
        deb.createPackage({
            control: 'test/02/control',
            data: 'test/02/data',
            dest: 'output/02.deb'
        })
        .then(function () {
            done(new Error('Did not failed on control file check'));
        })
        .catch(function () {
            done();
        });
    });

    it('should make the .deb file', function (done) {
        deb.createPackage({
            control: 'test/10/control',
            data: 'test/10/data',
            dest: './10.deb'
        }).then(function () {
            if(fs.existsSync('./10.deb')) {
                done();
            } else {
                done(new Error('The file `10.deb` should exist'));
            }
        })
        .catch(function (err) {
            done(err);
        });
    });

});
