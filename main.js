const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const {globalShortcut} = require('electron')
const path = require('path')
const url = require('url')
const {Menu, Tray} = require('electron')
const electronLocalshortcut = require('electron-localshortcut');


var fs = require('fs');
var filePath = './local.json';
fs.unlinkSync(filePath);

//live Reload
require('electron-reload')("index.html", "main.js", "main.css", "build.js", {
  electron: require('./node_modules/electron')
})


//load the plugins
var glob = require( 'glob' );
glob.sync( './plugins/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {

  //screen info
  /*var screenElectron = electron.screen;
  var mainScreen = screenElectron.getPrimaryDisplay();
  var allScreens = screenElectron.getAllDisplays();
  console.log(mainScreen, allScreens);*/

  const {width, height} = electron.screen.getPrimaryDisplay().size
  // Create the browser window.
  //mainWindow = new BrowserWindow({width: 500, height: 300});
  mainWindow = new BrowserWindow({width: width, height: height, x:0, y: 0, skipTaskbar: true, frame: false, alwaysOnTop: true, transparent: true, toolbar: false })
  //mainWindow = new BrowserWindow({width: 600, height: 600, transparent: true, frame: false, alwaysOnTop: true})

  //mainWindow.setIgnoreMouseEvents(true);

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  //fullscreen
  mainWindow.setFullScreen(true);

  // Emitted when the window is closed.
  /*mainWindow.on('move', function () {
    console.log('move')
  })*/

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    globalShortcut.unregisterAll()
  })

  //find all the themes
  const finder  = require('findit')(process.argv[2] || './themes/');

  //the variable used to build the menu
  var myMenuArray = [];

  myMenuArray.push({label: "Default",
    accelerator: '',
    checked: true,
    type: "radio",
    click: function (filename = "Default") {
      mainWindow.webContents.send('theme', filename.label);
      //console.log(tray);
    }
  });

  findercount = 0;
  //the function that files when files are found
  finder.on('file', function (file, stat) {
    filename = file.replace(/^.*[\\\/]/, '');

    if(filename != "Default.css"){
      myMenuArray.push({label: filename,
        accelerator: '',
        checked: false,
        type: "radio",
        click: function (filename) {
          mainWindow.webContents.send('theme', filename.label);
          //console.log(tray);
        }
      });
    }
    findercount++;
  });

  //once we have all the themes we create the tray menu
  finder.on('end', function () {

    //The exit button
    myMenuArray.push({label: "Exit",
      accelerator: '',
      //icon: './icon-check.png',
      click: function (filename) {
        app.quit();
      }
    });

    tray = new Tray('./icon.ico')
    const contextMenu = Menu.buildFromTemplate(myMenuArray);
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
  })

  electronLocalshortcut.register(mainWindow, 'Escape', () => {
    //console.log('You pressed ctrl & A');
    mainWindow.hide();
  });

  electronLocalshortcut.register(mainWindow, 'Left', () => {
    console.log('Left');
    mainWindow.webContents.executeJavaScript("cyclePlugin('left')");
    //mainWindow.hide();
  });

  electronLocalshortcut.register(mainWindow, 'Right', () => {
    console.log('Right');
    mainWindow.webContents.executeJavaScript("cyclePlugin('right')");
    //mainWindow.hide();
  });

  // main key shortcuts
  // Register a 'CommandOrControl+X' shortcut listener.
  //https://github.com/electron/electron/blob/master/docs/api/accelerator.md
  const ret = globalShortcut.register('ctrl+space', () => {
    //mainWindow.webContents.send('ping', 'play-pause');
    //console.log('CommandOrControl+X is pressed');
    mainWindow.show();
    mainWindow.webContents.send('ping', 'play-pause');
  })

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})
