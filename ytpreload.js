const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  setProgressBar: (value) => ipcRenderer.send('set-progress-bar', value)
});