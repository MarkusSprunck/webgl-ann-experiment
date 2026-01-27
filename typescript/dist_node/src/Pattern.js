"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pattern = void 0;
class Pattern {
    constructor() {
        this.numberOfPattern = 0;
        // Layer.getNeurons() returns a readonly array; keep readonly in Pattern
        this.inputNeurons = [];
        this.outputNeurons = [];
        this.value = new Map();
    }
    bind(network, table) {
        if (!network)
            throw new Error('network null');
        if (!table)
            throw new Error('table null');
        if (table.length === 0)
            throw new Error('empty table');
        const layers = network.getLayers();
        this.inputNeurons = layers[0].getNeurons();
        this.outputNeurons = layers[layers.length - 1].getNeurons();
        const inputNeuronNumber = this.inputNeurons.length;
        const outputNeuronNumber = this.outputNeurons.length;
        if (inputNeuronNumber + outputNeuronNumber !== table[0].length)
            throw new Error('dimension mismatch');
        this.numberOfPattern = table.length;
        this.value = new Map();
        for (let row = 0; row < this.numberOfPattern; row++) {
            const map = new Map();
            // inputs
            for (let col = 0; col < inputNeuronNumber; col++) {
                map.set(this.inputNeurons[col], table[row][col]);
            }
            for (let col = 0; col < outputNeuronNumber; col++) {
                map.set(this.outputNeurons[col], table[row][col + inputNeuronNumber]);
            }
            this.value.set(row, map);
        }
    }
    getPatterns() {
        return this.value;
    }
    activatePatternRandom() {
        const index = Math.floor(Math.random() * this.numberOfPattern);
        this.activatePattern(index);
    }
    activatePattern(index) {
        if (index < 0 || index >= this.numberOfPattern)
            throw new Error('index out of range');
        const map = this.value.get(index);
        for (const [neuron, val] of map.entries()) {
            if (this.inputNeurons.includes(neuron))
                neuron.setInput(val);
            else
                neuron.setOutputExpected(val);
        }
    }
    getNumberOfPattern() {
        return this.numberOfPattern;
    }
}
exports.Pattern = Pattern;
