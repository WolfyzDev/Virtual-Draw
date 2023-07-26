const { app, BrowserWindow, ipcMain, screen } = require('electron');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    // Définir la largeur et la hauteur de la fenêtre aux maximums
    width: width,
    height: height,
    frame: false, // Désactiver la barre de titre par défaut d'Electron
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // Définir l'icône de la fenêtre
    icon: 'src/assets/logo.png',
  });

  mainWindow.loadFile('src/index.html');
  
  mainWindow.setBackgroundColor("#272C36")
  // Intercepter les événements pour minimiser, agrandir et fermer la fenêtre
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

  ipcMain.on('move-window', (event, { deltaX, deltaY }) => {
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
