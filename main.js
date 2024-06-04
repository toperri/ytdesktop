const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const { session } = require('electron');
const { Menu } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true,
            preload: __dirname + '/ytpreload.js'
        }
    });

    win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['Client'] = 'YouDesktop';
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    win.loadURL('https://youtube.com/');

    const script = fs.readFileSync(__dirname + '/ytweb.js', 'utf8');
    win.webContents.executeJavaScript(script);

    const menuTemplate = [
        {
            label: 'App',
            submenu: [
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit Text',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectAll'
                }
            ]
        },
        {
            label: 'Video',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        win.reload();
                        win.webContents.executeJavaScript(script); // the script must be re-injected so that the UI is updated to YTDesktop standards
                    }
                },
                {
                    label: 'Toggle Cinema Mode',
                    accelerator: 'CmdOrCtrl+Shift+C',
                    click: () => {
                        win.webContents.executeJavaScript('document.querySelector(".ytp-size-button").click()');
                    }
                },
                {
                    label: 'Toggle Fullscreen',
                    accelerator: 'CmdOrCtrl+Shift+F',
                    click: () => {
                        win.webContents.executeJavaScript('document.querySelector(".ytp-fullscreen-button").click()');
                    }
                },
                {
                    label: 'Toggle Subtitles',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => {
                        win.webContents.executeJavaScript('document.querySelector(".ytp-subtitles-button").click()');
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        win.webContents.executeJavaScript('alert("YouDesktop v0.1 - Developed by toperri")');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

const URL = require('url').URL;

app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl)

        if (parsedUrl.origin !== 'https://youtube.com') {
            event.preventDefault();
        }
    });
});