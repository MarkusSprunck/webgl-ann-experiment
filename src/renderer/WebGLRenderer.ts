/**
 * WebGL Renderer for Artificial Neural Network Visualization
 * Updated for THREE.js r182
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createObjects } from '../utils/JsonParser';
import { Detector } from '../utils/Detector';


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
 * Create a box geometry with rounded edges
 */
function createRoundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
  smoothness: number
): THREE.BufferGeometry {
  // Clamp radius
  const maxRadius = Math.min(width, height, depth) / 2;
  radius = Math.min(radius, maxRadius);

  // Create shape with rounded corners
  const shape = new THREE.Shape();
  const eps = 0.00001;
  const radius0 = radius - eps;

  // Half dimensions
  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;

  // Draw rounded rectangle
  shape.absarc(hw - radius, hh - radius, radius0, 0, Math.PI / 2, false);
  shape.absarc(-hw + radius, hh - radius, radius0, Math.PI / 2, Math.PI, false);
  shape.absarc(-hw + radius, -hh + radius, radius0, Math.PI, Math.PI * 1.5, false);
  shape.absarc(hw - radius, -hh + radius, radius0, Math.PI * 1.5, Math.PI * 2, false);

  // Extrude settings
  const extrudeSettings = {
    depth: depth - radius * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius,
    curveSegments: smoothness
  };

  // Create geometry and center it
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  return geometry;
}

/**
 * WebGL Renderer for Artificial Neural Network Visualization
 */
export class WebGLRenderer {
  // Constants for drawing the network
  private readonly CUBE_SIZE = 40
  private readonly DISTANCE_CUBE = this.CUBE_SIZE * 1.2;
  private readonly DISTANCE_LAYER = this.CUBE_SIZE * 4;
  private readonly TEXT_LENGTH = 120;
  private readonly TEXT_HEIGHT = 24;

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
  private grid: THREE.Mesh[] = [];
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private geometry: THREE.SphereGeometry | null = null;
  private controls: OrbitControls | null = null;
  private animationFrameId: number | null = null;

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

    // Note: Controls update and rendering handled by animation loop
    // This method just updates the neuron colors and sizes

    // Change size and color of all neurons
    for (let layerId = 0; layerId < this.model.layers.length; layerId++) {
      const numberOfNodes = this.model.layers[layerId].nodes.length;
      for (let nodeId = 0; nodeId < numberOfNodes; nodeId++) {
        const elementId = nodeId + layerId * this.maxRows;
        const cubeHeight = this.model.layers[layerId].nodes[nodeId].y * 2;
        this.grid[elementId].scale.y = 0.01 + cubeHeight;
        const color = this.getColorHex(0.01 + cubeHeight);
        const material = this.grid[elementId].material as THREE.MeshStandardMaterial;
        material.color.setHex(color);
        material.emissive.setHex(color);
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
      const material = this.grid[elementId].material as THREE.MeshStandardMaterial;
      material.color.setHex(color);
      material.emissive.setHex(color);
    }

    // Animation loop handles rendering continuously
  }

  /**
   * Initialization of the WebGL stuff - Simplified
   */
  private init(): void {
    // Check WebGL support
    if (!Detector.webgl) {
      console.error('WebGL is not supported');
      const infoLabel = document.getElementById('infoLabelContainer3');
      if (infoLabel) {
        infoLabel.innerHTML = 'WebGL is not available. Please use a modern browser.';
      }
      return;
    }

    // Calculate the center of the network for proper camera targeting
    const networkCenterX = this.CUBE_SIZE + (this.maxRows - 1) * this.DISTANCE_CUBE / 2;
    const networkCenterY = 0; // Base level
    const networkCenterZ = this.CUBE_SIZE + this.maxCols * this.DISTANCE_LAYER / 2;

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );

    // Position camera looking at network center
    const cameraDistance = this.sizeres * 0.85;
    this.camera.position.set(
      networkCenterX,
      networkCenterY + 150, // Slightly elevated
      networkCenterZ + cameraDistance
    );
    this.camera.lookAt(networkCenterX, networkCenterY + 50, networkCenterZ);

    // Create scene with dark background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a); // Dark gray background

    // Create WebGL renderer with standard settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Add multiple lights for metallic highlights - from front and top
    // Base ambient light
    const ambientLight = new THREE.AmbientLight(0x303030, 0.5);
    this.scene.add(ambientLight);

    // Main key light (brightest, from front-top)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(0, 1000, 1200); // Front and top
    this.scene.add(keyLight);

    // Secondary front light (blue-ish, from front-left-top)
    const frontLight = new THREE.DirectionalLight(0xa0b8d0, 1.0);
    frontLight.position.set(-400, 800, 1000); // Front-left-top
    this.scene.add(frontLight);

    // Right front light (slight right, from front-top)
    const rightLight = new THREE.DirectionalLight(0xb0c0d0, 0.8);
    rightLight.position.set(500, 900, 1100); // Front-right-top
    this.scene.add(rightLight);

    // Top center light (directly above, pointing down)
    const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topLight.position.set(0, 1500, 200); // Directly above, slightly forward
    this.scene.add(topLight);

    // Subtle fill light from below-front (prevents pure black shadows)
    const fillLight = new THREE.DirectionalLight(0x6080a0, 0.4);
    fillLight.position.set(0, -200, 800); // Below but still from front
    this.scene.add(fillLight);

