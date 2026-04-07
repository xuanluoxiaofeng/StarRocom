const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')

const configPath = path.join(app.getPath('userData'), 'config.json')

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('加载配置失败:', e)
  }
  return { gpuAcceleration: true }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  } catch (e) {
    console.error('保存配置失败:', e)
  }
}

const config = loadConfig()

let petsData = null
let eggGroupsData = null
let evolutionData = null

if (!config.gpuAcceleration) {
  app.disableHardwareAcceleration()
}

app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')
app.commandLine.appendSwitch('force-color-profile', 'srgb')
app.commandLine.appendSwitch('disable-software-rasterizer')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    frame: false,
    title: 'StarRocom 星洛 - 洛克王国工具',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
}

ipcMain.on('window-minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

ipcMain.on('window-close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})

ipcMain.handle('get-gpu-acceleration', () => {
  return config.gpuAcceleration
})

ipcMain.on('set-gpu-acceleration', (event, enabled) => {
  config.gpuAcceleration = enabled
  saveConfig(config)
})

ipcMain.handle('load-pets-data', async () => {
  try {
    const petsPath = path.join(__dirname, 'public', 'data', 'Pets.json')
    petsData = JSON.parse(fs.readFileSync(petsPath, 'utf8'))
    
    const eggPath = path.join(__dirname, 'public', '洛克王国宠物蛋组.json')
    eggGroupsData = JSON.parse(fs.readFileSync(eggPath, 'utf8'))
    
    const evolutionPath = path.join(__dirname, 'public', '进化.json')
    evolutionData = JSON.parse(fs.readFileSync(evolutionPath, 'utf8'))
    
    petsData.sort((a, b) => a.id - b.id)
    
    console.log('精灵数据加载完成:', petsData.length, '只精灵')
    console.log('蛋组数据加载完成:', eggGroupsData.length, '个蛋组')
    console.log('进化数据加载完成:', Object.keys(evolutionData).length, '条进化链')
    
    return { success: true }
  } catch (error) {
    console.error('加载精灵数据失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('get-pets-data', () => {
  if (!petsData || !eggGroupsData) {
    return { pets: [], eggGroups: [] }
  }
  return { pets: petsData, eggGroups: eggGroupsData }
})

ipcMain.handle('get-evolution-data', () => {
  return evolutionData || {}
})

ipcMain.handle('get-pet-detail', async (event, id) => {
  try {
    const petPath = path.join(__dirname, 'public', 'data', 'pets', `${id}.json`)
    const pet = JSON.parse(fs.readFileSync(petPath, 'utf8'))
    return pet
  } catch (error) {
    console.error('加载精灵详情失败:', error)
    return null
  }
})

ipcMain.handle('check-file-exists', async (event, filePath) => {
  try {
    let absolutePath
    if (filePath.startsWith('public/')) {
      absolutePath = path.join(__dirname, filePath)
    } else {
      // 打包后，文件在 app.asar 根目录
      absolutePath = path.join(__dirname, filePath)
    }
    
    const stats = await fs.promises.stat(absolutePath)
    return stats.isFile()
  } catch (error) {
    return false
  }
})

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url)
    return { success: true }
  } catch (error) {
    console.error('打开外部链接失败:', error)
    return { success: false, error: error.message }
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
