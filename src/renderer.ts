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
    const status = document.getElementById('status-message') as HTMLDivElement;
  
    const hoopBtn = document.getElementById('add-hoop') as HTMLButtonElement;
    const layersContainer = document.getElementById('layers') as HTMLDivElement;
    const layers: any[] = [];
  
    // 🌀 Add Hoop layer
    hoopBtn.addEventListener('click', () => {
      const layer = { windType: "hoop", terminal: false };
      layers.push(layer);
  
      const div = document.createElement('div');
      div.className = 'layer-item';
      div.innerText = `🌀 Hoop layer (${layers.length}) added`;
      layersContainer.appendChild(div);
    });
  
    // ✅ On submit: gather all fields and generate final JSON
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      try {
        // Read values from inputs
        const mandrelDiameter = parseFloat((document.getElementById('mandrel-diameter') as HTMLInputElement).value);
        const mandrelLength = parseFloat((document.getElementById('mandrel-length') as HTMLInputElement).value);
        const towWidth = parseFloat((document.getElementById('tow-width') as HTMLInputElement).value);
        const towThickness = parseFloat((document.getElementById('tow-thickness') as HTMLInputElement).value);
        const feedRate = parseFloat((document.getElementById('feed-rate') as HTMLInputElement).value);
  
        // Compose final JSON
        const windJson = {
          layers: layers,
          mandrelParameters: {
            diameter: mandrelDiameter,
            windLength: mandrelLength
          },
          towParameters: {
            width: towWidth,
            thickness: towThickness
          },
          defaultFeedRate: feedRate
        };
  
        // Debug log
        console.log("Generated JSON:", windJson);
  
        // Call backend via secure API
        // @ts-ignore
        window.api.generateGcodeFromContent(JSON.stringify(windJson), 'output.gcode');
  
        status.textContent = '✅ G-code generation started...';
        status.style.color = 'green';
      } catch (err: any) {
        status.textContent = '❌ Error: ' + err.message;
        status.style.color = 'red';
      }
    });
  });