window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wind-form') as HTMLFormElement;
  const status = document.getElementById('status-message') as HTMLDivElement;

  const hoopBtn = document.getElementById('add-hoop') as HTMLButtonElement;
  const helicalBtn = document.getElementById('add-helical') as HTMLButtonElement;
  const confirmHelicalBtn = document.getElementById('confirm-helical') as HTMLButtonElement;
  const helicalModal = document.getElementById('helical-modal') as HTMLDivElement;

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

  // 🔁 Show Helical Modal
  helicalBtn.addEventListener('click', () => {
    helicalModal.style.display = 'block';
  });

  // 🔁 Confirm and Add Helical Layer
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