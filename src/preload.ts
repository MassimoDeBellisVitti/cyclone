// All Node.js APIs are available in the preload process.
// This environment runs in the same sandbox as a Chrome extension.

import { contextBridge, ipcRenderer } from 'electron';

// Expose a secure API to the renderer process
contextBridge.exposeInMainWorld('api', {
  // New method: send JSON content directly to main process
  generateGcodeFromContent: (jsonContent: string, outputPath: string) => {
    ipcRenderer.send('generate-gcode-from-content', { jsonContent, outputPath });
  }
});

// Optional: Replace version placeholders in the DOM (if present)
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