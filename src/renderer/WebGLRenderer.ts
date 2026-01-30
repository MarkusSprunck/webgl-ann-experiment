// Type definitions for THREE.js objects
type Vector3 = any;
type Scene = any;
type Camera = any;
type Renderer = any;
type Mesh = any;
type Geometry = any;
type Material = any;

interface ModelLayer {
  nodes: Array<{
    y: number;
    y_ex: number;
  }>;
}

interface Model {
  layers: ModelLayer[];
}

/**
 * WebGL Renderer for Artificial Neural Network Visualization
 */
export class WebGLRenderer {
  // Constants for drawing the network
  private readonly CUBE_SIZE = 40;
  private readonly DISTANCE_CUBE = this.CUBE_SIZE * 1.2;
  private readonly DISTANCE_LAYER = this.CUBE_SIZE * 4;
  private readonly TEXT_LENGTH = 190;
  private readonly TEXT_HEIGHT = 34;

  // Artificial neural network model
  private model: Model | null = null;

  // Make initialization just once
  private initReady = false;

  // Helps to draw the graphic
  private maxCols = 0;
  private maxRows = 0;
  private sizeres = 0;
  private halfsizeres = 0;
  private deltaX = -50;
  private deltaY = 110;
  private deltaZ = 320;

  // WebGL
  private grid: Mesh[] = [];
  private scene: Scene | null = null;
  private camera: Camera | null = null;
  private renderer: Renderer | null = null;
  private geometry: Geometry | null = null;

  /**
   * Draws the model and does the initialization if needed
   */
  public renderData(modelText: string): void {
    this.model = this.createObjects(modelText);
    if (this.initReady) {
      this.update();
    } else {
      this.calculateModelDimensions();
      this.init();
    }
  }

  /**
   * Update the graphic with new values from model
   */
  private update(): void {
    if (!this.model || !this.renderer || !this.scene || !this.camera) {
      return;
    }

    // Change size and color of all neurons
    for (let layerId = 0; layerId < this.model.layers.length; layerId++) {
      const numberOfNodes = this.model.layers[layerId].nodes.length;
      for (let nodeId = 0; nodeId < numberOfNodes; nodeId++) {
        const elementId = nodeId + layerId * this.maxRows;
        const cubeHeight = this.model.layers[layerId].nodes[nodeId].y * 2;
        this.grid[elementId].scale.y = 0.01 + cubeHeight;
        const color = this.getColorHex(0.01 + cubeHeight);
        this.grid[elementId].material.color.setHex(color);
      }
    }

    // Change size and color of expected output values
    const layerId = this.model.layers.length - 1;
    const numberOfNodes = this.model.layers[layerId].nodes.length;
    for (let nodeId = 0; nodeId < numberOfNodes; nodeId++) {
      const elementId = nodeId + (layerId + 1) * this.maxRows;
      const cubeHeight = this.model.layers[layerId].nodes[nodeId].y_ex * 2;
      this.grid[elementId].scale.y = 0.01 + cubeHeight;
      const color = this.getColorHex(0.01 + cubeHeight);
      this.grid[elementId].material.color.setHex(color);
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Initialization of the WebGL stuff
   */
  private init(): void {
    const THREE = window.THREE;
    if (!THREE) {
      console.error('THREE.js not loaded');
      return;
    }

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.camera.position.x = this.halfsizeres + this.deltaX;
    this.camera.position.y = this.halfsizeres + this.deltaY;
    this.camera.position.z = this.sizeres * 0.85 + this.deltaZ;
    this.camera.lookAt(
      new THREE.Vector3(
        this.halfsizeres + this.deltaX,
        this.halfsizeres / 2 + this.deltaY,
        this.halfsizeres + this.deltaZ
      )
    );

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);

    // Create renderer
    if (window.Detector.webgl) {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
    } else {
      this.renderer = new THREE.CanvasRenderer();
      const infoLabel = document.getElementById('infoLabelContainer3');
      if (infoLabel) {
        infoLabel.innerHTML = 'WebGL is not available (canvas renderer active)';
      }
    }

    // Create light
    const light = new THREE.SpotLight(0xffffff, 1.25);
    light.position.set(-500, 900, 1600);
    light.target.position.set(this.halfsizeres, 0, this.halfsizeres);
    light.castShadow = true;
    this.scene.add(light);

    this.scene.add(new THREE.AmbientLight(0xf0f0f0));

    // Create cubes (for each neuron)
    this.geometry = new THREE.CubeGeometry(
      this.CUBE_SIZE,
      this.CUBE_SIZE,
      this.CUBE_SIZE
    );
    const matrix = new THREE.Matrix4();
    matrix.makeTranslation(0, this.CUBE_SIZE / 2, 0);
    this.geometry.applyMatrix(matrix);

    for (let layerId = 0; layerId <= this.maxCols; layerId++) {
      for (let nodeId = 0; nodeId < this.maxRows; nodeId++) {
        const material = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          ambient: 0x3f3f3f,
          reflectivity: 0.75,
        });
        const cube = new THREE.Mesh(this.geometry, material);
        cube.position.x = this.CUBE_SIZE + nodeId * this.DISTANCE_CUBE;
        cube.position.z = this.CUBE_SIZE + layerId * this.DISTANCE_LAYER;
        cube.receiveShadow = false;
        cube.scale.y = 0.01;
        this.scene.add(cube);
        this.grid.push(cube);
      }
    }

