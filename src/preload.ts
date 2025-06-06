import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Opens a save dialog and returns the selected file path
  openSaveDialog: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:saveFile');
  },

  // Saves content to a file at the given path
  saveFile: (filePath: string, content: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('file:save', filePath, content);
  },

  // Generates and saves G-code from a wind JSON object
  generateGcode: (windJson: object, outputPath: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('generate-gcode', windJson, outputPath);
  },

  // Generates G-code from a wind JSON object and returns it as a string
  generateAndReturnGcode: (windJson: object): Promise<{ success: boolean; gcode?: string; error?: string }> => {
    return ipcRenderer.invoke('generate-and-return-gcode', windJson);
  }
});

// Optionally insert version info into the DOM
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