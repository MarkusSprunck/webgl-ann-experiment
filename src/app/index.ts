import {ModelFactory} from '../factories/ModelFactory';
import {Network} from '../core/Network';

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

  writeInfo('Initializing ANN (TypeScript)...');
  const factory = new ModelFactory();
  const network: Network = factory.createBindTestPattern();

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
        writeInfo('Sent model to WebGL renderer');
      } catch (e) {
        console.warn('Failed to call renderData', e);
      }
    }
  }
  publishModel();

  // Hook up simple UI buttons if present (use static controls in index.html)
  const trainBtn = document.getElementById('ts-train-button') as HTMLButtonElement | null;
  const resetBtn = document.getElementById('ts-reset-button') as HTMLButtonElement | null;
  const recallBtn = document.getElementById('ts-recall-button') as HTMLButtonElement | null;
  const stopBtn = document.getElementById('ts-stop-button') as HTMLButtonElement | null;
  const intervalInput = document.getElementById('ts-recall-interval') as HTMLInputElement | null;

  // state for recall loop
  let recallTimer: number | null = null;
  let recallIndex = 0;

  function setRecallRunning(running: boolean) {
    if (recallBtn) recallBtn.disabled = running;
    if (stopBtn) stopBtn.disabled = !running;
    if (intervalInput) intervalInput.disabled = running;
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
      // Use fixed default iterations to simplify the UI
      const DEFAULT_ITERATIONS = 10;
      // Use steps=2 and small chunk to keep UI responsive
      trainAsync(DEFAULT_ITERATIONS, 100, 100).catch((e) => {
        console.error('Async training failed', e);
        if (trainBtn) trainBtn.disabled = false;
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      console.log('Reset button clicked');
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
    });
  }

  if (recallBtn) {
    recallBtn.addEventListener('click', () => {
      console.log('Recall button clicked');
      if (recallTimer !== null) {
        console.log('Recall already running');
        return;
      }
      // read interval from input (milliseconds) and validate
      let intervalMs = 50;
      if (intervalInput) {
        const raw = String(intervalInput.value || '').trim();
        const parsed = raw.length > 0 ? Number(raw) : NaN;
        if (Number.isFinite(parsed) && parsed >= 10) intervalMs = Math.floor(parsed);
      }
      const intervalClamped = Math.max(10, Math.floor(intervalMs));

      // start cycling through patterns every intervalClamped ms
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
      }, intervalClamped) as unknown as number;

      setRecallRunning(true);
      // show active interval in a separate info label for clarity
      const intervalLabel = document.getElementById('infoLabelContainer2');
      if (intervalLabel) intervalLabel.textContent = 'Recall interval: ' + intervalClamped + ' ms';
      writeInfo('Recall started (interval ' + intervalClamped + 'ms)');
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      console.log('Stop button clicked');
      if (recallTimer !== null) {
        clearInterval(recallTimer);
        recallTimer = null;
        setRecallRunning(false);
        const intervalLabel = document.getElementById('infoLabelContainer2');
        if (intervalLabel) intervalLabel.textContent = '';
        writeInfo('Recall stopped');
      }
    });
  }

  // Async chunked trainer to avoid blocking the UI (standalone so UI wiring can call it)
  async function trainAsync(totalIterations: number, steps: number, chunk = 2) {
    if (trainBtn) trainBtn.disabled = true;
    writeInfo('Training (async)...');
    console.log('trainAsync start', { totalIterations, steps, chunk });

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
      }

      // After each chunk, push update to the renderer
      publishModel();

      // Log progress and RMS periodically
      try {
        const now = Date.now();
        if (now - lastLog >= LOG_EVERY_MS) {
          lastLog = now;
          let rmsVal: number | string = 'n/a';
          try { rmsVal = network.rms(factory as any).toFixed(6); } catch (e) { /* ignore */ }
          console.log('Training progress - remaining:', total, 'completed:', completed, 'RMS:', rmsVal);
          writeInfo('Training... remaining iterations: ' + total + (typeof rmsVal === 'string' ? '' : ' RMS=' + rmsVal));
        } else {
          // still update info label with remaining count at least
          writeInfo('Training... remaining iterations: ' + total);
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

  writeInfo('ANN (TypeScript) ready.');

  // Auto-start training shortly after load: stop any recall and begin training.
  (function autoStartTraining() {
    const AUTO_ITERATIONS = 10;
    // Delay a bit to allow the UI and renderer to settle
    setTimeout(() => {
      try {
        console.log('Auto-starting training on load');
        // stop recall if running
        if (recallTimer !== null) {
          clearInterval(recallTimer);
          recallTimer = null;
          setRecallRunning(false);
          writeInfo('Recall stopped due to auto-training');
        }
        // start async training with the same defaults as the Train button
        trainAsync(AUTO_ITERATIONS, 100, 100).catch((e) => {
          console.error('Auto training failed', e);
        });
      } catch (e) {
        console.warn('Auto-start training failed', e);
      }
    }, 200);
  })();
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
