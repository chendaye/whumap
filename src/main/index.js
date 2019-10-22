'use strict'

import Uploader from './utils/uploader.js'
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  Notification,
  clipboard,
  ipcMain,
  globalShortcut,
  dialog
} from 'electron'
import db from '../datastore'
import beforeOpen from './utils/beforeOpen'
import pasteTemplate from './utils/pasteTemplate'
import updateChecker from './utils/updateChecker'
import { getPicBeds } from './utils/getPicBeds'
import pkg from '../../package.json'
import picgoCoreIPC from './utils/picgoCoreIPC'
import fixPath from 'fix-path'
import { getUploadFiles } from './utils/handleArgv'
import bus from './utils/eventBus'
import {
  updateShortKeyFromVersion212
} from './migrate/shortKeyUpdateHelper'
import {
  shortKeyUpdater,
  initShortKeyRegister
} from './utils/shortKeyHandler'
if (process.platform === 'darwin') {
  beforeOpen()
}
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
if (process.env.DEBUG_ENV === 'debug') {
  global.__static = require('path').join(__dirname, '../../static').replace(/\\/g, '\\\\')
}

let window
let settingWindow
let miniWindow
let tray
let menu
let contextMenu

// 开发地址
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const settingWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#setting/upload`
  : `file://${__dirname}/index.html#setting/upload`
const miniWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#mini-page`
  : `file://${__dirname}/index.html#mini-page`

// fix the $PATH in macOS
fixPath()
// todo:任务栏图标菜单
function createContextMenu () {
  contextMenu = Menu.buildFromTemplate([
    {
      label: '关于',
      click () {
        dialog.showMessageBox({
          title: 'WhuMap',
          message: 'WhuMap',
          detail: `Version: ${pkg.version}\nAuthor: chendaye\nGithub: https://github.com/chendaye/whumap`
        })
      }
    },
    {
      label: '打开详细窗口',
      click () {
        if (settingWindow === null) {
          createSettingWindow()
          settingWindow.show()
        } else {
          settingWindow.show()
          settingWindow.focus()
        }
        if (miniWindow) {
          miniWindow.hide()
        }
      }
    },
    {
      label: '打开更新助手',
      type: 'checkbox',
      checked: db.get('settings.showUpdateTip'),
      click () {
        const value = db.get('settings.showUpdateTip')
        db.set('settings.showUpdateTip', !value)
      }
    },
    {
      label: '重启应用',
      click () {
        app.relaunch()
        app.exit(0)
      }
    },
    {
      role: 'quit',
      label: '退出'
    }
  ])
}

// todo:创建任务栏图标
function createTray () {
  const menubarPic = process.platform === 'darwin' ? `${__static}/menubar.png` : `${__static}/menubar-nodarwin.png`
  tray = new Tray(menubarPic)
  // 右击事件
  tray.on('right-click', () => {
    if (window) {
      window.hide()
    }
    // 右击菜单
    createContextMenu()
    // 设置菜单内容
    tray.popUpContextMenu(contextMenu)
  })
  // 左键点击
  tray.on('click', (event, bounds) => {
    // 如果是 macOS
    if (process.platform === 'darwin') {
      toggleWindow(bounds) // 打开或关闭小窗口
    } else {
      // 如果是windows
      if (window) {
        // 隐藏小窗口
        window.hide()
      }
      if (settingWindow === null) {
        // 如果主窗口不存在就创建一个
        createSettingWindow()
        settingWindow.show()
      } else {
        // 如果主窗口存在就显示并激活
        settingWindow.show()
        settingWindow.focus()
      }
      if (miniWindow) {
        miniWindow.hide()
      }
    }
  })
}

// todo:创建BrowserWindow窗口
const createWindow = () => {
  // 支持macOS 和 windows
  if (process.platform !== 'darwin' && process.platform !== 'win32') {
    return
  }
  window = new BrowserWindow({
    height: 350, // 高
    width: 196, // 宽
    show: false, // 创建后是否显示
    frame: false, // 是否创建frameless窗口。frame这个选项，默认是true。如果选择了false则会创建一个frameless窗口，创建一个没有顶部工具栏、没有border的窗口。这个也是我们在windows系统下自定义顶部栏的基础
    fullscreenable: false, // 是否允许全屏
    resizable: false, // 是否允许拉伸大小
    transparent: true, // 是否是透明窗口（仅macOS）
    vibrancy: 'ultra-dark', // 窗口模糊的样式（仅macOS）
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: false // 当页面被置于非激活窗口的时候是否停止动画和计时器
    }
  })
  // 窗口页面url
  window.loadURL(winURL)
  // 关闭窗口的回调
  window.on('closed', () => {
    window = null
  })
  // 失去焦点的回调
  window.on('blur', () => {
    window.hide()
  })
  return window
}
// todo:linux 下的 miniWindow
const createMiniWidow = () => {
  // linux 下的mini窗口
  if (miniWindow) {
    return false
  }
  let obj = {
    height: 64,
    width: 64,
    show: process.platform === 'linux',
    frame: false,
    fullscreenable: false,
    skipTaskbar: true,
    resizable: false,
    transparent: process.platform !== 'linux',
    icon: `${__static}/logo.png`,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  }

  if (db.get('settings.miniWindowOntop')) {
    obj.alwaysOnTop = true
  }

  miniWindow = new BrowserWindow(obj)

  miniWindow.loadURL(miniWinURL)

  miniWindow.on('closed', () => {
    miniWindow = null
  })
  return miniWindow
}

