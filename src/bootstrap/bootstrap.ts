/**
 * Bootstrap module for WebGL ANN application
 * Contains all initialization and loading logic from index.html
 */

/**
 * Wait for dependencies and start the application
 */
export function waitAndStart(): void {
  let waited = 0;
  const interval = 100;
  const timeout = 10000; // extended timeout to allow slower loads

  function ready(): boolean {
    return (
      typeof window.initApp === 'function' &&
      typeof window.renderData === 'function' &&
      typeof window.THREE !== 'undefined'
    );
  }

  if (ready()) {
    try {
      window.initApp();
    } catch (e) {
      console.error('initApp threw', e);
    }
    return;
  }

  const iv = setInterval(() => {
    waited += interval;
    if (ready()) {
      clearInterval(iv);
      try {
        window.initApp();
      } catch (e) {
        console.error('initApp threw', e);
      }
      return;
    }
    if (waited > timeout) {
      clearInterval(iv);
      console.warn('Bootstrap: initApp/renderData/THREE not ready after timeout');
    }
  }, interval);
}

/**
 * Wait for renderer canvas and perform diagnostics
 */
export function waitForCanvas(): void {
  let waited = 0;
  const interval = 100;
  const timeout = 10000; // extended timeout

  function check(): void {
    const container = document.getElementById('drawingArea');
    const canvas = container && container.querySelector('canvas');
    if (canvas) {
      console.log('Diagnostic: found renderer canvas', canvas);
      try {
        console.log('Detector.webgl =', window.Detector && window.Detector.webgl);
        console.log(
          'drawingArea size:',
          container!.clientWidth,
          container!.clientHeight
        );
        // ensure canvas displays at container size
        canvas.style.width = container!.clientWidth + 'px';
        canvas.style.height = container!.clientHeight + 'px';
        try {
          window.dispatchEvent(new Event('resize'));
          console.log('Dispatched resize event to trigger renderer resize handler');
        } catch (e) {
          console.warn('Dispatch resize failed', e);
        }
      } catch (e) {
        console.warn('Diagnostic error', e);
      }
      return;
    }
    waited += interval;
    if (waited > timeout) {
      console.warn('Diagnostic: renderer canvas not found after timeout');
      return;
    }
    setTimeout(check, interval);
  }

  setTimeout(check, interval);
}

/**
 * Dynamically load the TS module bundle only when THREE is ready
 */
export function loadModuleWhenThreeReady(): void {
  let waited = 0;
  const interval = 100;
  const timeout = 10000; // 10s

  function appendModule(): void {
    try {
      const s = document.createElement('script');
      s.type = 'module';
      s.defer = true;
      s.src = 'bundle.js?v=' + Date.now();
      document.head.appendChild(s);
      console.log('Module bundle appended');
    } catch (e) {
      console.error('Failed to append module bundle', e);
    }
  }

  if (typeof window !== 'undefined' && window.THREE) {
    appendModule();
    return;
  }

  const iv = setInterval(() => {
    if (typeof window !== 'undefined' && window.THREE) {
      clearInterval(iv);
      appendModule();
      return;
    }
    waited += interval;
    if (waited > timeout) {
      clearInterval(iv);
      console.warn(
        'Module loader: THREE not found after timeout, appending module anyway'
      );
      appendModule();
    }
  }, interval);
}

/**
 * Initialize all bootstrap functions
 * This should be called when the DOM is ready
 */
export function initBootstrap(): void {
  // Start the main application initialization
  waitAndStart();

  // Start canvas diagnostics
  waitForCanvas();

  // Load the module bundle when THREE.js is ready
  loadModuleWhenThreeReady();
}

// Auto-initialize if this module is loaded in a browser context
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBootstrap);
  } else {
    // DOMContentLoaded already fired
    initBootstrap();
  }
}
