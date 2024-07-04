const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  // Cargar el archivo index.html
  win.loadFile('index.html');

  // Crear el menú de la aplicación
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nuevo',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            win.webContents.send('menu-new');
          }
        },
        {
          label: 'Abrir',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            win.webContents.send('menu-open');
          }
        },
        {
          label: 'Guardar',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            win.webContents.send('menu-save');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  ipcMain.handle('open-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Markdown Files', extensions: ['md'] }]
    });

    if (!result.canceled) {
      const filePath = result.filePaths[0];
      const content = await fs.promises.readFile(filePath, 'utf8');
      return { filePath, content };
    }
    return null;
  });

  ipcMain.handle('save-file', async (event, { filePath, content }) => {
    if (!filePath) {
      const result = await dialog.showSaveDialog({
        filters: [{ name: 'Markdown Files', extensions: ['md'] }]
      });

      if (!result.canceled) {
        filePath = result.filePath;
      }
    }

    if (filePath) {
      await fs.promises.writeFile(filePath, content, 'utf8');
      return filePath;
    }
    return null;
  });
}

app.on('ready', createWindow);
