/**
 * Recall Controller
 * Manages the recall/visualization loop
 */

import { Network } from '../core/Network';
import { Pattern } from '../core/Pattern';
import { UIManager } from '../ui/UIManager';

export class RecallController {
  private network: Network;
  private pattern: Pattern;
  private ui: UIManager;

  private recallTimer: number | null = null;
  private recallIndex = 0;
  private readonly RECALL_INTERVAL_MS = 50;

  constructor(network: Network, pattern: Pattern, ui: UIManager) {
    this.network = network;
    this.pattern = pattern;
    this.ui = ui;
  }

  /**
   * Start recall loop
   */
  public start(): void {
    if (this.recallTimer !== null) {
      console.log('Recall already running');
      return;
    }

    this.recallIndex = 0;
    this.ui.setRecallMode(true);
    this.ui.setStatus(`Recall started (interval ${this.RECALL_INTERVAL_MS}ms)`);

    this.recallTimer = window.setInterval(() => {
      try {
        const patterns = (this.pattern as any).getNumberOfPattern?.() || 0;
        if (patterns <= 0) return;

        // Activate pattern in sequence
        (this.pattern as any).activatePattern(this.recallIndex % patterns);
        this.network.recallNetwork();

        // Update visualization
        this.updateVisualization();

        this.recallIndex++;
      } catch (e) {
        console.warn('Recall interval failed', e);
      }
    }, this.RECALL_INTERVAL_MS);
  }

  /**
   * Stop recall loop
   */
  public stop(): void {
    if (this.recallTimer !== null) {
      clearInterval(this.recallTimer);
      this.recallTimer = null;
      this.ui.setRecallMode(false);
      this.ui.setStatus('Recall stopped');
    }
  }

  /**
   * Check if recall is running
   */
  public isRunning(): boolean {
    return this.recallTimer !== null;
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
}
