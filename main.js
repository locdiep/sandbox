import { app, ipcMain, Menu, BrowserWindow, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Store from 'electron-store';
const store = new Store({accessPropertiesByDotNotation: false});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let win;
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

const settingPath = path.join(app.getPath('userData'), 'config.json');
console.log(`settingPath: ${settingPath}`)
let defaultSettings = {
  'window.isMaximize': false,
  'window.isCenter': true,
  'window.x': 0,
  'window.y': 0,
  'window.width': 800,
  'window.height': 600,
  'window.minWidth': 480,
  'window.minHeight': 320,
  'workspace.activityBar.visible': true,
  'workspace.primarySideBar.visible': true,
  'workspace.secondarySideBar.visible': false,
  'workspace.panel.visible': true,
  // left, center, right (default), full
  'workspace.panel.alignment': 'right',
  'workspace.statusBar.visible': true,
  // left (default), right
  'workspace.primarySideBarPosition': 'left',
}

if (fs.existsSync(settingPath)) {
  const jsonData = fs.readFileSync(settingPath, 'utf8');
  const data = JSON.parse(jsonData);
  console.log(data);
  Object.entries(data).forEach(([key, value]) => {
    defaultSettings[key] = value;
  });
}

const createWindow = () => {
  win = new BrowserWindow({
    frame: false,
    center: defaultSettings['window.isCenter'],
    x: defaultSettings['window.x'],
    y: defaultSettings['window.y'],
    titleBarStyle: isMac ? 'hidden' : 'default',
    trafficLightPosition: isMac ? { x: 10, y: 10 } : { x: 0, y: 0 },
    width: defaultSettings['window.width'],
    height: defaultSettings['window.height'],
    minWidth: defaultSettings['window.minWidth'],
    minHeight: defaultSettings['window.minHeight'],
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (defaultSettings['window.isMaximize']) {
    win.maximize();
  }

  win.loadFile('index.html');

  if (isWin) {
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

  win.on('close', () => {
    const bound = win.getBounds();
    store.set('window.x', bound.x);
    store.set('window.y', bound.y);
    store.set('window.width', bound.width);
    store.set('window.height', bound.height);
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('quit-app', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (isWin) {
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
}

ipcMain.handle('getStoreValue', (event, key) => {
  return store.get(key, defaultSettings[key]);
});

ipcMain.handle('setStoreValue', (event, key, value) => {
  store.set(key, value);
});

const contextMenu = Menu.buildFromTemplate([
  { label: 'Activity Bar', id: 'activity-bar-item', type: 'checkbox',
    click: () => {win.webContents.send('toggle-activity-bar')}
  },
  { label: 'Primary Side Bar', id: 'primary-side-bar-item', type: 'checkbox', accelerator: 'ctrl+B',
    click: () => {win.webContents.send('toggle-primary-side-bar')}
  },
  { label: 'Secondary Side Bar', id: 'secondary-side-bar-item', type: 'checkbox', accelerator: 'ctrl+alt+B',
    click: () => {win.webContents.send('toggle-secondary-side-bar')}
  },
  { label: 'Panel', id: 'panel-item', type: 'checkbox', accelerator: 'ctrl+J',
    click: () => {win.webContents.send('toggle-panel')}
  },
  { label: 'Status Bar', id: 'status-bar-item', type: 'checkbox',
    click: () => {win.webContents.send('toggle-status-bar')}
  },
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

ipcMain.on('set-checked', (event, id, checked) => {
  const menuItem = contextMenu.getMenuItemById(id);
  if (menuItem) {
      menuItem.checked = checked;
  }
});

ipcMain.on('show-custom-layout-menu', (event, position) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  const offset = isMac ? 5 : 0;
  contextMenu.popup({window: senderWin, x: position.x, y: position.y + offset});
});

ipcMain.handle('write-settings', (event, settings) => {
  const filePath = path.join(app.getPath('userData'), 'settings.json');
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2));
});
