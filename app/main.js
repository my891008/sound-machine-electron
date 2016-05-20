'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
//var globalShortcut = require('global-shortcut');
//var configuration = require('./configuration');
var ipc = require('ipc');
var path=require('path');
var cp=require('child_process');

var mainWindow = null;
var settingsWindow = null;

app.on('ready', function() {
   /* if (!configuration.readSettings('shortcutKeys')) {
        configuration.saveSettings('shortcutKeys', ['ctrl', 'shift']);
    }*/

    mainWindow = new BrowserWindow({
        frame: false,
        height: 700,
        resizable: false,
        width: 368
    });

    mainWindow.loadUrl('file://' + __dirname + '/app/index.html');

  //  setGlobalShortcuts();
});

/*function setGlobalShortcuts() {
    globalShortcut.unregisterAll();

    var shortcutKeysSetting = configuration.readSettings('shortcutKeys');
    var shortcutPrefix = shortcutKeysSetting.length === 0 ? '' : shortcutKeysSetting.join('+') + '+';

    globalShortcut.register(shortcutPrefix + '1', function () {
        mainWindow.webContents.send('global-shortcut', 0);
    });
    globalShortcut.register(shortcutPrefix + '2', function () {
        mainWindow.webContents.send('global-shortcut', 1);
    });
}*/

ipc.on('close-main-window', function () {
    app.quit();
});

ipc.on('open-settings-window', function () {
    if (settingsWindow) {
        return;
    }

    settingsWindow = new BrowserWindow({
        frame: false,
        height: 200,
        resizable: false,
        width: 200
    });

    settingsWindow.loadUrl('file://' + __dirname + '/app/settings.html');

    settingsWindow.on('closed', function () {
        settingsWindow = null;
    });
});

ipc.on('close-settings-window', function () {
    if (settingsWindow) {
        settingsWindow.close();
    }
});

/*ipc.on('set-global-shortcuts', function () {
    setGlobalShortcuts();
});*/

var handleStartupEvent = function() {
  if (process.platform !== 'win32') {
    return false;
  }
  
  function executeSquirrelCommand(args,done){
	  var updateDotExe=path.resolve(path.dirname(process.execPath),'..','update.exe');
	  var child=cp.spawn(updateDotExe,args,{detached:true});
	  child.on('close',function(code){
		  done();
		  });
	  };
	  function install(done)
	  {
		  var target=path.basename(process.execPath);
		  executeSquirrelCommand(['--createShortcut',target],done);
		  }
		  
	 function uninstall(done)
	  {
		  var target=path.basename(process.execPath);
		  executeSquirrelCommand(['--removeShortcut',target],done);
		  }	  

  var squirrelCommand = process.argv[1];
  switch (squirrelCommand) {
    case '--squirrel-install':
	install(app.quit);
	return true;
    case '--squirrel-updated':
	install(app.quit);
	return true;

     
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Always quit when done
     uninstall(app.quit);
      return true;
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
  return false;
};

if (handleStartupEvent()) {
  return;
}