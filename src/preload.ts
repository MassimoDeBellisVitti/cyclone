import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Opens a save dialog and returns the selected file path
  openSaveDialog: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:saveFile');
  },

  // Saves content to a file at the given path
  saveFile: (filePath: string, content: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('file:save', filePath, content);
  },

  // Sends JSON content and output path to the main process to generate G-code
  generateGcodeFromContent: (jsonContent: string, outputPath: string) => {
    ipcRenderer.send('generate-gcode-from-content', { jsonContent, outputPath });
  },

  generateAndReturnGcode: (jsonContent: string) => ipcRenderer.invoke('generate-and-return-gcode', { jsonContent }),
});

// Optionally replace version placeholders in the DOM
window.addEventListener('DOMContentLoaded', () => {
  const replaceTextContent = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceTextContent(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
  }
});