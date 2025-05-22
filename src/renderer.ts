// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.


// This script runs in the renderer process and interacts with the DOM.
// It uses the secure `window.api` exposed by preload.js to communicate with the main process.

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('wind-form') as HTMLFormElement;
    const input = document.getElementById('json-input') as HTMLTextAreaElement;
    const status = document.getElementById('status-message') as HTMLDivElement;
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      try {
        const jsonText = input.value.trim();
        console.log("User input:", jsonText);
  
        // Validate JSON before sending
        JSON.parse(jsonText);
  
        // Call backend via secure API (from preload)
        // @ts-ignore
        window.api.generateGcodeFromContent(jsonText, 'output.gcode');
  
        status.textContent = '✅ G-code generation started...';
        status.style.color = 'green';
      } catch (error: any) {
        console.error("JSON parse error:", error.message);
        status.textContent = '❌ Invalid JSON input: ' + error.message;
        status.style.color = 'red';
      }
    });
  });