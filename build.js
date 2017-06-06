$( document ).ready(function() {

  //requires
  var remote = require('electron').remote;
  var db = remote.getGlobal('db');
  var ipcRenderer = require('electron').ipcRenderer;

  //manage messages from the main process
  ipcRenderer.on('ping', function(arg){
    remote.getCurrentWindow().focus()
    $(".maininput").focus()
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

  //console.log(programsData);
  //console.log(programs);

  //initialize the autocomplete
  $( ".maininput" ).autocomplete({
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
    },
    change: function( event, ui ) {
      $('.maininput').val("");
    }
  });



});
