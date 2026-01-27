/*
 * Copyright (C) 2013, Markus Sprunck
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or
 * without modification, are permitted provided that the following
 * conditions are met:
 *
 * - Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above
 *   copyright notice, this list of conditions and the following
 *   disclaimer in the documentation and/or other materials provided
 *   with the distribution.
 *
 * - The name of its contributor may be used to endorse or promote
 *   products derived from this software without specific prior
 *   written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 * CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Constants for drawing the network
var CUBE_SIZE = 40;
var DISTANCE_CUBE = CUBE_SIZE * 1.2;
var DISTANCE_LAYER = CUBE_SIZE * 4;
var TEXT_LENGTH = 190;
var TEXT_HEIGHT = 34;

// Artificial neural network model
var model;

// Make initialization just once
var initReady = false;

// Helps to draw the graphic
var maxCols;
var maxRows;
var sizeres;
var halfsizeres;
var deltaX = -50;
var deltaY = 110;
var deltaZ = 320;

// WebGL
var grid = [];
var scene, camera, renderer, geometry, projector, ray;

// Draws the model and does the initialization if needed
//
function renderData(modelText) {
    model = createObjects(modelText);
    if (initReady) {
        update();
    } else {
        calulateModelDimensions()
        init();
    }
}

// Update the graphic with new values form model
//
function update() {
    // Change size and color of all neurons
    for (var layerId = 0; layerId < model.layers.length; layerId++) {
    	var numberOfNodes = model.layers[layerId].nodes.length;
        for (var nodeId = 0; nodeId < numberOfNodes; nodeId++) {
            var elementId = nodeId + layerId * maxRows;
            var cubeHeight = model.layers[layerId].nodes[nodeId].y * 2;
            grid[elementId].scale.y = 0.01 + cubeHeight;
            var color = getColorHex(0.01 + cubeHeight);
            grid[elementId].material.color.setHex( color );
        }
    }
    // Change size and color of expected output values
    var layerId = model.layers.length - 1;
 	var numberOfNodes = model.layers[layerId].nodes.length;
    for (var nodeId = 0; nodeId < numberOfNodes; nodeId++) {
        var elementId = nodeId + (layerId + 1) * maxRows;
        var cubeHeight = model.layers[layerId].nodes[nodeId].y_ex * 2;
        grid[elementId].scale.y = 0.01 + cubeHeight;
        var color = getColorHex(0.01 + cubeHeight);
        grid[elementId].material.color.setHex( color );
    }
    renderer.render(scene, camera);
}

// Initialization of the WebGL stuff
//
function init() {

    // Create camera
    camera = new THREE.PerspectiveCamera(50,
			window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.x = halfsizeres + deltaX;
    camera.position.y = halfsizeres + deltaY;
    camera.position.z = sizeres * 0.85 + deltaZ;
    camera.lookAt(new THREE.Vector3(halfsizeres + deltaX,
			halfsizeres / 2 + deltaY, halfsizeres + deltaZ));

    // Create scene
    scene = new THREE.Scene();
    scene.add(camera);

    // Create renderer
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
    } else {
        renderer = new THREE.CanvasRenderer();
        var infoLabel = document.getElementById('infoLabelContainer3');
        infoLabel.innerHTML = "WebGL is not available (canvas renderer active)";
    }

    // Create light
    var light = new THREE.SpotLight(0xffffff, 1.25);
    light.position.set(-500, 900, 1600);
    light.target.position.set(halfsizeres, 0, halfsizeres);
    light.castShadow = true;
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xF0F0F0));

    // Create cubes (for each neuron)
    geometry = new THREE.CubeGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    var matrix = new THREE.Matrix4();
    matrix.makeTranslation( 0,  CUBE_SIZE / 2, 0 );
    geometry.applyMatrix( matrix );
    for (var layerId = 0; layerId <= maxCols; layerId++) {
        for (var nodeId = 0; nodeId < maxRows; nodeId++) {
        	var material = new THREE.MeshLambertMaterial({ color: 0xffffff, ambient: 0x3f3f3f, reflectivity: 0.75 } );
        	cube = new THREE.Mesh(geometry, material);
            cube.position.x = CUBE_SIZE + (nodeId * DISTANCE_CUBE);
            cube.position.z = CUBE_SIZE + (layerId * DISTANCE_LAYER);
            cube.receiveShadow = false;
            cube.scale.y = 0.01;
            scene.add(cube);
            grid.push(cube);
        }
    }

    // Create labeling (for each layer)
    var z = DISTANCE_CUBE;
    scene.add(createText("Input", -TEXT_LENGTH / 2, 0, z));
    z = DISTANCE_CUBE + (maxCols - 1) * DISTANCE_LAYER;
    scene.add(createText("Output", -TEXT_LENGTH / 2, 0, z));
    z = DISTANCE_CUBE + maxCols * DISTANCE_LAYER;
    scene.add(createText("Expected", -TEXT_LENGTH / 2, 0,z ));
    for (var layerId = 1; layerId < maxCols - 1; layerId++) {
    	z = DISTANCE_CUBE + layerId * DISTANCE_LAYER;
        scene.add(createText("Hidden", -TEXT_LENGTH / 2, 0, z));
    }

    var container = document.getElementById('drawingArea');
    container.appendChild(renderer.domElement);
    // ensure the canvas is block-level so it fills the container without inline gaps
    try { renderer.domElement.style.display = 'block'; } catch (e) { /* ignore */ }

    // Expose the canvas element and make it focusable so it receives keyboard events directly
    try {
        var canvasElt = renderer.domElement;
        if (canvasElt) {
            canvasElt.tabIndex = canvasElt.tabIndex >= 0 ? canvasElt.tabIndex : 0;
            canvasElt.style.outline = 'none';
            try { canvasElt.focus(); } catch (e) { /* ignore focus errors */ }
            // also attempt to focus after a short delay to handle browsers that block immediate focus on load
            setTimeout(function() { try { canvasElt.focus(); } catch(e) {} }, 200);
            // ensure clicking the container focuses the canvas (so keyboard events go to canvas)
            container.addEventListener('click', function() { try { canvasElt.focus(); } catch(e){} }, false);
            // Also attach keydown handler directly to the canvas
            canvasElt.addEventListener('keydown', doKeyDown, false);
        }
    } catch (e) {
        console.warn('Could not make renderer canvas focusable', e);
    }

    // Also attach a keydown handler to the container as a fallback
    try {
        container.tabIndex = container.tabIndex >= 0 ? container.tabIndex : 0;
        container.style.outline = 'none';
        try { container.focus(); } catch (e) { /* ignore focus errors */ }
        // also try focusing the container after a short delay as an additional fallback
        setTimeout(function() { try { container.focus(); } catch(e) {} }, 250);
        container.addEventListener('keydown', doKeyDown, false);
        console.log('WebGL: attached keydown listener to drawingArea container');
    } catch (e) {
        console.warn('Could not make drawingArea focusable', e);
    }

    // Support move with keyboard on the window as well
    window.addEventListener("keydown", doKeyDown, true);
    console.log('WebGL: attached keydown listener to window (capture)');
    // Also attach to document as an additional fallback
    try { document.addEventListener('keydown', doKeyDown, true); console.log('WebGL: attached keydown listener to document (capture)'); } catch(e) { /* ignore */ }

    // Support window resize
    var resizeCallback = function () {
        try {
            var container = document.getElementById('drawingArea');
            var rectWidth = container.clientWidth;
            var rectHeight = container.clientHeight;
            var devicePixelRatio = window.devicePixelRatio || 1;
            var width = Math.max(1, Math.floor(rectWidth * devicePixelRatio));
            var height = Math.max(1, Math.floor(rectHeight * devicePixelRatio));
            renderer.setSize(width, height);
            renderer.domElement.style.width = rectWidth + 'px';
            renderer.domElement.style.height = rectHeight + 'px';
            // update camera aspect to match container aspect
            if (camera && rectHeight > 0) {
                camera.aspect = rectWidth / rectHeight;
                if (typeof camera.updateProjectionMatrix === 'function') camera.updateProjectionMatrix();
            }
        } catch (e) {
            console.warn('Resize callback failed', e);
        }
    }
    window.addEventListener('resize', resizeCallback, false);
    // also call resize once after a slight delay to ensure layout is settled
    setTimeout(resizeCallback, 50);

    // Do all this just once
    initReady = true;
}