    // Create labeling (for each layer)
    let z = this.DISTANCE_CUBE;
    this.scene.add(this.createText('Input', -this.TEXT_LENGTH / 2, 0, z));
    z = this.DISTANCE_CUBE + (this.maxCols - 1) * this.DISTANCE_LAYER;
    this.scene.add(this.createText('Output', -this.TEXT_LENGTH / 2, 0, z));
    z = this.DISTANCE_CUBE + this.maxCols * this.DISTANCE_LAYER;
    this.scene.add(this.createText('Expected', -this.TEXT_LENGTH / 2, 0, z));
    for (let layerId = 1; layerId < this.maxCols - 1; layerId++) {
      z = this.DISTANCE_CUBE + layerId * this.DISTANCE_LAYER;
      this.scene.add(this.createText('Hidden', -this.TEXT_LENGTH / 2, 0, z));
    }

    const container = document.getElementById('drawingArea');
    if (!container) {
      console.error('drawingArea container not found');
      return;
    }

    container.appendChild(this.renderer.domElement);
    // ensure the canvas is block-level so it fills the container without inline gaps
    try {
      this.renderer.domElement.style.display = 'block';
    } catch (e) {
      /* ignore */
    }

    // Expose the canvas element and make it focusable so it receives keyboard events directly
    this.setupKeyboardHandlers(container);

    // Support window resize
    this.setupResizeHandler(container);