// todo: 主窗口
const createSettingWindow = () => {
  const options = {
    height: 450,
    width: 800,
    show: false,
    frame: true,
    center: true,
    fullscreenable: false,
    resizable: false,
    title: 'WhuMap',
    vibrancy: 'ultra-dark',
    transparent: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false
    }
  }
  if (process.platform !== 'darwin') {
    options.show = false
    options.frame = false
    options.backgroundColor = '#3f3c37'
    options.transparent = false
    options.icon = `${__static}/logo.png`
  }
  // 主窗口实例
  settingWindow = new BrowserWindow(options)
  // 页面url
  settingWindow.loadURL(settingWinURL)
  // 窗口关闭的钩子
  settingWindow.on('closed', () => {
    bus.emit('toggleShortKeyModifiedMode', false)
    settingWindow = null
    if (process.platform === 'linux') {
      process.nextTick(() => {
        app.quit() // 退出
      })
    }
  })
  // 创建菜单
  createMenu()
  // 创建mini窗口
  createMiniWidow()
  return settingWindow
}

// todo: 创建菜单
const createMenu = () => {
  if (process.env.NODE_ENV !== 'development') {
    const template = [{
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click () {
            app.quit()
          }
        }
      ]
    }]
    menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}

const toggleWindow = (bounds) => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow(bounds)
  }
}

const showWindow = (bounds) => {
  window.setPosition(bounds.x - 98 + 11, bounds.y, false)
  window.webContents.send('updateFiles')
  window.show()
  window.focus()
}

const uploadClipboardFiles = async () => {
  let win
  if (miniWindow.isVisible()) {
    win = miniWindow
  } else {
    win = settingWindow || window || createSettingWindow()
  }
  let img = await new Uploader(undefined, win.webContents).upload()
  if (img !== false) {
    if (img.length > 0) {
      const pasteStyle = db.get('settings.pasteStyle') || 'markdown'
      clipboard.writeText(pasteTemplate(pasteStyle, img[0]))
      const notification = new Notification({
        title: '上传成功',
        body: img[0].imgUrl,
        icon: img[0].imgUrl
      })
      notification.show()
      db.insert('uploaded', img[0])
      window.webContents.send('clipboardFiles', [])
      window.webContents.send('uploadFiles', img)
      if (settingWindow) {
        settingWindow.webContents.send('updateGallery')
      }
    } else {
      const notification = new Notification({
        title: '上传不成功',
        body: '你剪贴板最新的一条记录不是图片哦'
      })
      notification.show()
    }
  }
}

const uploadChoosedFiles = async (webContents, files) => {
  const input = files.map(item => item.path)
  const imgs = await new Uploader(input, webContents).upload()
  if (imgs !== false) {
    const pasteStyle = db.get('settings.pasteStyle') || 'markdown'
    let pasteText = ''
    for (let i in imgs) {
      pasteText += pasteTemplate(pasteStyle, imgs[i]) + '\r\n'
      const notification = new Notification({
        title: '上传成功',
        body: imgs[i].imgUrl,
        icon: files[i].path
      })
      setTimeout(() => {
        notification.show()
      }, i * 100)
      db.insert('uploaded', imgs[i])
    }
    clipboard.writeText(pasteText)
    window.webContents.send('uploadFiles', imgs)
    if (settingWindow) {
      settingWindow.webContents.send('updateGallery')
    }
  }
}

picgoCoreIPC(app, ipcMain)

// from macOS tray
ipcMain.on('uploadClipboardFiles', async (evt, file) => {
  const img = await new Uploader(undefined, window.webContents).upload()
  if (img !== false) {
    const pasteStyle = db.get('settings.pasteStyle') || 'markdown'
    clipboard.writeText(pasteTemplate(pasteStyle, img[0]))
    const notification = new Notification({
      title: '上传成功',
      body: img[0].imgUrl,
      // icon: file[0]
      icon: img[0].imgUrl
    })
    notification.show()
    db.insert('uploaded', img[0])
    window.webContents.send('clipboardFiles', [])
    if (settingWindow) {
      settingWindow.webContents.send('updateGallery')
    }
  }
  window.webContents.send('uploadFiles')
})

