const { app, BrowserWindow, shell, ipcMain, ipcRenderer } = require('electron');
const fs = require('fs');
const { session } = require('electron');
const { Menu, Tray } = require('electron');
const { type } = require('os');
const { dialog } = require('electron');
const ytdl = require('ytdl-core');
const fluentFFmpeg = require('fluent-ffmpeg');
const URL = require('url').URL;
const express = require('express');



function downloadVidAsMP4(win) {
    var curURL = win.webContents.getURL();
    if (!curURL.includes('watch'))
    {
        // Show an Electron alert dialog
        dialog.showMessageBox(win, {
            type: 'error',
            title: 'Error',
            message: 'You are not playing a video.',
            buttons: ['Alright']
        });
        return;
    }
    var videoID = curURL.split('v=');
    if (videoID.length < 2)
    {
        // Show an Electron alert dialog
        dialog.showMessageBox(win, {
            type: 'error',
            title: 'Error',
            message: 'You are not playing a video.',
            buttons: ['Alright']
        });
        return;
    }
    else {
        videoID = curURL.split('v=')[1].split('&')[0];
    }
    var videoURL = 'https://www.youtube.com/watch?v=' + videoID;
    var videoName = win.webContents.getTitle().split(' - YouTube')[0];
    var fileName = videoID + '-TMP';
    const filePath = require('path').join(app.getPath('desktop'), fileName);
    // Create a new BrowserWindow instance for the modal window
    var modalWindow = new BrowserWindow({
        width: 600, // Set the width of the modal window
        height: 180, // Set the height of the modal window
        show: false, // Hide the window initially
        resizable: false,
        titleBarStyle: 'hidden',
        minimizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: './modalPreload.js'
        }
    });

    // Load the HTML file for the modal window
    modalWindow.loadFile('modalIndex.html');

    modalWindow.show();

    modalWindow.on('close', () => {
        modalWindow.destroy();
    });

    fs.mkdirSync(app.getPath('desktop') + '/' + fileName, { recursive: true }, (err) => {});
    
    modalWindow.webContents.executeJavaScript('window.setProgress("25")');
    ytdl(videoURL, { filter: 'audioonly', format: 'ogg' })
        .pipe(fs.createWriteStream(app.getPath('desktop') + '/' + fileName + '/audio.mp3'))
        .on('finish', () => {
            modalWindow.webContents.executeJavaScript('window.setProgress("50")');
            ytdl(videoURL, { filter: 'videoonly', format: 'mp4' })
                .pipe(fs.createWriteStream(app.getPath('desktop') + '/' + fileName + '/video.mp4'))
                .on('finish', () => {
                    modalWindow.webContents.executeJavaScript('window.setProgress("75")');
                    fluentFFmpeg()
                        .input(app.getPath('desktop') + '/' + fileName + '/video.mp4')
                        .input(app.getPath('desktop') + '/' + fileName + '/audio.mp3')
                        .output(app.getPath('desktop') + '/' + videoName + '.mp4')
                        .on('progress', (progress) => {
                            const percentage = progress.percent;
                            modalWindow.webContents.executeJavaScript(`window.setProgress("90")`);
                        })
                        .on('end', () => {
                            modalWindow.webContents.executeJavaScript(`window.setProgress("100")`);
                            modalWindow.close();
                            fs.rmSync(app.getPath('desktop') + '/' + fileName + '/audio.mp3', { recursive: true });
                            fs.rmSync(app.getPath('desktop') + '/' + fileName + '/video.mp4', { recursive: true });
                            fs.rmdirSync(app.getPath('desktop') + '/' + fileName);
                            // Show an Electron alert dialog
                            dialog.showMessageBox(win, {
                                type: 'info',
                                title: 'Success',
                                message: 'Video downloaded successfully! You may find it on your desktop.',
                                buttons: ['Alright']
                            });
                        })
                        .run();
                });
        });
    
}


