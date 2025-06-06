window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wind-form') as HTMLFormElement;
  const status = document.getElementById('status-message') as HTMLDivElement;

  const hoopBtn = document.getElementById('add-hoop') as HTMLButtonElement;
  const helicalBtn = document.getElementById('add-helical') as HTMLButtonElement;
  const confirmHelicalBtn = document.getElementById('confirm-helical') as HTMLButtonElement;
  const helicalModal = document.getElementById('helical-modal') as HTMLDivElement;

  const layersContainer = document.getElementById('layers') as HTMLDivElement;
  const layers: any[] = [];

  const removeLastBtn = document.getElementById('remove-last') as HTMLButtonElement;

  // ➕ Add Hoop layer
  hoopBtn.addEventListener('click', () => {
    const layer = { windType: "hoop", terminal: false };
    layers.push(layer);

    const div = document.createElement('div');
    div.className = 'layer-item';
    div.innerText = `🌀 Hoop layer (${layers.length}) added`;
    layersContainer.appendChild(div);
  });

  // 🔁 Show Helical modal
  helicalBtn.addEventListener('click', () => {
    helicalModal.style.display = 'block';
  });

  // 🔁 Confirm Helical layer
  confirmHelicalBtn.addEventListener('click', () => {
    const layer = {
      windType: "helical",
      windAngle: parseFloat((document.getElementById('helical-angle') as HTMLInputElement).value),
      patternNumber: parseInt((document.getElementById('helical-pattern') as HTMLInputElement).value),
      skipIndex: parseInt((document.getElementById('helical-skip') as HTMLInputElement).value),
      lockDegrees: parseInt((document.getElementById('helical-lock') as HTMLInputElement).value),
      leadInMM: parseInt((document.getElementById('helical-leadin') as HTMLInputElement).value),
      leadOutDegrees: parseInt((document.getElementById('helical-leadout') as HTMLInputElement).value),
      skipInitialNearLock: (document.getElementById('helical-skipnearlock') as HTMLInputElement).checked
    };

    layers.push(layer);

    const div = document.createElement('div');
    div.className = 'layer-item';
    div.innerText = `🔁 Helical layer: ${JSON.stringify(layer)}`;
    layersContainer.appendChild(div);

    helicalModal.style.display = 'none';
  });

  // ❌ Remove last layer
  removeLastBtn.addEventListener('click', () => {
    if (layers.length > 0) {
      layers.pop();
      const lastChild = layersContainer.lastElementChild;
      if (lastChild) layersContainer.removeChild(lastChild);
    }
  });

  // ✅ Submit form to generate and send JSON to backend (automatic output)
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const mandrelDiameter = parseFloat((document.getElementById('mandrel-diameter') as HTMLInputElement).value);
      const mandrelLength = parseFloat((document.getElementById('mandrel-length') as HTMLInputElement).value);
      const towWidth = parseFloat((document.getElementById('tow-width') as HTMLInputElement).value);
      const towThickness = parseFloat((document.getElementById('tow-thickness') as HTMLInputElement).value);
      const feedRate = parseFloat((document.getElementById('feed-rate') as HTMLInputElement).value);

      const windJson = {
        layers,
        mandrelParameters: { diameter: mandrelDiameter, windLength: mandrelLength },
        towParameters: { width: towWidth, thickness: towThickness },
        defaultFeedRate: feedRate
      };

      // @ts-ignore
      window.api.generateGcodeFromContent(JSON.stringify(windJson), 'output.gcode');

      status.textContent = '✅ G-code generation started (saved to output.gcode)...';
      status.style.color = 'green';
    } catch (err: any) {
      status.textContent = '❌ Error: ' + err.message;
      status.style.color = 'red';
    }
  });

  // 💾 Manual Save G-code with dialog
  const saveButton = document.getElementById("saveButton") as HTMLButtonElement;
  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      const mandrelDiameter = parseFloat((document.getElementById('mandrel-diameter') as HTMLInputElement).value);
      const mandrelLength = parseFloat((document.getElementById('mandrel-length') as HTMLInputElement).value);
      const towWidth = parseFloat((document.getElementById('tow-width') as HTMLInputElement).value);
      const towThickness = parseFloat((document.getElementById('tow-thickness') as HTMLInputElement).value);
      const feedRate = parseFloat((document.getElementById('feed-rate') as HTMLInputElement).value);

      const windJson = {
        layers,
        mandrelParameters: { diameter: mandrelDiameter, windLength: mandrelLength },
        towParameters: { width: towWidth, thickness: towThickness },
        defaultFeedRate: feedRate
      };

      const jsonContent = JSON.stringify(windJson, null, 2);

      // @ts-ignore
      const result = await window.api.generateAndReturnGcode(jsonContent);

      if (result.success) {
        // @ts-ignore
        const filePath = await window.api.openSaveDialog("output.gcode");
        if (filePath) {
          // @ts-ignore
          const saveRes = await window.api.saveFile(filePath, result.gcode);
          if (saveRes.success) {
            alert("✅ G-code saved successfully!");
          } else {
            alert("❌ Failed to save G-code: " + saveRes.error);
          }
        }
      } else {
        alert("❌ G-code generation failed: " + result.error);
      }
    });
  }
});