// this is used to inject themes into the app while running
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

// this is used to inject themes into the app while running
function removejscssfile(filename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
    if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
}

// used to create master plugin list
function ArrNoDupe(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}


// page wide variables
var programs = [];
var pluginsData = [];
pluginsData.push("combi");
var pluginsDataNumbered = [];
//this is the var that tracks the actual commands vs their names
var programsData = new Object();
var newData = new Object();
var currentList = 0;


// this controls cycling through the plugins
function cyclePlugin(direction){

  // control the flow!
  if(direction == "right") {
    if(currentList == (pluginsDataNumbered.length - 1)){
      currentList = 0;
    } else{
      currentList = currentList + 1;
    }
  } else {
    if(currentList == 0){
      currentList = (pluginsDataNumbered.length - 1);
    } else {
      currentList = currentList - 1;
    }
  }

  // gets the next list from the actual data
  nextlist = pluginsDataNumbered[currentList];

  $('.maininput').autocomplete('close');

  // set the sources
  $(".mode").html(nextlist + ":&nbsp;");
  $( ".maininput" ).autocomplete('option', 'source', function(request, response) {
    var results = $.ui.autocomplete.filter(newData[nextlist], request.term);
    response(results.slice(0, this.options.maxResults));
  })

  // forcus back
  $('.maininput').val('');
  $('.maininput').focus();

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

  //look up all command and load them into the variables for use in autocomplete
  db.find({}, function (err, docs) {

    // here we create the master plgin list
    db.find({}, function (err, docs) {
      docs.forEach(function(entry) {
        //console.log(entry.file);
        pluginsData.push(entry.plugin);
        pluginsData[entry.plugin] = new Array();
      });
      pluginsData = ArrNoDupe(pluginsData)

      // initializing the arrays that will stor the sorted plugin links
      pluginsData.forEach(function(item){
        newData[item] = new Array();
      })

      // add a special item to the sorted data array that will store all links
      newData["combi"] = new Array();

      // here we push all the data to the various variables that need it
      docs.forEach(function(entry) {
        filename = entry.file.replace(/^.*[\\\/]/, '');
        filename = filename.replace(/\.[^/.]+$/, "");
        programs.push(filename);
        programsData[filename] = entry.file;
        newData[entry.plugin].push(filename);
        newData["combi"].push(filename);
      });

      // we also need a numbered array fo plgins that will be used to cycle
      counterplugins = 0;
      pluginsData.forEach(function(item){
        pluginsDataNumbered[counterplugins] = item;
        counterplugins++;
      })

    });

  });


  // initialize the autocomplete
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
