const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel: string, data: any[]) => ipcRenderer.send(channel, data),
    on: (channel: string, func: any) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});

contextBridge.exposeInMainWorld('platform', {
  isWindows: process.platform === 'win32',
});

contextBridge.exposeInMainWorld('electronStore', {
  get: (key: string) => ipcRenderer.invoke('getStoreValue', key),
  set: (key: string, value: any) => ipcRenderer.invoke('setStoreValue', key, value),
});

contextBridge.exposeInMainWorld('electronMenu', {
  setChecked: (id: string, checked: boolean) => ipcRenderer.send('set-checked', id, checked)
});
