import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Create the main application window
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

  // Uncomment to open dev tools for debugging
  // mainWindow.webContents.openDevTools();
}

// App lifecycle
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handler: generate G-code from a JSON file path (not used in new version)
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

// Handler: generate G-code directly from JSON content and save to output path
ipcMain.on('generate-gcode-from-content', (event, { jsonContent, outputPath }) => {
  const tempPath = path.join(__dirname, 'primo.wind');

  try {
    fs.writeFileSync(tempPath, jsonContent);

    const command = `npm run cli -- plan -o "${outputPath}" "${tempPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error generating G-code:', error.message);
      } else {
        console.log('✅ G-code generated from content:\n', stdout);
      }

      // Cleanup temp file
      try { fs.unlinkSync(tempPath); } catch {}
    });
  } catch (writeErr) {
    console.error('❌ Failed to write temporary input file:', writeErr);
  }
});

// Handler: show save dialog and return the selected path
ipcMain.handle('dialog:saveFile', async (_, defaultPath = "output.gcode") => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath,
    filters: [{ name: 'G-code', extensions: ['gcode'] }]
  });
  return filePath;
});

// Handler: save raw content to disk
ipcMain.handle('file:save', async (_, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Handler: generate G-code from JSON and return its string content
ipcMain.handle('generate-and-return-gcode', async (_, { jsonContent }) => {
  const tempWindPath = path.join(__dirname, 'temp.wind');
  const tempGcodePath = path.join(__dirname, 'temp.gcode');

  try {
    fs.writeFileSync(tempWindPath, jsonContent);

    const command = `npm run cli -- plan -o "${tempGcodePath}" "${tempWindPath}"`;

    return await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject({ success: false, error: error.message });
        } else {
          try {
            const gcode = fs.readFileSync(tempGcodePath, 'utf-8');
            resolve({ success: true, gcode });
          } catch {
            reject({ success: false, error: 'Failed to read generated G-code.' });
          } finally {
            // Clean up both temp files
            try { fs.unlinkSync(tempWindPath); } catch {}
            try { fs.unlinkSync(tempGcodePath); } catch {}
          }
        }
      });
    });
  } catch {
    return { success: false, error: 'Failed to write input .wind file.' };
  }
});