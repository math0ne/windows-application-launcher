const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const {globalShortcut} = require('electron')
const path = require('path')
const url = require('url')

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

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1216, height: 1038, x:2, y: 10 })
  //mainWindow = new BrowserWindow({width: 600, height: 600, transparent: true, frame: false, alwaysOnTop: true})

  //mainWindow.setIgnoreMouseEvents(true);

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // main key shortcuts
  // Register a 'CommandOrControl+X' shortcut listener.
  //https://github.com/electron/electron/blob/master/docs/api/accelerator.md
  const ret = globalShortcut.register('Control+Super+X', () => {
    mainWindow.webContents.send('ping', 'play-pause');
    console.log('CommandOrControl+X is pressed')
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  globalShortcut.unregisterAll()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
