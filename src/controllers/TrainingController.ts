/**
 * Training Controller
 * Manages the training loop and lifecycle
 */

import { Network } from '../core/Network';
import { Pattern } from '../core/Pattern';
import { UIManager } from '../ui/UIManager';
import { RMEChart } from '../ui/RMEChart';

export class TrainingController {
  private network: Network;
  private pattern: Pattern & { trainIndices?: number[]; testIndices?: number[] };
  private ui: UIManager;
  private chart: RMEChart;

  private isTraining = false;
  private shouldStop = false;
  private iteration = 0;

  constructor(
    network: Network,
    pattern: Pattern & { trainIndices?: number[]; testIndices?: number[] },
    ui: UIManager,
    chart: RMEChart
  ) {
    this.network = network;
    this.pattern = pattern;
    this.ui = ui;
    this.chart = chart;
  }

  /**
   * Start continuous training
   */
  public async start(): Promise<void> {
    if (this.isTraining) {
      console.log('Training already running');
      return;
    }

    this.isTraining = true;
    this.shouldStop = false;
    this.ui.setTrainingMode(true);
    this.ui.setStatus('Training started (continuous)...');
    this.chart.show();

    const LOG_INTERVAL_MS = 200;
    let lastLog = Date.now();
    let completed = 0;

    try {
      while (!this.shouldStop) {
        // Train in chunks for UI responsiveness
        const chunkSize = 100;
        for (let i = 0; i < chunkSize && !this.shouldStop; i++) {
          this.trainOneStep();
          completed++;
          this.iteration++;
        }

        // Update visualization
        this.updateVisualization();

        // Calculate and display RMS
        const trainRms = this.calculateTrainRMS();
        const testRms = this.calculateTestRMS();
        this.ui.updateRMEDisplay(trainRms, testRms);
        this.chart.addDataPoint(this.iteration, trainRms, testRms);

        // Log progress periodically
        if (Date.now() - lastLog >= LOG_INTERVAL_MS) {
          lastLog = Date.now();
          this.ui.setStatus(`Iterations: ${completed}`);
        }

        // Yield to event loop
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Training complete
      this.logFinalStats(completed);
      this.ui.setStatus(`Training stopped. Iterations: ${completed}`);

    } finally {
      this.isTraining = false;
      this.shouldStop = false;
      this.ui.setTrainingMode(false);
    }
  }

  /**
   * Stop training
   */
  public stop(): void {
    if (this.isTraining) {
      this.shouldStop = true;
      this.ui.setStatus('Stopping training...');
    }
  }

  /**
   * Reset training state
   */
  public reset(): void {
    this.iteration = 0;
    this.chart.reset();
    this.ui.resetRMEDisplay();
  }

  /**
   * Get current iteration count
   */
  public getIteration(): number {
    return this.iteration;
  }

  /**
   * Train one step using backpropagation
   */
  private trainOneStep(): void {
    // Select random training pattern
    const trainSize = (this.pattern as any).getTrainSize?.() || 1;
    const randomIndex = Math.floor(Math.random() * trainSize);
    (this.pattern as any).activateTrainPattern?.(randomIndex);

    // Forward pass
    this.network.recallNetwork();

    const layers = this.network.getLayers();
    const maxLayerIndex = layers.length - 1;

    // Calculate output errors
    for (const neuron of layers[maxLayerIndex].getNeurons()) {
      (neuron as any).calculateEvaluateOutputError();
    }

    // Backpropagate errors
    for (let k = maxLayerIndex; k > 0; k--) {
      for (const neuron of layers[k].getNeurons()) {
        (neuron as any).calculateEvaluateOutputErrorHiddenNeurons(0.001);
      }
    }

    // Calculate weight updates
    for (let k = maxLayerIndex; k > 0; k--) {
      for (const neuron of layers[k].getNeurons()) {
        for (const link of (neuron as any).getLinks()) {
          const weightDecayTerm = Math.pow(10, -4.0) * link.weight;
          const momentumTerm = 0.1 * link.deltaWeigthOld;
          const gradient = 2.0 * link.source.output *
                          (neuron as any).getOutputDerived() *
                          (neuron as any).getOutputError();
          link.deltaWeigth = link.deltaWeigth - gradient + momentumTerm - weightDecayTerm;
        }
      }
    }

    // Apply weight updates
    for (let k = maxLayerIndex; k > 0; k--) {
      for (const neuron of layers[k].getNeurons()) {
        for (const link of (neuron as any).getLinks()) {
          link.weight += link.deltaWeigth;
          link.deltaWeigthOld = link.deltaWeigth;
          link.deltaWeigth = 0.0;
        }
      }
    }

    // Clear errors
    for (let k = maxLayerIndex; k > 0; k--) {
      for (const neuron of layers[k].getNeurons()) {
        (neuron as any).setOutputError(0.0);
      }
    }
  }

  /**
   * Calculate RMS for training set
   */
  private calculateTrainRMS(): number {
    try {
      return this.network.rmsForIndices(
        this.pattern as any,
        (this.pattern as any).trainIndices || []
      );
    } catch (e) {
      return 0;
    }
  }

  /**
   * Calculate RMS for test set
   */
  private calculateTestRMS(): number {
    try {
      return this.network.rmsForIndices(
        this.pattern as any,
        (this.pattern as any).testIndices || []
      );
    } catch (e) {
      return 0;
    }
  }

  /**
   * Update WebGL visualization
   */
  private updateVisualization(): void {
    try {
      if (typeof (window as any).renderData === 'function') {
        (window as any).renderData(this.network.toString());
        if (typeof (window as any).forceRender === 'function') {
          (window as any).forceRender();
        }
      }
    } catch (e) {
      console.warn('Visualization update failed', e);
    }
  }

  /**
   * Log final training statistics
   */
  private logFinalStats(iterations: number): void {
    try {
      const stats = this.network.analyzeWeightDistribution();
      console.log('=== Training Complete ===');
      console.log(`Iterations: ${iterations}`);
      console.log(`Weight Stats:`, stats);
      console.log(`  Min: ${stats.min.toFixed(6)}`);
      console.log(`  Max: ${stats.max.toFixed(6)}`);
      console.log(`  Mean: ${stats.mean.toFixed(6)}`);
      console.log(`  StdDev: ${stats.stdDev.toFixed(6)}`);
      console.log('========================');
    } catch (e) {
      console.warn('Failed to log final stats', e);
    }
  }
}
