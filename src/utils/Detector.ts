/**
 * Modern WebGL Detector - TypeScript
 * Replaces legacy Detector.js with modern detection
 */

export const Detector = {
  /**
   * Check if WebGL is supported
   */
  get webgl(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  },

  /**
   * Check if WebGL2 is supported
   */
  get webgl2(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  },

  /**
   * Check if Canvas 2D is supported
   */
  get canvas(): boolean {
    return !!window.CanvasRenderingContext2D;
  },

  /**
   * Check if Web Workers are supported
   */
  get workers(): boolean {
    return !!window.Worker;
  },

  /**
   * Check if File API is supported
   */
  get fileapi(): boolean {
    return !!(window.File && window.FileReader && window.FileList && window.Blob);
  }
};

// Expose globally for compatibility
if (typeof window !== 'undefined') {
  (window as any).Detector = Detector;
  console.log('Detector exposed to window.Detector');
}
