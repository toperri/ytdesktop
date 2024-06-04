const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const { session } = require('electron');
const { Menu } = require('electron');
const ytdl = require('ytdl-core');
const { type } = require('os');


// END THE MENU TEMPLATE SHIT

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        titleBarStyle: 'hiddenInset',
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

    const script = fs.readFileSync(__dirname + '/ytweb-' + process.platform + '.js', 'utf8');
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
            label: 'Edit',
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
            label: 'YouTube',
            submenu: [
                {
                    label: 'Toggle Theater Mode',
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
                },
                {
                    label: 'Download Video',
                    accelerator: 'CmdOrCtrl+D',
                    click: () => {
                        var curURL = win.webContents.getURL();
                        var videoID = curURL.split('v=')[1].split('&')[0];
                        var videoURL = 'https://www.youtube.com/watch?v=' + videoID;
                        var fileName = videoID + '.mp4';
                        const filePath = require('path').join(app.getPath('desktop'), fileName);
    
                        ytdl.getInfo(videoURL).then(info => {
                            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
                            if (format) {
                                ytdl(videoURL, { format: format })
                                    .pipe(fs.createWriteStream(filePath))
                                    .on('finish', () => {
                                        win.webContents.executeJavaScript('alert("Video downloaded successfully! You can find it on your desktop with name ' + fileName + '.")');
                                    })
                                    .on('error', (err) => {
                                        win.webContents.executeJavaScript('alert("Error downloading video: ' + err + '")');
                                    });
                            } else {
                                win.webContents.executeJavaScript('alert("Error downloading video: no suitable format found")');
                            }
                        }).catch(err => {
                            win.webContents.executeJavaScript('alert("Error downloading video: ' + err + '")');
                        });
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Webpage Options',
                    submenu: [
                        {
                            label: 'Back',
                            accelerator: 'CmdOrCtrl+Left',
                            click: () => {
                                win.webContents.goBack();
                            }
                        },
                        {
                            label: 'Forward',
                            accelerator: 'CmdOrCtrl+Right',
                            click: () => {
                                win.webContents.goForward();
                            }
                        },
                        {
                            label: 'Reload',
                            accelerator: 'CmdOrCtrl+R',
                            click: () => {
                                win.reload();
                                win.webContents.executeJavaScript(script); // the script must be re-injected so that the UI is updated to YTDesktop standards
                            }
                        },
                        {
                            label: 'Open DevTools',
                            accelerator: 'CmdOrCtrl+Shift+I',
                            click: () => {
                                win.webContents.openDevTools();
                            }
                        }
    
                    ]
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

        if (!['youtube','google'].includes(parsedUrl.hostname)) {
            event.preventDefault();
        }
    });
});