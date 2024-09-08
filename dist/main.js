import { app, ipcMain, Menu, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import Store from 'electron-store';
let win;
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';
const ctrlKey = isMac ? 'cmd' : 'ctrl';
const store = new Store({ accessPropertiesByDotNotation: false });
const defaultSettings = {
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
    'workspace.panelAlignment': 'right',
    'shortcut.togglePrimarySideBar': 'CmdOrCtrl+B',
    'shortcut.toggleSecondarySideBar': 'Alt+CmdOrCtrl+B',
    'shortcut.togglePanel': 'CommandOrControl+J',
    'shortcut.fullscreen': 'Ctrl+Cmd+F'
};
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
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
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
    if (process.platform !== 'darwin')
        app.quit();
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
function setSetting(key, value) {
    store.set(key, value);
}
function getSetting(key) {
    return store.get(key, defaultSettings[key]);
}
ipcMain.handle('getStoreValue', (event, key) => {
    return getSetting(key);
});
ipcMain.handle('setStoreValue', (event, key, value) => {
    setSetting(key, value);
});
const customizeLayoutMenu = Menu.buildFromTemplate([
    { label: 'Activity Bar', id: 'activity-bar-item', type: 'checkbox',
        click: () => { win.webContents.send('toggle-activity-bar'); }
    },
    { label: 'Primary Side Bar', id: 'primary-side-bar-item', type: 'checkbox',
        accelerator: getSetting('shortcut.togglePrimarySideBar'),
        click: () => { win.webContents.send('toggle-primary-side-bar'); }
    },
    { label: 'Secondary Side Bar', id: 'secondary-side-bar-item', type: 'checkbox',
        accelerator: getSetting('shortcut.toggleSecondarySideBar'),
        click: () => { win.webContents.send('toggle-secondary-side-bar'); }
    },
    { label: 'Panel', id: 'panel-item', type: 'checkbox',
        accelerator: getSetting('shortcut.togglePanel'),
        click: () => { win.webContents.send('toggle-panel'); }
    },
    { label: 'Status Bar', id: 'status-bar-item', type: 'checkbox',
        click: () => { win.webContents.send('toggle-status-bar'); }
    },
    { type: 'separator' },
    { label: 'Primary Side Bar Position', enabled: false },
    { label: 'Left', type: 'radio',
        click: () => { win.webContents.send('set-left-side-bar-primary'); }
    },
    { label: 'Right', type: 'radio',
        click: () => { win.webContents.send('set-right-side-bar-primary'); }
    },
    { type: 'separator' },
    { label: 'Panel Alignment', enabled: false },
    { label: 'Left', id: 'left-panel-item', type: 'radio',
        click: () => { win.webContents.send('set-left-panel'); }
    },
    { label: 'Center', id: 'center-panel-item', type: 'radio',
        click: () => { win.webContents.send('set-center-panel'); }
    },
    { label: 'Right', id: 'right-panel-item', type: 'radio',
        click: () => { win.webContents.send('set-right-panel'); }
    },
    { label: 'Full', id: 'full-panel-item', type: 'radio',
        click: () => { win.webContents.send('set-full-panel'); }
    },
    { type: 'separator' },
    { label: 'Full Screen', type: 'checkbox', checked: false, accelerator: getSetting('shortcut.fullscreen'), },
]);
const statusBarMenu = Menu.buildFromTemplate([
    { label: 'Hide Status Bar', id: 'hide-status-bar-item',
        click: () => { win.webContents.send('toggle-status-bar'); }
    },
    { type: 'separator' },
    { label: 'Problems', id: 'toggle-problems', type: 'checkbox',
    },
    { label: 'Editor Statistic', id: 'toggle-ln-col-count', type: 'checkbox',
    },
    { label: 'Editor Indentation', id: 'toggle-indentation-count', type: 'checkbox',
    },
    { label: 'Editor Encoding', id: 'toggle-ln-encoding-type', type: 'checkbox',
    },
    { label: 'Editor File Type', id: 'toggle-ln-file-type', type: 'checkbox',
    },
    { label: 'Editor End of Line', id: 'toggle-eol-type', type: 'checkbox',
    },
    { label: 'Editor Language', id: 'toggle-lang', type: 'checkbox',
    },
    { label: 'Notifications', id: 'toggle-noti', type: 'checkbox',
    },
]);
ipcMain.on('set-checked', (event, id, checked) => {
    const menuItem = customizeLayoutMenu.getMenuItemById(id);
    menuItem.checked = checked;
});
ipcMain.on('show-custom-layout-menu', (event, position) => {
    const senderWin = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const offset = isMac ? 5 : 0;
    customizeLayoutMenu.popup({ window: senderWin, x: Math.ceil(position.x), y: Math.ceil(position.y) + offset });
});
ipcMain.on('show-status-bar-menu', (event) => {
    const senderWin = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    statusBarMenu.popup({ window: senderWin });
});
