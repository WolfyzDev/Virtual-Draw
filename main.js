const { app, BrowserWindow, ipcMain, screen } = require('electron');

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    },
    icon: 'src/assets/logo.png',
  });

  mainWindow.loadFile('src/index.html');

  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });

  ipcMain.on('move-window', ({ deltaX, deltaY }) => {
    const currentPosition = mainWindow.getPosition();
    const [currentX, currentY] = currentPosition;
    mainWindow.setPosition(currentX + deltaX, currentY + deltaY);
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});