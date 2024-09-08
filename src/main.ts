import { app, ipcMain, Menu, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import ElectronStore from 'electron-store';

let win: BrowserWindow;
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';
const ctrlKey = isMac ? 'cmd' : 'ctrl';

type DefaultSettings = {
  'window.isMaximize': boolean,
  'window.isCenter': boolean,
  'window.x': number,
  'window.y': number,
  'window.width': number,
  'window.height': number,
  'window.minWidth': number,
  'window.minHeight': number,
  'workspace.activityBar.visible': boolean,
  'workspace.primarySideBar.visible': boolean,
  'workspace.secondarySideBar.visible': boolean,
  'workspace.panel.visible': boolean,
  'workspace.panel.alignment': 'left' | 'center' | 'right' | 'full',
  'workspace.statusBar.visible': boolean,
  'workspace.primarySideBarPosition': 'left' | 'right',
  'shortcut.togglePrimarySideBar': string,
  'shortcut.toggleSecondarySideBar': string,
  'shortcut.togglePanel': string,
  'shortcut.fullscreen': string,
};

const store = new ElectronStore<DefaultSettings>({accessPropertiesByDotNotation: false});

const defaultSettings: DefaultSettings = {
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
  'workspace.panel.alignment': 'right',
  'workspace.statusBar.visible': true,
  'workspace.primarySideBarPosition': 'left',
  'shortcut.togglePrimarySideBar': 'CmdOrCtrl+B',
  'shortcut.toggleSecondarySideBar': 'Alt+CmdOrCtrl+B',
  'shortcut.togglePanel': 'CommandOrControl+J',
  'shortcut.fullscreen': 'Ctrl+Cmd+F'
}

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    center: defaultSettings['window.isCenter'],
    x: getSetting('window.x'),
    y: getSetting('window.y'),
    titleBarStyle: isMac ? 'hidden' : 'default',
    trafficLightPosition: isMac ? { x: 10, y: 10 } : { x: 0, y: 0 },
    width: getSetting('window.width'),
    height: getSetting('window.height'),
    minWidth: getSetting('window.minWidth'),
    minHeight: getSetting('window.minHeight'),
    webPreferences: {
      preload: path.join(app.getAppPath(), 'dist', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (store.get('window.isMaximize', defaultSettings['window.isMaximize'])) {
    win.maximize();
  }

  win.loadFile(path.join(app.getAppPath(), 'src', 'index.html'));

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
    setSetting('window.x', bound.x);
    setSetting('window.y', bound.y);
    setSetting('window.width', bound.width);
    setSetting('window.height', bound.height);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });

  globalShortcut.register(getSetting('shortcut.togglePrimarySideBar'), () => {
    win.webContents.send('global-shortcut', 'shortcut', 'ctrl+B');
  });
  globalShortcut.register(getSetting('shortcut.toggleSecondarySideBar'), () => {
    win.webContents.send('global-shortcut', 'shortcut', 'ctrl+shift+B');
  });
  globalShortcut.register(getSetting('shortcut.togglePanel'), () => {
    win.webContents.send('global-shortcut', 'shortcut', 'ctrl+J');
  });
  globalShortcut.register(getSetting('shortcut.fullscreen'), () => {
    win.setFullScreen(!win.isFullScreen());
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
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

function setSetting(key: string, value: any) {
  store.set(key, value);
}

function getSetting(key: string): any {
  return store.get(key, defaultSettings[key as keyof typeof defaultSettings]);
}

ipcMain.handle('getStoreValue', (event, key) => {
  return getSetting(key);
});

ipcMain.handle('setStoreValue', (event, key, value) => {
  setSetting(key, value);
});

const contextMenu = Menu.buildFromTemplate([
  { label: 'Activity Bar', id: 'activity-bar-item', type: 'checkbox',
    click: () => {win.webContents.send('toggle-activity-bar')}
  },
  { label: 'Primary Side Bar', id: 'primary-side-bar-item', type: 'checkbox',
    accelerator: getSetting('shortcut.togglePrimarySideBar'),
    click: () => {win.webContents.send('toggle-primary-side-bar')}
  },
  { label: 'Secondary Side Bar', id: 'secondary-side-bar-item', type: 'checkbox',
    accelerator: getSetting('shortcut.toggleSecondarySideBar'),
    click: () => {win.webContents.send('toggle-secondary-side-bar')}
  },
  { label: 'Panel', id: 'panel-item', type: 'checkbox',
    accelerator: getSetting('shortcut.togglePanel'),
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
  { label: 'Full Screen', type: 'checkbox', checked: false, accelerator: getSetting('shortcut.fullscreen'),},
]);

ipcMain.on('set-checked', (event, id, checked) => {
  const menuItem = contextMenu.getMenuItemById(id);
  if (menuItem) {
      menuItem.checked = checked;
  }
});

ipcMain.on('show-custom-layout-menu', (event, position) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender) ?? undefined;
  const offset = isMac ? 5 : 0;
  contextMenu.popup({window: senderWin, x: position.x, y: position.y + offset});
});
