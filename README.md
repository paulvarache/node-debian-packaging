#debian-packaging
----------------------------------------
Creates a .deb from a control and data directory.

After struggling to get a cross platform solution for building .deb packages,
(looking at ant and maven plugins), and wanting something that easily integrates
with Grunt, I decided to write this module.

It creates a package from `control` and `data` folders, and run some basic
checks.

## Getting the module

Well it's on npm so just
```
npm install debian-packaging
```

##How to use it
It works with promises so
```
var deb = require('debian-packaging');

deb.createPackage({
    control: 'path/to/control/dir',
    data: 'path/to/data/dir',
    dest: 'output/my-package.deb'
})
.then(function () {
    // It's done
})
.catch(function (err) {
    //something went wrong
})

```
---------------------------------------
It's pretty basic, and you have to make the file hierarchy by yourself,
but its purpose is to be used in grunt tasks