function downloadVidAsMP3(win) {
    var curURL = win.webContents.getURL();
    if (!curURL.includes('watch'))
    {
        // Show an Electron alert dialog
        dialog.showMessageBox(win, {
            type: 'error',
            title: 'Error',
            message: 'You are not playing a video.',
            buttons: ['Alright']
        });
        return;
    }
    var videoID = curURL.split('v=');
    if (videoID.length < 2)
    {
        // Show an Electron alert dialog
        dialog.showMessageBox(win, {
            type: 'error',
            title: 'Error',
            message: 'You are not playing a video.',
            buttons: ['Alright']
        });
        return;
    }
    else {
        videoID = curURL.split('v=')[1].split('&')[0];
    }
    var videoURL = 'https://www.youtube.com/watch?v=' + videoID;
    var videoName = win.webContents.getTitle().split(' - YouTube')[0];
    var fileName = videoID + '-TMP';
    const filePath = require('path').join(app.getPath('desktop'), fileName);
    // Create a new BrowserWindow instance for the modal window
    var modalWindow = new BrowserWindow({
        width: 600, // Set the width of the modal window
        height: 180, // Set the height of the modal window
        show: false, // Hide the window initially
        resizable: false,
        maximizable: false,
        titleBarStyle: 'hidden',
        minimizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: './modalPreload.js'
        }
    });

    // Load the HTML file for the modal window
    modalWindow.loadFile('modalIndex.html');

    modalWindow.show();

    modalWindow.on('close', () => {
        modalWindow.destroy();
    });
    
    modalWindow.webContents.executeJavaScript('window.setProgress("0")');
    ytdl(videoURL, { filter: 'audioonly', format: 'ogg' })
        .pipe(fs.createWriteStream(app.getPath('desktop') + '/' + videoName + '.ogg'))
        .on('finish', () => {
            modalWindow.close();
            // Show an Electron alert dialog
            dialog.showMessageBox(win, {
                type: 'info',
                title: 'Success',
                message: 'Audio downloaded successfully! You may find it on your desktop.',
                buttons: ['Alright']
            });
            
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

    // 10% chance of rickroll
    if (Math.random() > 0.97) {
        win.loadURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    }
    else {
        win.loadURL('https://youtube.com/');
    }

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
                    label: 'Play in Background',
                    accelerator: 'CmdOrCtrl+Shift+B',
                    click: () => {
                        win.hide();

                        let tray = null;

                        function createTray() {
                            const trayIconPath = __dirname + '/yt-tray.png'; // Replace with the actual path to your tray icon image

                            tray = new Tray(trayIconPath);

                            const contextMenu = Menu.buildFromTemplate([
                                {
                                    label: 'Show Video',
                                    click: () => {
                                        tray.destroy();
                                        win.show();
                                    }
                                },
                                {
                                    label: 'Exit',
                                    click: () => {
                                        app.quit();
                                    }
                                }
                            ]);

                            tray.setToolTip('YouTube Desktop');
                            tray.setContextMenu(contextMenu);
                        }

                        createTray();
                    }
                },
                {
                    label: 'Download Options',
                    submenu: [
                        {
                            label: 'Download Video as MP4',
                            click: () => {
                                downloadVidAsMP4(win);
                            }
                        },
                        {
                            label: 'Download Video as OGG',
                            click: () => {
                                downloadVidAsMP3(win);
                            }
                        }
                    ]
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

    win.webContents.on('context-menu', (event, params) => {
        const { x, y } = params;

        const contextMenuTemplate = (win.webContents.getURL().includes('youtube.com/watch') ? [
            {
                label: 'Cut',
                role: 'cut'
            },
            {
                label: 'Copy',
                role: 'copy'
            },
            {
                label: 'Paste',
                role: 'paste'
            },
            {
                type: 'separator'
            },
            {
                label: 'Download Video (BETA)',
                click: () => {
                    downloadVid(win);
                }
            },
            {
                label: 'Toggle Theater Mode',
                click: () => {
                    win.webContents.executeJavaScript('document.querySelector(".ytp-size-button").click()');
                }
            }
        ] : [
            {
                label: 'Cut',
                role: 'cut',
                enabled: true
            },
            {
                label: 'Copy',
                role: 'copy',
                enabled: true
            },
            {
                label: 'Paste',
                role: 'paste',
                enabled: true
            },
            {
                type: 'separator'
            },
            {
                label: 'Download Video (BETA)',
                click: () => {
                    downloadVid(win);
                },
                enabled: false
            },
            {
                label: 'Toggle Theater Mode',
                click: () => {
                    win.webContents.executeJavaScript('document.querySelector(".ytp-size-button").click()');
                },
                enabled: false
            }
        ]);

        const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
        contextMenu.popup({ window: win });
    });
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

app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl)

        if (parsedUrl.origin != 'https://youtube.com/') {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });
});