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

    // Support move with keyboard
    window.addEventListener("keydown", doKeyDown, true);

    // Support window resize
    var resizeCallback = function () {
        var offsetHeight = document.getElementById('header').clientHeight + 90;
        var devicePixelRatio = window.devicePixelRatio || 1;
        var width = window.innerWidth * devicePixelRatio;
        var height = (window.innerHeight - offsetHeight)* devicePixelRatio;
        renderer.setSize(width, height);
        renderer.domElement.style.width = window.innerWidth + 'px';
        renderer.domElement.style.height = (window.innerHeight - offsetHeight) + 'px';
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resizeCallback, false);
    resizeCallback();

    // Do all this just once
    initReady = true;
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
    delta = 10;
    if (e.keyIdentifier == "Right") {
        deltaX -= delta;
        camera.position.x = camera.position.x - delta;
    } else if (e.keyIdentifier == "Left") {
        deltaX += delta;
        camera.position.x = camera.position.x + delta;
    } else if (e.keyIdentifier == "Down") {
        deltaZ -= delta;
        camera.position.z = camera.position.z - delta;
    } else if (e.keyIdentifier == "Up") {
        deltaZ += delta;
        camera.position.z = camera.position.z + delta;
    } else if (e.keyIdentifier == "PageDown") {
        deltaY += delta;
        camera.position.y = camera.position.y + delta;
    } else if (e.keyIdentifier == "PageUp") {
        deltaY -= delta;
        camera.position.y = camera.position.y - delta;
    }
    camera.lookAt(new THREE.Vector3(halfsizeres + deltaX, 
    		halfsizeres / 2 + deltaY, halfsizeres + deltaZ));
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