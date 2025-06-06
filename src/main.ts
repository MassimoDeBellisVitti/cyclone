import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { generateGcodeFromWindObject } from './generator';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html'));
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    // Recreate a window if the app is reactivated and no windows are open (macOS behavior)
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Quit the app when all windows are closed (except on macOS)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC: open save dialog and return selected file path
ipcMain.handle('dialog:saveFile', async (_, defaultPath = 'output.gcode') => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath,
    filters: [{ name: 'G-code', extensions: ['gcode'] }]
  });
  return filePath;
});

// IPC: write arbitrary content to a file
ipcMain.handle('file:save', async (_, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// IPC: generate G-code from a JSON object and save it to a file
ipcMain.handle('generate-gcode', async (_, windJson: object, outputPath: string) => {
  try {
    const gcodeLines = generateGcodeFromWindObject(windJson, false);
    fs.writeFileSync(outputPath, gcodeLines.join('\n'));
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// IPC: generate G-code from a JSON object and return it as a string
ipcMain.handle('generate-and-return-gcode', async (_, windJson: object) => {
  try {
    const gcodeLines = generateGcodeFromWindObject(windJson, false);
    return { success: true, gcode: gcodeLines.join('\n') };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});