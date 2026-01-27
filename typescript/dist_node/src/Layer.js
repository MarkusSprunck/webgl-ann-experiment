"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layer = void 0;
class Layer {
    constructor() {
        this.neurons = [];
    }
    addNeuron(n) {
        this.neurons.push(n);
    }
    getNeurons() {
        return Object.freeze([...this.neurons]);
    }
    recallNeurons() {
        for (const n of this.neurons)
            n.recall();
    }
    resetLinks() {
        for (const neuron of this.neurons) {
            for (const link of neuron.getLinks()) {
                link.weight = 0.1 * (Math.random() - 0.5);
            }
        }
    }
    toString() {
        return `{"nodes":[${this.neurons.map(n => n.toString()).join(',')}]}`;
    }
}
exports.Layer = Layer;