    // Create box geometry with rounded edges for neurons
    this.geometry = createRoundedBoxGeometry(
        this.CUBE_SIZE * 0.8,
        this.CUBE_SIZE,
        this.CUBE_SIZE,
        this.CUBE_SIZE / 10, // radius = 10% of cube size for subtle rounding
        3 // smoothness/segments for rounded edges
    );
    const matrix = new THREE.Matrix4();
    matrix.makeTranslation(0, this.CUBE_SIZE / 2, 0);
    this.geometry.applyMatrix4(matrix);


    // Create metallic spheres for each neuron
    for (let layerId = 0; layerId <= this.maxCols; layerId++) {
      for (let nodeId = 0; nodeId < this.maxRows; nodeId++) {
        const material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.85,      // High metalness for metallic look
          roughness: 0.20,      // Low roughness for shiny highlights
          envMapIntensity: 1.5, // Enhanced reflections
        });
        const cube = new THREE.Mesh(this.geometry, material);
        cube.position.x = this.CUBE_SIZE + nodeId * this.DISTANCE_CUBE;
        cube.position.z = this.CUBE_SIZE + layerId * this.DISTANCE_LAYER;
        cube.scale.y = 0.01;
        this.scene.add(cube);
        this.grid.push(cube);
      }
    }

    // Create text labels for layers
    let z = this.DISTANCE_CUBE;
    const inputLabel = this.createText('Input', -this.TEXT_LENGTH / 2, 0, z);
    if (inputLabel) this.scene.add(inputLabel);

    z = this.DISTANCE_CUBE + (this.maxCols - 1) * this.DISTANCE_LAYER;
    const outputLabel = this.createText('Output', -this.TEXT_LENGTH / 2, 0, z);
    if (outputLabel) this.scene.add(outputLabel);

    z = this.DISTANCE_CUBE + this.maxCols * this.DISTANCE_LAYER;
    const expectedLabel = this.createText('Expected', -this.TEXT_LENGTH / 2, 0, z);
    if (expectedLabel) this.scene.add(expectedLabel);

    for (let layerId = 1; layerId < this.maxCols - 1; layerId++) {
      z = this.DISTANCE_CUBE + layerId * this.DISTANCE_LAYER;
      const hiddenLabel = this.createText('Hidden', -this.TEXT_LENGTH / 2, 0, z);
      if (hiddenLabel) this.scene.add(hiddenLabel);
    }

    // Attach renderer to DOM
    const container = document.getElementById('drawingArea');
    if (!container) {
      console.error('drawingArea container not found');
      return;
    }

    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';

    // Setup OrbitControls for mouse interaction (pass network center)
    this.setupOrbitControls(networkCenterX, networkCenterY + 50, networkCenterZ);

    // Setup resize handler
    this.setupResizeHandler(container);

    // Initialization complete
    this.initReady = true;
    console.log('WebGL Renderer initialized with mouse controls (rotate, pan, zoom)');

    // Render initial scene immediately
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Setup OrbitControls for mouse-based camera control
   */
  private setupOrbitControls(centerX: number, centerY: number, centerZ: number): void {
    if (!this.camera || !this.renderer) return;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Configure controls
    this.controls.enableDamping = true;        // Smooth camera movement
    this.controls.dampingFactor = 0.05;        // Damping inertia
    this.controls.screenSpacePanning = false;  // Pan in camera's plane
    this.controls.minDistance = 100;           // Min zoom distance
    this.controls.maxDistance = 2000;          // Max zoom distance
    this.controls.maxPolarAngle = Math.PI;     // Allow full vertical rotation

    // Set target to calculated network center
    this.controls.target.set(centerX, centerY, centerZ);

    this.controls.update();

    console.log('OrbitControls enabled:');
    console.log('  - Left mouse: Rotate');
    console.log('  - Right mouse: Pan');
    console.log('  - Mouse wheel: Zoom');
    console.log(`  - Center: (${centerX.toFixed(1)}, ${centerY.toFixed(1)}, ${centerZ.toFixed(1)})`);

    // Start continuous animation loop for orbit controls
    this.startAnimationLoop();
  }

  /**
   * Start continuous animation loop for smooth orbit controls
   */
  private startAnimationLoop(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      // Update controls for smooth damping
      if (this.controls) {
        this.controls.update();
      }

      // Render the scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
    console.log('Animation loop started - scene renders continuously');
  }

  /**
   * Stop animation loop if needed
   */
  private stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Setup resize handler - Simplified
   */
  private setupResizeHandler(container: HTMLElement): void {
    const resizeCallback = () => {
      if (!this.renderer || !this.camera) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', resizeCallback);
    // Initial resize
    resizeCallback();
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
   * Helper for drawing the layer labeling
   */
  private createText(text: string, x: number, y: number, z: number): THREE.Mesh | null {
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
    tex.needsUpdate = true;

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthTest: true,
    });

    const textBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(textHolder.width, textHolder.height),
      mat
    );
    textBoard.position.x = x;
    textBoard.position.y = y;
    textBoard.position.z = z;
    textBoard.rotation.x = -Math.PI / 4;

    return textBoard;
  }

  /**
   * Parse model text into Model object
   */
  private createObjects(modelText: string): Model {
    try {
      return createObjects(modelText);
    } catch (e) {
      console.error('Failed to parse model JSON:', e);
      throw new Error('Invalid model JSON: ' + (e as Error).message);
    }
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