// Expose a safe forceRender hook so external callers can request an immediate repaint
if (typeof window !== 'undefined') {
    window.forceRender = function() {
        try {
            // If not initialized, attempt to init (this will also append the renderer DOM)
            if (typeof initReady === 'undefined' || !initReady) {
                if (typeof init === 'function') init();
            } else {
                // If initialized, call update() to refresh sizes/colors and render
                if (typeof update === 'function') update();
            }
        } catch (e) {
            console.warn('forceRender failed', e);
        }
    };
}

// Determines the maximal number of layers and nodes
//
function calulateModelDimensions() {
    maxCols = model.layers.length;
    maxRows = 0;
    for (var layerId = 0; layerId < model.layers.length; layerId++) {
        maxRows = Math.max(model.layers[layerId].nodes.length, maxRows);
    }
    sizeres = DISTANCE_CUBE * (Math.max(maxRows, maxCols));
    halfsizeres = sizeres / 2;
}

// Helper for coloring the nodes (part 1)
//
function getColorHex(value) {
    frequency = 2.0;
    red = Math.sin(2 - frequency * value) * 127 + 128;
    green = Math.sin(1 - frequency * value) * 127 + 128;
    blue = Math.sin(4 - frequency * value) * 127 + 128;
    return '0x' + integerToHex(red) + integerToHex(green) + integerToHex(blue);
}

