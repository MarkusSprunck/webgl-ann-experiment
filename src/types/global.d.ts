/**
 * Global type definitions for WebGL ANN TypeScript project
 */

/**
 * Window object extensions for THREE.js and custom app functions
 */
declare global {
  interface Window {
    THREE: any;
    initApp: () => void;
    renderData: (data: string) => void;
    forceRender?: () => void;
    Detector: {
      webgl: boolean;
      addGetWebGLMessage?: () => void;
      getWebGLErrorMessage?: () => HTMLElement;
    };
    __tsInitDone?: boolean;
    __recallIntervalId?: number;
  }
}

/**
 * ANN Network types
 */
export interface NetworkConfig {
  inputNeurons: number;
  hiddenNeurons: number;
  outputNeurons: number;
  learningRate?: number;
}

export interface TrainingConfig {
  totalIterations: number;
  steps: number;
  chunk: number;
}

export interface TrainingResult {
  rms: number;
  iterations: number;
  duration: number;
}

/**
 * Neuron types
 */
export enum NeuronType {
  INPUT = 'INPUT',
  HIDDEN = 'HIDDEN',
  OUTPUT = 'OUTPUT'
}

/**
 * Pattern data types
 */
export interface PatternData {
  input: number[];
  expectedOutput: number[];
}

/**
 * WebGL renderer types
 */
export interface RendererOptions {
  antialias?: boolean;
  alpha?: boolean;
  preserveDrawingBuffer?: boolean;
}

/**
 * Application configuration
 */
export interface AppConfig {
  recallIntervalMs: number;
  trainingIterations: number;
  learningRate: number;
}

export {};
