const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});

contextBridge.exposeInMainWorld('platform', {
  isWindows: process.platform === 'win32',
});

contextBridge.exposeInMainWorld('electronStore', {
  get: (key) => ipcRenderer.invoke('getStoreValue', key),
  set: (key, value) => ipcRenderer.invoke('setStoreValue', key, value),
});

contextBridge.exposeInMainWorld('electronMenu', {
  setChecked: (id, checked) => ipcRenderer.send('set-checked', id, checked)
});
