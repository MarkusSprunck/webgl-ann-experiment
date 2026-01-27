"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApp = void 0;
const ModelFactory_1 = require("./ModelFactory");
// Minimal browser glue to demonstrate TS ANN running in the existing HTML page
function $(id) {
    return document.getElementById(id);
}
function writeInfo(msg) {
    const el = $('infoLabelContainer1');
    if (el)
        el.textContent = msg;
    console.log(msg);
}
function initApp() {
    // guard: ensure init runs only once (idempotent)
    if (window.__tsInitDone) {
        console.log('initApp: already initialized — skipping');
        return;
    }
    window.__tsInitDone = true;
    writeInfo('Initializing ANN (TypeScript)...');
    const factory = new ModelFactory_1.ModelFactory();
    const network = factory.createBindTestPattern();
    writeInfo('Created network with layers: ' + network.getLayers().length);
    // Reset network on load so visualization starts from a clean state
    try {
        network.resetLinks();
        network.recallNetwork();
        writeInfo('Network reset on load (TS).');
    }
    catch (e) {
        console.warn('Failed to reset network on load', e);
    }
    // If the legacy WebGL renderer is present, provide it with the network JSON
    if (typeof window.renderData === 'function') {
        try {
            window.renderData(network.toString()); // If renderer exposes a forceRender hook, call it to ensure immediate repaint
            if (typeof window.forceRender === 'function') {
                try {
                    window.forceRender();
                }
                catch (e) {
                    console.warn('forceRender failed', e);
                }
            }
            writeInfo('Sent model to WebGL renderer');
        }
        catch (e) {
            console.warn('Failed to call renderData', e);
        }
    }
    // Hook up simple UI buttons if present (use static controls in index.html)
    const trainBtn = document.getElementById('ts-train-button');
    const resetBtn = document.getElementById('ts-reset-button');
    if (trainBtn) {
        trainBtn.addEventListener('click', () => {
            console.log('Train button clicked');
            // Use fixed default iterations to simplify the UI
            const DEFAULT_ITERATIONS = 100;
            // Use steps=2 and small chunk to keep UI responsive
            trainAsync(DEFAULT_ITERATIONS, 10, 10).catch((e) => {
                console.error('Async training failed', e);
                if (trainBtn)
                    trainBtn.disabled = false;
            });
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            console.log('Reset button clicked');
            // perform reset and update visualization
            network.resetLinks();
            try {
                network.recallNetwork();
            }
            catch (e) {
                console.warn('Failed to recall network after reset', e);
            }
            writeInfo('Network links reset (TS).');
            if (typeof window.renderData === 'function') {
                try {
                    window.renderData(network.toString());
                    if (typeof window.forceRender === 'function') {
                        try {
                            window.forceRender();
                        }
                        catch (e) {
                            console.warn('forceRender failed', e);
                        }
                    }
                }
                catch (e) {
                    console.warn('Failed to call renderData after reset', e);
                }
            }
        });
    }
    // Async chunked trainer to avoid blocking the UI (standalone so UI wiring can call it)
    async function trainAsync(totalIterations, steps, chunk = 2) {
        if (trainBtn)
            trainBtn.disabled = true;
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
                network.trainBackpropagation(factory, 1, 1);
                total--;
                completed++;
            }
            // After each chunk, push update to the renderer
            if (typeof window.renderData === 'function') {
                try {
                    window.renderData(network.toString());
                }
                catch (e) {
                    console.warn('Failed to call renderData during async training', e);
                }
                try {
                    if (typeof window.forceRender === 'function')
                        window.forceRender();
                }
                catch (e) {
                    console.warn('forceRender failed', e);
                }
            }
            // Log progress and RMS periodically
            try {
                const now = Date.now();
                if (now - lastLog >= LOG_EVERY_MS) {
                    lastLog = now;
                    let rmsVal = 'n/a';
                    try {
                        rmsVal = network.rms(factory).toFixed(6);
                    }
                    catch (e) { /* ignore */ }
                    console.log('Training progress - remaining:', total, 'completed:', completed, 'RMS:', rmsVal);
                    writeInfo('Training... remaining iterations: ' + total + (typeof rmsVal === 'string' ? '' : ' RMS=' + rmsVal));
                }
                else {
                    // still update info label with remaining count at least
                    writeInfo('Training... remaining iterations: ' + total);
                }
            }
            catch (e) {
                console.warn('Progress logging failed', e);
            }
            // Yield to the event loop to keep UI responsive
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
        // Final RMS and cleanup
        try {
            const rms = network.rms(factory);
            writeInfo('Training done. RMS=' + rms.toFixed(6));
            console.log('trainAsync done. final RMS=', rms);
        }
        catch (e) {
            console.warn('Failed to compute final RMS after training', e);
        }
        if (trainBtn)
            trainBtn.disabled = false;
    }
    writeInfo('ANN (TypeScript) ready.');
}
exports.initApp = initApp;
// Expose initApp globally so an external bootstrap (or manual call) can trigger it reliably
;
window["initApp"] = initApp;
console.log('initApp exported on window');
// If the document is already loaded by the time this module runs, call initApp() immediately
if (typeof document !== 'undefined' && document.readyState === 'complete') {
    try {
        initApp();
    }
    catch (e) {
        console.error('Error auto-initializing TS app after readyState complete', e);
    }
}
// Auto-init when loaded in browser
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        try {
            initApp();
        }
        catch (e) {
            console.error('Error initializing TS app', e);
        }
    });
}
