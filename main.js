const { app, ipcMain, Menu, BrowserWindow, nativeImage } = require('electron');
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
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

const contextMenu = Menu.buildFromTemplate([
  { label: 'Activity Bar', type: 'checkbox', checked: true, icon: 'house-solid.png' },
  { label: 'Primary Side Bar', type: 'checkbox', checked: true, accelerator: 'ctrl+B',
    click: () => {win.webContents.send('toggle-primary-side-bar')} },
  { label: 'Secondary Side Bar', type: 'checkbox', checked: false, accelerator: 'ctrl+alt+B' },
  { label: 'Panel', type: 'checkbox', checked: true, accelerator: 'ctrl+J'},
  { label: 'Status Bar', type: 'checkbox', checked: true},
  { type: 'separator' },
  { label: 'Primary Side Bar Position', enabled: false },
  { label: 'Left', type: 'radio', checked: true},
  { label: 'Right', type: 'radio', checked: false},
  { type: 'separator' },
  { label: 'Panel Alignment', enabled: false },
  { label: 'Left', type: 'radio', checked: false},
  { label: 'Center', type: 'radio', checked: false},
  { label: 'Right', type: 'radio', checked: true},
  { label: 'Full', type: 'radio', checked: false},
  { type: 'separator' },
  { label: 'Full Screen', type: 'checkbox', checked: false, accelerator: 'F11'},
]);

ipcMain.on('show-custom-layout-menu', (event, position) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  contextMenu.popup({window: senderWin, x: position.x, y: position.y });
});
