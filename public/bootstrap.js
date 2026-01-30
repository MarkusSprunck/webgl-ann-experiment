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
    var timeout = 10000; // extended timeout to allow slower loads

    function ready() {
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

    var iv = setInterval(function() {
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
   * Dynamically load the TS module bundle only when THREE is ready
   */
  function loadModuleWhenThreeReady() {
    var waited = 0;
    var interval = 100;
    var timeout = 10000; // 10s

    function appendModule() {
      try {
        var s = document.createElement('script');
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

    var iv = setInterval(function() {
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
   */
  function initBootstrap() {
    console.log('Bootstrap: initializing...');

    // Start the main application initialization
    waitAndStart();

    // Start canvas diagnostics
    waitForCanvas();

    // Load the module bundle when THREE.js is ready
    loadModuleWhenThreeReady();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBootstrap);
  } else {
    // DOMContentLoaded already fired
    initBootstrap();
  }
})();
