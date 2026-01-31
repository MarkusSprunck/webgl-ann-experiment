/**
 * Centralized UI Manager
 * Handles all DOM interactions and UI state
 */

export interface ButtonHandlers {
  onTrain: () => void;
  onStop: () => void;
  onRecall: () => void;
  onReset: () => void;
  onAnalyze: () => void;
}

export class UIManager {
  private elements = {
    trainBtn: document.getElementById('ts-train-button') as HTMLButtonElement | null,
    stopBtn: document.getElementById('ts-stop-button') as HTMLButtonElement | null,
    recallBtn: document.getElementById('ts-recall-button') as HTMLButtonElement | null,
    resetBtn: document.getElementById('ts-reset-button') as HTMLButtonElement | null,
    analyzeBtn: document.getElementById('ts-analyze-button') as HTMLButtonElement | null,
    infoLabel: document.getElementById('infoLabelContainer1') as HTMLElement | null,
    rmeDisplay: document.getElementById('rmeDisplay') as HTMLElement | null
  };

  constructor() {
    this.cacheElements();
  }

  private cacheElements(): void {
    // Elements already cached in constructor
    console.log('UI Manager initialized');
  }

  /**
   * Set up all button click handlers
   */
  public setupHandlers(handlers: ButtonHandlers): void {
    if (this.elements.trainBtn) {
      this.elements.trainBtn.addEventListener('click', handlers.onTrain);
    }
    if (this.elements.stopBtn) {
      this.elements.stopBtn.addEventListener('click', handlers.onStop);
    }
    if (this.elements.recallBtn) {
      this.elements.recallBtn.addEventListener('click', handlers.onRecall);
    }
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', handlers.onReset);
    }
    if (this.elements.analyzeBtn) {
      this.elements.analyzeBtn.addEventListener('click', handlers.onAnalyze);
    }
  }

  /**
   * Update status message
   */
  public setStatus(message: string): void {
    if (this.elements.infoLabel) {
      this.elements.infoLabel.textContent = message;
    }
    console.log(message);
  }

  /**
   * Update RME display
   */
  public updateRMEDisplay(trainRms: number, testRms: number): void {
    if (this.elements.rmeDisplay) {
      this.elements.rmeDisplay.innerHTML =
        `<span style="color: #4CAF50;">Train: ${trainRms.toFixed(6)}</span> | ` +
        `<span style="color: #2196F3;">Test: ${testRms.toFixed(6)}</span>`;
    }
  }

  /**
   * Reset RME display
   */
  public resetRMEDisplay(): void {
    if (this.elements.rmeDisplay) {
      this.elements.rmeDisplay.textContent = 'RMS: --';
    }
  }

  /**
   * Set button states for training mode
   */
  public setTrainingMode(isTraining: boolean): void {
    if (this.elements.trainBtn) this.elements.trainBtn.disabled = isTraining;
    if (this.elements.stopBtn) this.elements.stopBtn.disabled = !isTraining;
  }

  /**
   * Set button states for recall mode
   */
  public setRecallMode(isRecalling: boolean): void {
    if (this.elements.recallBtn) this.elements.recallBtn.disabled = isRecalling;
    if (this.elements.stopBtn) this.elements.stopBtn.disabled = !isRecalling;
  }

  /**
   * Enable/disable all buttons
   */
  public setButtonsEnabled(enabled: boolean): void {
    if (this.elements.trainBtn) this.elements.trainBtn.disabled = !enabled;
    if (this.elements.resetBtn) this.elements.resetBtn.disabled = !enabled;
    if (this.elements.recallBtn) this.elements.recallBtn.disabled = !enabled;
    if (this.elements.analyzeBtn) this.elements.analyzeBtn.disabled = !enabled;
  }
}
