import { app, BrowserWindow, ipcMain } from 'electron';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Uncomment for development tools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 🔧 Handler to generate G-code from file path (existing)
ipcMain.on('generate-gcode', (event, { jsonPath, outputPath }) => {
  const command = `npm run cli -- plan -o "${outputPath}" "${jsonPath}"`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error while generating G-code:', error.message);
    } else {
      console.log('✅ G-code generated successfully:\n', stdout);
    }
  });
});

// 🆕 Handler to generate G-code directly from JSON content
ipcMain.on('generate-gcode-from-content', (event, { jsonContent, outputPath }) => {
  const tempPath = path.join(__dirname, 'primo.wind'); // temporary input file

  try {
    fs.writeFileSync(tempPath, jsonContent);

    const command = `npm run cli -- plan -o "${outputPath}" "${tempPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error generating G-code:', error.message);
      } else {
        console.log('✅ G-code generated from content:\n', stdout);
      }
    });
  } catch (writeErr) {
    console.error('❌ Failed to write input file:', writeErr);
  }
});