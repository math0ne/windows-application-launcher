function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}

function removejscssfile(filename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
    if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
}


function ArrNoDupe(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}

$( document ).ready(function() {

  $(".maininput").focus();

  //requires
  var remote = require('electron').remote;
  var db = remote.getGlobal('db');
  var ipcRenderer = require('electron').ipcRenderer;
  require('underscore');

  //manage messages from the main process
  ipcRenderer.on('ping', function(arg){
    //console.log(arg);
    remote.getCurrentWindow().focus()
    $(".maininput").focus()
  });

  //theme managment
  var currentTheme = "";
  ipcRenderer.on('theme', function(event, arg){
    console.log(event);
    console.log(arg);

    if(currentTheme != ""){
      //alert("testremove");
      removejscssfile("./themes/" + currentTheme, "css");
    }
    currentTheme = arg;
    loadjscssfile("./themes/" + arg, "css")
  });

  //failed attempt at move control
  /*
  $(document).on('keydown', null, 'ctrl+a', function( ) {
    remote.getCurrentWindow().setIgnoreMouseEvents(false)
    $(".maininput").css("-webkit-app-region", "drag");
    //alert('msg');
  });
  $(document).on('keyup', null, 'ctrl+a', function( ) {
    remote.getCurrentWindow().setIgnoreMouseEvents(true)
    $(".maininput").css("-webkit-app-region", "nodrag");
    //alert('msg');
  });
  */
  //remote.getCurrentWindow().bind('dragend', function(){ alert("test") });

  //this var is for the autocomplete widget
  var programs = [];
  var pluginsData = [];
  //this is the var that tracks the actual commands vs their names
  var programsData = new Object();

  //look up all command and load them into the variables for use in autocomplete
  db.find({}, function (err, docs) {

    docs.forEach(function(entry) {
        //console.log(entry.file);
        filename = entry.file.replace(/^.*[\\\/]/, '');
        filename = filename.replace(/\.[^/.]+$/, "");
        programs.push(filename);
        programsData[filename] = entry.file;
    });

  });

  db.find({}, function (err, docs) {
    docs.forEach(function(entry) {
      //console.log(entry.file);
      pluginsData.push(entry.plugin);
    });
    pluginsData = ArrNoDupe(pluginsData)
    console.log(pluginsData);
  });





  function cyclePlugin(direction){

  }

  //console.log(programsData);
  //console.log(programs);


  //initialize the autocomplete
  $( ".maininput" ).autocomplete({
    autoFocus: true,
    maxResults: 8,
    source: function(request, response) {
      var results = $.ui.autocomplete.filter(programs, request.term);
      response(results.slice(0, this.options.maxResults));
    },
    position: {  collision: "flip"  },
    select: function( event, ui ) {
      var exec = require("child_process").exec;
      path = programsData[ui.item.value].split("\\").join("\\\\");;
      exec('start "name" "' + path + '"');
      remote.BrowserWindow.getFocusedWindow().hide();
    },
    change: function( event, ui ) {
      $('.maininput').val("");
    }
  });



});