ipcMain.on('uploadClipboardFilesFromUploadPage', () => {
  uploadClipboardFiles()
})

ipcMain.on('uploadChoosedFiles', async (evt, files) => {
  return uploadChoosedFiles(evt.sender, files)
})

ipcMain.on('updateShortKey', (evt, item, oldKey) => {
  shortKeyUpdater(globalShortcut, item, oldKey)
  const notification = new Notification({
    title: '操作成功',
    body: '你的快捷键已经修改成功'
  })
  notification.show()
})

ipcMain.on('updateCustomLink', (evt, oldLink) => {
  const notification = new Notification({
    title: '操作成功',
    body: '你的自定义链接格式已经修改成功'
  })
  notification.show()
})

ipcMain.on('autoStart', (evt, val) => {
  app.setLoginItemSettings({
    openAtLogin: val
  })
})

ipcMain.on('openSettingWindow', (evt) => {
  if (!settingWindow) {
    createSettingWindow()
  } else {
    settingWindow.show()
  }
  miniWindow.hide()
})

ipcMain.on('openMiniWindow', (evt) => {
  if (!miniWindow) {
    createMiniWidow()
  }
  miniWindow.show()
  miniWindow.focus()
  settingWindow.hide()
})

//  from mini window
ipcMain.on('syncPicBed', (evt) => {
  if (settingWindow) {
    settingWindow.webContents.send('syncPicBed')
  }
})

ipcMain.on('getPicBeds', (evt) => {
  const picBeds = getPicBeds(app)
  evt.sender.send('getPicBeds', picBeds)
  evt.returnValue = picBeds
})

ipcMain.on('toggleShortKeyModifiedMode', (evt, val) => {
  bus.emit('toggleShortKeyModifiedMode', val)
})

// const shortKeyHash = {
//   upload: uploadClipboardFiles
// }

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    let files = getUploadFiles(commandLine, workingDirectory)
    if (files === null || files.length > 0) { // 如果有文件列表作为参数，说明是命令行启动
      if (files === null) {
        uploadClipboardFiles()
      } else {
        let win
        if (miniWindow && miniWindow.isVisible()) {
          win = miniWindow
        } else {
          win = settingWindow || window || createSettingWindow()
        }
        uploadChoosedFiles(win.webContents, files)
      }
    } else {
      if (settingWindow) {
        if (settingWindow.isMinimized()) {
          settingWindow.restore()
        }
        settingWindow.focus()
      }
    }
  })
}

if (process.platform === 'win32') {
  app.setAppUserModelId(pkg.build.appId)
}

if (process.env.XDG_CURRENT_DESKTOP && process.env.XDG_CURRENT_DESKTOP.includes('Unity')) {
  process.env.XDG_CURRENT_DESKTOP = 'Unity'
}

app.on('ready', () => {
  createWindow()
  createSettingWindow()
  if (process.platform === 'darwin' || process.platform === 'win32') {
    createTray()
  }
  db.set('needReload', false)
  updateChecker()
  initEventCenter()
  // 不需要阻塞
  process.nextTick(() => {
    updateShortKeyFromVersion212(db, db.get('settings.shortKey'))
    initShortKeyRegister(globalShortcut, db.get('settings.shortKey'))
  })

  if (process.env.NODE_ENV !== 'development') {
    let files = getUploadFiles()
    if (files === null || files.length > 0) { // 如果有文件列表作为参数，说明是命令行启动
      if (files === null) {
        uploadClipboardFiles()
      } else {
        let win
        if (miniWindow && miniWindow.isVisible()) {
          win = miniWindow
        } else {
          win = settingWindow || window || createSettingWindow()
        }
        uploadChoosedFiles(win.webContents, files)
      }
    }
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (window === null) {
    createWindow()
  }
  if (settingWindow === null) {
    createSettingWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  bus.removeAllListeners()
})

app.setLoginItemSettings({
  openAtLogin: db.get('settings.autoStart') || false
})

function initEventCenter () {
  const eventList = {
    'picgo:upload': uploadClipboardFiles
  }
  for (let i in eventList) {
    bus.on(i, eventList[i])
  }
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
*/

// import { autoUpdater } from 'electron-updater'

// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall()
// })

// app.on('ready', () => {
//   if (process.env.NODE_ENV === 'production') {
//     autoUpdater.checkForUpdates()
//   }
// })