// Helper for coloring the nodes (part 2)
//
function integerToHex(n) {
    n = Math.max(0, Math.min(parseInt(n, 10), 255));
    charFirst = "0123456789ABCDEF".charAt((n - n % 16) / 16);
    charSecond = "0123456789ABCDEF".charAt(n % 16);
    return charFirst + charSecond;
}

// Move the graphic and camera with arrow keys
//
function doKeyDown(e) {
    console.log('WebGL: keydown event', e); // Debug log at the start of the handler
    // modernize key handling: prefer e.key, fall back to legacy properties
    var delta = 10;
    var key = '';
    if (e && typeof e === 'object') {
        // e.key is standard (e.g., 'ArrowRight', 'PageUp')
        key = e.key || e.keyIdentifier || '';
        // fallback mapping from keyCode when necessary
        if (!key && typeof e.keyCode === 'number') {
            switch (e.keyCode) {
                case 37: key = 'ArrowLeft'; break;
                case 38: key = 'ArrowUp'; break;
                case 39: key = 'ArrowRight'; break;
                case 40: key = 'ArrowDown'; break;
                case 33: key = 'PageUp'; break;
                case 34: key = 'PageDown'; break;
                default: key = String.fromCharCode(e.keyCode);
            }
        }
    } else {
        key = String(e);
    }

    // Normalize values like 'Left' (old WebKit) to 'ArrowLeft'
    if (key === 'Left') key = 'ArrowLeft';
    if (key === 'Right') key = 'ArrowRight';
    if (key === 'Up') key = 'ArrowUp';
    if (key === 'Down') key = 'ArrowDown';

    // For navigation keys, prevent default scrolling to keep the canvas focused
    var navKeys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown'];
    if (navKeys.indexOf(key) !== -1 && e && typeof e.preventDefault === 'function') {
        try { e.preventDefault(); } catch (ignore) {}
    }

    if (key === 'ArrowRight') {
        deltaX -= delta;
        camera.position.x = camera.position.x - delta;
    } else if (key === 'ArrowLeft') {
        deltaX += delta;
        camera.position.x = camera.position.x + delta;
    } else if (key === 'ArrowDown') {
        deltaZ -= delta;
        camera.position.z = camera.position.z - delta;
    } else if (key === 'ArrowUp') {
        deltaZ += delta;
        camera.position.z = camera.position.z + delta;
    } else if (key === 'PageDown') {
        deltaY += delta;
        camera.position.y = camera.position.y + delta;
    } else if (key === 'PageUp') {
        deltaY -= delta;
        camera.position.y = camera.position.y - delta;
    }

    // Ensure camera consistently looks at the model center after position changes
    if (typeof camera.lookAt === 'function') {
        var target = new THREE.Vector3(halfsizeres + deltaX,
                halfsizeres / 2 + deltaY, halfsizeres + deltaZ);
        camera.lookAt(target);
        // debug log camera & target
        try { console.log('WebGL: camera moved to', camera.position, 'looking at', target); } catch (e) { /* ignore */ }
        // ensure camera matrices are updated before rendering
        try { if (typeof camera.updateMatrixWorld === 'function') camera.updateMatrixWorld(true); } catch (e) { /* ignore */ }
    }

    // Immediately render the scene so the camera movement is visible
    try {
        if (typeof renderer !== 'undefined' && renderer && typeof renderer.render === 'function') {
            renderer.render(scene, camera);
        }
    } catch (e) {
        console.warn('Render after keydown failed', e);
    }
}

// Helper for drawing the layer labeling
//
function createText(text, x, y, z) {

    var textHolder = document.createElement('canvas');
    var ctext = textHolder.getContext('2d');
    textHolder.width = TEXT_LENGTH;
    textHolder.height = TEXT_HEIGHT;
    ctext.fillStyle = 'white';
    ctext.font = '28px Arial';
    ctext.textAlign = 'right';
    ctext.fillText(text, TEXT_LENGTH - 2, TEXT_HEIGHT - 6);

    var tex = new THREE.Texture(textHolder);
    var mat = new THREE.MeshBasicMaterial({
        map: tex,
        overdraw: true
    });
    mat.transparent = true;
    mat.map.needsUpdate = true;
    mat.depthTest = true;

    var textBoard = new THREE.Mesh(
			new THREE.PlaneGeometry(textHolder.width, textHolder.height),
			mat);
    textBoard.position.x = x;
    textBoard.position.y = y;
    textBoard.position.z = z;
    textBoard.rotation.x = -Math.PI / 4;
    textBoard.dynamic = true;
    textBoard.doubleSided = true;

    return textBoard;
}
