const finder  = require('findit')(process.argv[2] || 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs');

const path = require('path')


var Datastore = require('nedb');

// You can issue commands right away

finder.on('file', function (file, stat) {
  if(file.slice( -3 ) == "lnk"){
    //console.log(file);
    var doc = { file: file,
                today: new Date(),
                plugin: "start"
               };

    db.update( {file: file}, doc, {upsert: true} , function (err, newDoc) {   // Callback is optional
      //console.log(err);
      //console.log(newDoc);
    });
  }

});
