/**
 * Bootstrap script for WebGL ANN application
 * This file is compiled from TypeScript and should be loaded before the main bundle
 */

(function() {
  'use strict';

  /**
   * Wait for dependencies and start the application
   */
  function waitAndStart() {
    var waited = 0;
    var interval = 100;
    var timeout = 20000; // Increased to 20 seconds for module loading

    function ready() {
      var hasInitApp = typeof window.initApp === 'function';
      var hasRenderData = typeof window.renderData === 'function';

      if (!hasInitApp || !hasRenderData) {
        console.log('Waiting... initApp:', hasInitApp, 'renderData:', hasRenderData);
      }

      return hasInitApp && hasRenderData;
    }

    if (ready()) {
      console.log('Dependencies ready immediately, starting app...');
      try {
        window.initApp();
      } catch (e) {
        console.error('initApp threw', e);
      }
      return;
    }

    console.log('Waiting for dependencies to load...');
    var iv = setInterval(function() {
      waited += interval;
      if (ready()) {
        clearInterval(iv);
        console.log('Dependencies ready after', waited, 'ms, starting app...');
        try {
          window.initApp();
        } catch (e) {
          console.error('initApp threw', e);
        }
        return;
      }
      if (waited > timeout) {
        clearInterval(iv);
        console.error('Bootstrap: initApp/renderData not ready after', timeout, 'ms');
        console.error('window.initApp:', typeof window.initApp);
        console.error('window.renderData:', typeof window.renderData);
      }
    }, interval);
  }

  /**
   * Wait for renderer canvas and perform diagnostics
   */
  function waitForCanvas() {
    var waited = 0;
    var interval = 100;
    var timeout = 10000; // extended timeout

    function check() {
      var container = document.getElementById('drawingArea');
      var canvas = container && container.querySelector('canvas');
      if (canvas) {
        console.log('Diagnostic: found renderer canvas', canvas);
        try {
          console.log('Detector.webgl =', window.Detector && window.Detector.webgl);
          console.log(
            'drawingArea size:',
            container.clientWidth,
            container.clientHeight
          );
          // ensure canvas displays at container size
          canvas.style.width = container.clientWidth + 'px';
          canvas.style.height = container.clientHeight + 'px';
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
   * Initialize all bootstrap functions
   */
  function initBootstrap() {
    console.log('Bootstrap: initializing...');

    // Start the main application initialization
    waitAndStart();

    // Start canvas diagnostics
    waitForCanvas();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBootstrap);
  } else {
    // DOMContentLoaded already fired
    initBootstrap();
  }
})();