    // Do all this just once
    this.initReady = true;
  }

  /**
   * Setup keyboard event handlers
   */
  private setupKeyboardHandlers(container: HTMLElement): void {
    try {
      const canvasElt = this.renderer?.domElement;
      if (canvasElt) {
        canvasElt.tabIndex = canvasElt.tabIndex >= 0 ? canvasElt.tabIndex : 0;
        canvasElt.style.outline = 'none';
        try {
          canvasElt.focus();
        } catch (e) {
          /* ignore focus errors */
        }
        // also attempt to focus after a short delay to handle browsers that block immediate focus on load
        setTimeout(() => {
          try {
            canvasElt.focus();
          } catch (e) {
            /* ignore */
          }
        }, 200);
        // ensure clicking the container focuses the canvas (so keyboard events go to canvas)
        container.addEventListener(
          'click',
          () => {
            try {
              canvasElt.focus();
            } catch (e) {
              /* ignore */
            }
          },
          false
        );
        // Also attach keydown handler directly to the canvas
        canvasElt.addEventListener('keydown', this.doKeyDown.bind(this), false);
      }
    } catch (e) {
      console.warn('Could not make renderer canvas focusable', e);
    }

    // Also attach a keydown handler to the container as a fallback
    try {
      container.tabIndex = container.tabIndex >= 0 ? container.tabIndex : 0;
      container.style.outline = 'none';
      try {
        container.focus();
      } catch (e) {
        /* ignore focus errors */
      }
      // also try focusing the container after a short delay as an additional fallback
      setTimeout(() => {
        try {
          container.focus();
        } catch (e) {
          /* ignore */
        }
      }, 250);
      container.addEventListener('keydown', this.doKeyDown.bind(this), false);
      console.log('WebGL: attached keydown listener to drawingArea container');
    } catch (e) {
      console.warn('Could not make drawingArea focusable', e);
    }

    // Support move with keyboard on the window as well
    window.addEventListener('keydown', this.doKeyDown.bind(this), true);
    console.log('WebGL: attached keydown listener to window (capture)');
    // Also attach to document as an additional fallback
    try {
      document.addEventListener('keydown', this.doKeyDown.bind(this), true);
      console.log('WebGL: attached keydown listener to document (capture)');
    } catch (e) {
      /* ignore */
    }
  }

  /**
   * Setup resize handler
   */
  private setupResizeHandler(container: HTMLElement): void {
    const resizeCallback = () => {
      try {
        const rectWidth = container.clientWidth;
        const rectHeight = container.clientHeight;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.floor(rectWidth * devicePixelRatio));
        const height = Math.max(1, Math.floor(rectHeight * devicePixelRatio));
        this.renderer?.setSize(width, height);
        if (this.renderer?.domElement) {
          this.renderer.domElement.style.width = rectWidth + 'px';
          this.renderer.domElement.style.height = rectHeight + 'px';
        }
        // update camera aspect to match container aspect
        if (this.camera && rectHeight > 0) {
          this.camera.aspect = rectWidth / rectHeight;
          if (typeof this.camera.updateProjectionMatrix === 'function') {
            this.camera.updateProjectionMatrix();
          }
        }
      } catch (e) {
        console.warn('Resize callback failed', e);
      }
    };
    window.addEventListener('resize', resizeCallback, false);
    // also call resize once after a slight delay to ensure layout is settled
    setTimeout(resizeCallback, 50);
  }

  /**
   * Expose a safe forceRender hook so external callers can request an immediate repaint
   */
  public forceRender(): void {
    try {
      // If not initialized, attempt to init (this will also append the renderer DOM)
      if (!this.initReady) {
        this.init();
      } else {
        // If initialized, call update() to refresh sizes/colors and render
        this.update();
      }
    } catch (e) {
      console.warn('forceRender failed', e);
    }
  }

  /**
   * Determines the maximal number of layers and nodes
   */
  private calculateModelDimensions(): void {
    if (!this.model) {
      return;
    }

    this.maxCols = this.model.layers.length;
    this.maxRows = 0;
    for (let layerId = 0; layerId < this.model.layers.length; layerId++) {
      this.maxRows = Math.max(
        this.model.layers[layerId].nodes.length,
        this.maxRows
      );
    }
    this.sizeres = this.DISTANCE_CUBE * Math.max(this.maxRows, this.maxCols);
    this.halfsizeres = this.sizeres / 2;
  }

  /**
   * Helper for coloring the nodes (part 1)
   */
  private getColorHex(value: number): number {
    const frequency = 2.0;
    const red = Math.sin(2 - frequency * value) * 127 + 128;
    const green = Math.sin(1 - frequency * value) * 127 + 128;
    const blue = Math.sin(4 - frequency * value) * 127 + 128;
    return parseInt(
      '0x' + this.integerToHex(red) + this.integerToHex(green) + this.integerToHex(blue),
      16
    );
  }

  /**
   * Helper for coloring the nodes (part 2)
   */
  private integerToHex(n: number): string {
    const value = Math.max(0, Math.min(Math.floor(n), 255));
    const charFirst = '0123456789ABCDEF'.charAt((value - (value % 16)) / 16);
    const charSecond = '0123456789ABCDEF'.charAt(value % 16);
    return charFirst + charSecond;
  }

  /**
   * Move the graphic and camera with arrow keys
   */
  private doKeyDown(e: KeyboardEvent | string): void {
    console.log('WebGL: keydown event', e); // Debug log at the start of the handler
    // modernize key handling: prefer e.key, fall back to legacy properties
    const delta = 10;
    let key = '';

    if (typeof e === 'string') {
      key = e;
    } else if (e && typeof e === 'object') {
      // e.key is standard (e.g., 'ArrowRight', 'PageUp')
      key = e.key || (e as any).keyIdentifier || '';
      // fallback mapping from keyCode when necessary
      if (!key && typeof e.keyCode === 'number') {
        switch (e.keyCode) {
          case 37:
            key = 'ArrowLeft';
            break;
          case 38:
            key = 'ArrowUp';
            break;
          case 39:
            key = 'ArrowRight';
            break;
          case 40:
            key = 'ArrowDown';
            break;
          case 33:
            key = 'PageUp';
            break;
          case 34:
            key = 'PageDown';
            break;
          default:
            key = String.fromCharCode(e.keyCode);
        }
      }
    }

    // Normalize values like 'Left' (old WebKit) to 'ArrowLeft'
    if (key === 'Left') key = 'ArrowLeft';
    if (key === 'Right') key = 'ArrowRight';
    if (key === 'Up') key = 'ArrowUp';
    if (key === 'Down') key = 'ArrowDown';

    // For navigation keys, prevent default scrolling to keep the canvas focused
    const navKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
    ];
    if (
      navKeys.indexOf(key) !== -1 &&
      typeof e !== 'string' &&
      typeof (e as KeyboardEvent).preventDefault === 'function'
    ) {
      try {
        (e as KeyboardEvent).preventDefault();
      } catch (ignore) {
        /* ignore */
      }
    }

    if (key === 'ArrowRight') {
      this.deltaX -= delta;
      this.camera!.position.x = this.camera!.position.x - delta;
    } else if (key === 'ArrowLeft') {
      this.deltaX += delta;
      this.camera!.position.x = this.camera!.position.x + delta;
    } else if (key === 'ArrowDown') {
      this.deltaZ -= delta;
      this.camera!.position.z = this.camera!.position.z - delta;
    } else if (key === 'ArrowUp') {
      this.deltaZ += delta;
      this.camera!.position.z = this.camera!.position.z + delta;
    } else if (key === 'PageDown') {
      this.deltaY += delta;
      this.camera!.position.y = this.camera!.position.y + delta;
    } else if (key === 'PageUp') {
      this.deltaY -= delta;
      this.camera!.position.y = this.camera!.position.y - delta;
    }

    // Ensure camera consistently looks at the model center after position changes
    if (this.camera && typeof this.camera.lookAt === 'function') {
      const THREE = window.THREE;
      const target = new THREE.Vector3(
        this.halfsizeres + this.deltaX,
        this.halfsizeres / 2 + this.deltaY,
        this.halfsizeres + this.deltaZ
      );
      this.camera.lookAt(target);
      // debug log camera & target
      try {
        console.log(
          'WebGL: camera moved to',
          this.camera.position,
          'looking at',
          target
        );
      } catch (e) {
        /* ignore */
      }
      // ensure camera matrices are updated before rendering
      try {
        if (typeof this.camera.updateMatrixWorld === 'function') {
          this.camera.updateMatrixWorld(true);
        }
      } catch (e) {
        /* ignore */
      }
    }

    // Immediately render the scene so the camera movement is visible
    try {
      if (
        this.renderer &&
        typeof this.renderer.render === 'function' &&
        this.scene &&
        this.camera
      ) {
        this.renderer.render(this.scene, this.camera);
      }
    } catch (e) {
      console.warn('Render after keydown failed', e);
    }
  }

  /**
   * Helper for drawing the layer labeling
   */
  private createText(text: string, x: number, y: number, z: number): any {
    const THREE = window.THREE;
    const textHolder = document.createElement('canvas');
    const ctext = textHolder.getContext('2d');
    if (!ctext) {
      return null;
    }

    textHolder.width = this.TEXT_LENGTH;
    textHolder.height = this.TEXT_HEIGHT;
    ctext.fillStyle = 'white';
    ctext.font = '28px Arial';
    ctext.textAlign = 'right';
    ctext.fillText(text, this.TEXT_LENGTH - 2, this.TEXT_HEIGHT - 6);

    const tex = new THREE.Texture(textHolder);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      overdraw: true,
    });
    mat.transparent = true;
    mat.map.needsUpdate = true;
    mat.depthTest = true;

    const textBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(textHolder.width, textHolder.height),
      mat
    );
    textBoard.position.x = x;
    textBoard.position.y = y;
    textBoard.position.z = z;
    textBoard.rotation.x = -Math.PI / 4;
    textBoard.dynamic = true;
    textBoard.doubleSided = true;

    return textBoard;
  }

  /**
   * Create objects from model text (requires Jsonhelper.js to be loaded)
   */
  private createObjects(modelText: string): Model {
    // This function depends on the global createObjects function from Jsonhelper.js
    if (typeof (window as any).createObjects === 'function') {
      return (window as any).createObjects(modelText);
    }
    throw new Error('createObjects function not found (Jsonhelper.js not loaded)');
  }
}

// Create singleton instance
let rendererInstance: WebGLRenderer | null = null;

/**
 * Get or create the WebGL renderer singleton
 */
export function getRenderer(): WebGLRenderer {
  if (!rendererInstance) {
    rendererInstance = new WebGLRenderer();
  }
  return rendererInstance;
}

/**
 * Expose renderData function to window for backwards compatibility
 */
export function exposeRendererToWindow(): void {
  const renderer = getRenderer();
  window.renderData = (data: string) => renderer.renderData(data);
  window.forceRender = () => renderer.forceRender();
}
