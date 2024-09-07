const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');;

let win;

const createWindow = () => {
  win = new BrowserWindow({
    frame: false,
    width: 1024,
    height: 768,
    minWidth: 480,
    minHeight: 320,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  if (process.platform === 'win32') {
    win.on('maximize', () => {
      win.webContents.send('window-maximized');
    });

    win.on('unmaximize', () => {
      win.webContents.send('window-unmaximized');
    });

    win.once('ready-to-show', () => {
      win.webContents.send(win.isMaximized() ? 'window-maximized' : 'window-unmaximized');
    });
  }
};

app.whenReady().then(() => {
  createWindow()
});

ipcMain.on('quit-app', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('minimize-window', () => {
  if (win) {
    win.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (win) {
    win.maximize();
  }
});

ipcMain.on('restore-window', () => {
  if (win) {
    win.unmaximize();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});
