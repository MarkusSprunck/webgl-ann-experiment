import {ModelFactory} from '../factories/ModelFactory';
import {Network} from '../core/Network';
import {exposeRendererToWindow} from '../renderer/WebGLRenderer';
import {RMEChart} from '../ui/RMEChart';

// Minimal browser glue to demonstrate TS ANN running in the existing HTML page
function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function writeInfo(msg: string) {
  const el = $('infoLabelContainer1');
  if (el) el.textContent = msg;
  console.log(msg);
}

export function initApp() {
  // guard: ensure init runs only once (idempotent)
  if ((window as any).__tsInitDone) {
    console.log('initApp: already initialized — skipping');
    return;
  }
  (window as any).__tsInitDone = true;

  // Expose the WebGL renderer to window for backwards compatibility
  exposeRendererToWindow();

  writeInfo('Initializing ANN (TypeScript)...');
  const factory = new ModelFactory();
  const network: Network = factory.createBindTestPattern();

  // Create 80/20 train/test split
  factory.createTrainTestSplit();

  writeInfo('Created network with layers: ' + network.getLayers().length);
  // Reset network on load so visualization starts from a clean state
  try {
    network.resetLinks();
    network.recallNetwork();
    writeInfo('Network reset on load (TS).');
  } catch (e) {
    console.warn('Failed to reset network on load', e);
  }

  // If the legacy WebGL renderer is present, provide it with the network JSON
  function publishModel() {
    if (typeof (window as any).renderData === 'function') {
      try {
        (window as any).renderData(network.toString());// If renderer exposes a forceRender hook, call it to ensure immediate repaint
        if (typeof (window as any).forceRender === 'function') {
          try { (window as any).forceRender(); } catch (e) { console.warn('forceRender failed', e); }
        }
      } catch (e) {
        console.warn('Failed to call renderData', e);
      }
    }
  }
  publishModel();

  // Initialize RME Chart
  const rmeChart = new RMEChart('rmeChart', 'rmeGraphContainer');
  const rmeDisplay = document.getElementById('rmeDisplay');
  let trainingIteration = 0;

  // Function to update RME display
  function updateRMEDisplay(trainRme: number, testRme: number, iteration: number) {
    if (rmeDisplay) {
      rmeDisplay.innerHTML = `<span style="color: #4CAF50;">Train: ${trainRme.toFixed(6)}</span> | <span style="color: #2196F3;">Test: ${testRme.toFixed(6)}</span>`;
    }
    rmeChart.addDataPoint(iteration, trainRme, testRme);
  }

  // Hook up simple UI buttons if present (use static controls in index.html)
  const trainBtn = document.getElementById('ts-train-button') as HTMLButtonElement | null;
  const resetBtn = document.getElementById('ts-reset-button') as HTMLButtonElement | null;
  const recallBtn = document.getElementById('ts-recall-button') as HTMLButtonElement | null;
  const stopBtn = document.getElementById('ts-stop-button') as HTMLButtonElement | null;

  // state for recall loop
  let recallTimer: number | null = null;
  let recallIndex = 0;

  // state for training control
  let isTraining = false;
  let stopTraining = false;

  function setRecallRunning(running: boolean) {
    if (recallBtn) recallBtn.disabled = running;
    if (stopBtn) stopBtn.disabled = !running;
  }

  if (trainBtn) {
    trainBtn.addEventListener('click', () => {
      console.log('Train button clicked');
      // stop recall if running to avoid interference
      if (recallTimer !== null) {
        clearInterval(recallTimer);
        recallTimer = null;
        setRecallRunning(false);
        writeInfo('Recall stopped due to training');
      }

      // Start endless training
      if (!isTraining) {
        stopTraining = false;
        trainContinuous().catch((e) => {
          console.error('Training failed', e);
          isTraining = false;
          if (trainBtn) trainBtn.disabled = false;
          if (stopBtn) stopBtn.disabled = true;
        });
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      console.log('Reset button clicked');

      // Stop training if running
      if (isTraining) {
        stopTraining = true;
        writeInfo('Training stopped due to reset');
      }

      // stop recall if running
      if (recallTimer !== null) {
        clearInterval(recallTimer);
        recallTimer = null;
        setRecallRunning(false);
        writeInfo('Recall stopped due to reset');
      }
      // perform reset and update visualization
      network.resetLinks();
      try {
        network.recallNetwork();
      } catch (e) {
        console.warn('Failed to recall network after reset', e);
      }
      writeInfo('Network links reset (TS).');
      publishModel();

      // Reset RME display and chart
      trainingIteration = 0;
      rmeChart.reset();
      if (rmeDisplay) {
        rmeDisplay.textContent = 'RMS: --';
      }
    });
  }

  if (recallBtn) {
    recallBtn.addEventListener('click', () => {
      console.log('Recall button clicked');
      if (recallTimer !== null) {
        console.log('Recall already running');
        return;
      }

      // Use fixed interval of 50ms
      const intervalMs = 50;

      // start cycling through patterns every intervalMs
      recallIndex = 0;
      recallTimer = window.setInterval(() => {
        try {
          const patterns = (factory as any).getNumberOfPattern ? (factory as any).getNumberOfPattern() : 0;
          if (patterns <= 0) return;
          // activate in sequence
          (factory as any).activatePattern(recallIndex % patterns);
          network.recallNetwork();
          publishModel();
          recallIndex++;
        } catch (e) {
          console.warn('Recall interval failed', e);
        }
      }, intervalMs) as unknown as number;

      setRecallRunning(true);
      writeInfo('Recall started (interval ' + intervalMs + 'ms)');
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      console.log('Stop button clicked');

      // Stop training if running
      if (isTraining) {
        stopTraining = true;
        writeInfo('Training stopped by user');
      }

      // Stop recall if running
      if (recallTimer !== null) {
        clearInterval(recallTimer);
        recallTimer = null;
        setRecallRunning(false);
        writeInfo('Recall stopped');
      }
    });
  }

  // Continuous training function - runs until stopped
  async function trainContinuous() {
    if (isTraining) {
      console.log('Training already running');
      return;
    }

    isTraining = true;
    stopTraining = false;

    if (trainBtn) trainBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;

    writeInfo('Training started (continuous until stopped)...');
    console.log('Continuous training started');

    // Show RME chart
    rmeChart.show();

    const LOG_EVERY_MS = 200;
    let lastLog = Date.now();
    let completed = 0;

    try {
      while (!stopTraining) {
        // Train in small chunks to keep UI responsive
        const chunk = 100;
        for (let r = 0; r < chunk; r++) {
          if (stopTraining) break;

          // Train on training data only (80% of patterns)
          const trainSize = (factory as any).getTrainSize();
          const randomTrainIndex = Math.floor(Math.random() * trainSize);
          (factory as any).activateTrainPattern(randomTrainIndex);

          // Perform one training step on this training pattern
          network.recallNetwork();
          const maxLayerIndex = network.getLayers().length - 1;
          for (const neuron of network.getLayers()[maxLayerIndex].getNeurons()) {
            (neuron as any).calculateEvaluateOutputError();
          }
          for (let k = maxLayerIndex; k > 0; k--) {
            for (const neuron of network.getLayers()[k].getNeurons()) {
              (neuron as any).calculateEvaluateOutputErrorHiddenNeurons(0.001);
            }
          }
          for (let k = maxLayerIndex; k > 0; k--) {
            for (const neuron of network.getLayers()[k].getNeurons()) {
              for (const link of (neuron as any).getLinks()) {
                const weightDecayTerm = Math.pow(10, -4.0) * link.weight;
                const momentumTerm = 0.1 * link.deltaWeigthOld;
                link.deltaWeigth = link.deltaWeigth - 2.0 * link.source.output * (neuron as any).getOutputDerived() * (neuron as any).getOutputError() + momentumTerm - weightDecayTerm;
              }
            }
          }
          for (let k = maxLayerIndex; k > 0; k--) {
            for (const neuron of network.getLayers()[k].getNeurons()) {
              for (const link of (neuron as any).getLinks()) {
                link.weight = link.weight + link.deltaWeigth;
                link.deltaWeigthOld = link.deltaWeigth;
                link.deltaWeigth = 0.0;
              }
            }
          }
          for (let k = maxLayerIndex; k > 0; k--) {
            for (const neuron of network.getLayers()[k].getNeurons()) {
              (neuron as any).setOutputError(0.0);
            }
          }

          completed++;
          trainingIteration++;
        }

        // After each chunk, push update to the renderer
        publishModel();

        // Calculate RMS for both train and test sets
        try {
          const trainRms = network.rmsForIndices(factory as any, (factory as any).trainIndices);
          const testRms = network.rmsForIndices(factory as any, (factory as any).testIndices);
          updateRMEDisplay(trainRms, testRms, trainingIteration);
        } catch (e) {
          console.warn('Failed to update RME display', e);
        }

        // Log progress and RMS periodically
        try {
          const now = Date.now();
          if (now - lastLog >= LOG_EVERY_MS) {
            lastLog = now;
            let trainRmsVal: number | string = 'n/a';
            let testRmsVal: number | string = 'n/a';
            try {
              trainRmsVal = network.rmsForIndices(factory as any, (factory as any).trainIndices).toFixed(6);
              testRmsVal = network.rmsForIndices(factory as any, (factory as any).testIndices).toFixed(6);
            } catch (e) { /* ignore */ }
            console.log('Training progress - iterations:', completed, 'Train RMS:', trainRmsVal, 'Test RMS:', testRmsVal);
            writeInfo(' iterations: ' + completed);
          }
        } catch (e) {
          console.warn('Progress logging failed', e);
        }

        // Yield to the event loop to keep UI responsive
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      // Training stopped
      try {
        const trainRms = network.rmsForIndices(factory as any, (factory as any).trainIndices);
        const testRms = network.rmsForIndices(factory as any, (factory as any).testIndices);
        writeInfo('Training stopped. Iterations: ' + completed);
        console.log('Training stopped');
      } catch (e) {
        console.warn('Failed to compute final RMS after training', e);
        writeInfo('Training stopped. Iterations: ' + completed);
      }
    } finally {
      isTraining = false;
      stopTraining = false;
      if (trainBtn) trainBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
    }
  }

  // Legacy async trainer (kept for compatibility but not used)
  async function trainAsync(totalIterations: number, steps: number, chunk = 2) {
    if (trainBtn) trainBtn.disabled = true;
    writeInfo('Training (async)...');
    console.log('trainAsync start', { totalIterations, steps, chunk });

    // Show RME chart
    rmeChart.show();

    // total represents the remaining "calls" we will make; keep history for logging
    let total = totalIterations * steps;
    let completed = 0;
    const LOG_EVERY_MS = 200; // at most log this often (safety)
    let lastLog = Date.now();

    while (total > 0) {
      const run = Math.min(chunk, total);
      for (let r = 0; r < run; r++) {
        // each call applies one small training step
        network.trainBackpropagation(factory as any, 10, 10);
        total--;
        completed++;
        trainingIteration++;
      }

      // After each chunk, push update to the renderer
      publishModel();

      // Update RME display and chart
      try {
        const rms = network.rms(factory as any);
        updateRMEDisplay(rms, trainingIteration);
      } catch (e) {
        console.warn('Failed to update RME display', e);
      }

      // Log progress and RMS periodically
      try {
        const now = Date.now();
        if (now - lastLog >= LOG_EVERY_MS) {
          lastLog = now;
          let rmsVal: number | string = 'n/a';
          try { rmsVal = network.rms(factory as any).toFixed(6); } catch (e) { /* ignore */ }
          console.log('Training progress - remaining:', total, 'completed:', completed, 'RMS:', rmsVal);
          writeInfo(' remaining iterations: ' + total + (typeof rmsVal === 'string' ? '' : ' RMS=' + rmsVal));
        } else {
          // still update info label with remaining count at least
          writeInfo(' remaining iterations: ' + total);
        }
      } catch (e) {
        console.warn('Progress logging failed', e);
      }

      // Yield to the event loop to keep UI responsive
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // Final RMS and cleanup
    try {
      const rms = network.rms(factory as any);
      writeInfo('Training done. RMS=' + rms.toFixed(6));
      console.log('trainAsync done. final RMS=', rms);
    } catch (e) {
      console.warn('Failed to compute final RMS after training', e);
    }

    if (trainBtn) trainBtn.disabled = false;
  }

  writeInfo('Click Train button to start training.');
}

// Expose initApp globally so an external bootstrap (or manual call) can trigger it reliably
;(window as any)["initApp"] = initApp;
console.log('initApp exported on window');

// If the document is already loaded by the time this module runs, call initApp() immediately
if (typeof document !== 'undefined' && document.readyState === 'complete') {
  try {
    initApp();
  } catch (e) {
    console.error('Error auto-initializing TS app after readyState complete', e);
  }
}

// Auto-init when loaded in browser
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    try {
      initApp();
    } catch (e) {
      console.error('Error initializing TS app', e);
    }
  });
}
