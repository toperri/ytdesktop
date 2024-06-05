const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const { session } = require('electron');
const { Menu } = require('electron');
const ytdl = require('ytdl-core');
const { type } = require('os');


// END THE MENU TEMPLATE SHIT

function downloadVid(win) {
    var curURL = win.webContents.getURL();
    var videoID = curURL.split('v=')[1].split('&')[0];
    var videoURL = 'https://www.youtube.com/watch?v=' + videoID;
    var fileName = videoID + '.mp4';
    const filePath = require('path').join(app.getPath('desktop'), fileName);
    // Create a new BrowserWindow instance for the modal window
    var modalWindow = new BrowserWindow({
        parent: win, // Set the parent window
        modal: true, // Set the window as modal
        width: 600, // Set the width of the modal window
        height: 130, // Set the height of the modal window
        show: false, // Hide the window initially
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Load the HTML file for the modal window
    modalWindow.loadFile('modalIndex.html');

   modalWindow.show();

    modalWindow.on('close', () => {
        modalWindow.destroy();
    });
    
    ytdl(videoURL)
        .pipe(fs.createWriteStream(filePath))
        .on('finish', () => {
            modalWindow.close();
            // open the file
            require('child_process').exec((process.platform == 'darwin' ? 'open' : 'start') + ' ' + filePath);
        });
}
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
                    label: 'Download Video (BETA)',
                    accelerator: 'CmdOrCtrl+D',
                    click: () => {
                        downloadVid(win);
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

        if (!parsedUrl.origin.includes('youtube.com')) {
            event.preventDefault();
        }
    });
});