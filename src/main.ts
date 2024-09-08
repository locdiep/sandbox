import { app, ipcMain, Menu, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import ElectronStore from 'electron-store';

let win: BrowserWindow;
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

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
}

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    center: defaultSettings['window.isCenter'],
    x: store.get('window.x', defaultSettings['window.x']),
    y: store.get('window.y', defaultSettings['window.y']),
    titleBarStyle: isMac ? 'hidden' : 'default',
    trafficLightPosition: isMac ? { x: 10, y: 10 } : { x: 0, y: 0 },
    width: store.get('window.width', defaultSettings['window.width']),
    height: store.get('window.height', defaultSettings['window.height']),
    minWidth: store.get('window.minWidth', defaultSettings['window.minWidth']),
    minHeight: store.get('window.minHeight', defaultSettings['window.minHeight']),
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
    store.set('window.x', bound.x);
    store.set('window.y', bound.y);
    store.set('window.width', bound.width);
    store.set('window.height', bound.height);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });

  globalShortcut.register('ctrl+B', () => {
    win.webContents.send('global-shortcut', 'shortcut', 'ctrl+B');
  });
  globalShortcut.register('ctrl+shift+B', () => {
    win.webContents.send('global-shortcut', 'shortcut', 'ctrl+shift+B');
  });
  globalShortcut.register('ctrl+J', () => {
    win.webContents.send('global-shortcut', 'shortcut', 'ctrl+J');
  });
  // TODO: F11 doesn't work
  globalShortcut.register('F11', () => {
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

ipcMain.handle('getStoreValue', (event, key) => {
  return store.get(key, defaultSettings[key as keyof typeof defaultSettings]);
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
  const senderWin = BrowserWindow.fromWebContents(event.sender) ?? undefined;
  const offset = isMac ? 5 : 0;
  contextMenu.popup({window: senderWin, x: position.x, y: position.y + offset});
});
