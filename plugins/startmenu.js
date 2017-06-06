const finder  = require('findit')(process.argv[2] || 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs');

const path = require('path')

var fs = require('fs');
var filePath = './local.json';
fs.unlinkSync(filePath);

var Datastore = require('nedb');
global.db = new Datastore({ filename: './local.json', autoload: true });
// You can issue commands right away


finder.on('directory', function (dir, stat, stop) {
    var base = path.basename(dir);
    if (base === '.git' || base === 'node_modules') stop()
    //else console.log(dir + '/')
});

finder.on('file', function (file, stat) {
  if(file.slice( -3 ) == "lnk"){
    //console.log(file);
    var doc = { file: file
                   , today: new Date()
                   };

    db.update( {file: file}, doc, {upsert: true} , function (err, newDoc) {   // Callback is optional
      //console.log(err);
      //console.log(newDoc);
    });
  }

});
