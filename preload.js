const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  getGpuAcceleration: () => ipcRenderer.invoke('get-gpu-acceleration'),
  setGpuAcceleration: (enabled) => ipcRenderer.send('set-gpu-acceleration', enabled),
  loadPetsData: () => ipcRenderer.invoke('load-pets-data'),
  getPetsData: () => ipcRenderer.invoke('get-pets-data'),
  getEvolutionData: () => ipcRenderer.invoke('get-evolution-data'),
  getPetDetail: (id) => ipcRenderer.invoke('get-pet-detail', id),
  checkFileExists: (filePath) => ipcRenderer.invoke('check-file-exists', filePath),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showMapView: () => ipcRenderer.send('show-map-view'),
  hideMapView: () => ipcRenderer.send('hide-map-view')
})
