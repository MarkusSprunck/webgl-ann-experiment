/**
 * Application Entry Point
 * Simplified and reorganized using controllers
 */

import { ModelFactory } from '../factories/ModelFactory';
import { exposeRendererToWindow } from '../renderer/WebGLRenderer';
import { UIManager } from '../ui/UIManager';
import { RMEChart } from '../ui/RMEChart';
import { TrainingController } from '../controllers/TrainingController';
import { RecallController } from '../controllers/RecallController';

// Import utilities to expose them globally when module loads
import '../utils/Detector';
import '../utils/JsonParser';

// Expose renderer to window immediately when module loads
exposeRendererToWindow();

export function initApp() {
  // Guard: ensure init runs only once
  if ((window as any).__tsInitDone) {
    console.log('initApp: already initialized — skipping');
    return;
  }
  (window as any).__tsInitDone = true;


  // Create neural network
  const factory = new ModelFactory();
  const network = factory.createBindTestPattern();
  factory.createTrainTestSplit();

  // Initialize UI components
  const ui = new UIManager();
  const chart = new RMEChart('rmeChart', 'rmeGraphContainer');

  // Initialize controllers
  const trainer = new TrainingController(network, factory, ui, chart);
  const recall = new RecallController(network, factory, ui);

  // Reset and visualize network
  network.resetLinks();
  network.recallNetwork();
  publishModel(network);

  ui.setStatus(`Network ready: ${network.getLayers().length} layers. Click Train to start.`);

  // Set up button handlers
  ui.setupHandlers({
    onTrain: () => {
      if (recall.isRunning()) {
        recall.stop();
      }
      trainer.start().catch(e => console.error('Training failed', e));
    },

    onStop: () => {
      trainer.stop();
      recall.stop();
    },

    onRecall: () => {
      if (!recall.isRunning()) {
        recall.start();
      }
    },

    onReset: () => {
      trainer.stop();
      recall.stop();
      network.resetLinks();
      network.recallNetwork();
      publishModel(network);
      trainer.reset();
      ui.setStatus('Network reset.');
    },

    onAnalyze: () => {
      const stats = network.analyzeWeightDistribution();
      console.log('=== Weight Distribution Analysis ===');
      console.log(`Total weights: ${stats.count}`);
      console.log(`Min: ${stats.min.toFixed(6)}`);
      console.log(`Max: ${stats.max.toFixed(6)}`);
      console.log(`Mean: ${stats.mean.toFixed(6)}`);
      console.log(`StdDev: ${stats.stdDev.toFixed(6)}`);
      console.log('===================================');
      ui.setStatus(`Weights: min=${stats.min.toFixed(3)}, max=${stats.max.toFixed(3)}, σ=${stats.stdDev.toFixed(3)}`);
    }
  });
}

/**
 * Helper: Publish model to WebGL renderer
 */
function publishModel(network: any): void {
  try {
    if (typeof (window as any).renderData === 'function') {
      (window as any).renderData(network.toString());
      if (typeof (window as any).forceRender === 'function') {
        (window as any).forceRender();
      }
    }
  } catch (e) {
    console.warn('Failed to publish model', e);
  }
}

// Expose initApp globally for bootstrap
(window as any)['initApp'] = initApp;
console.log('initApp exported on window');

