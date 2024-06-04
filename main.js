const { app, BrowserWindow } = require('electron');
const fs = require('fs');

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