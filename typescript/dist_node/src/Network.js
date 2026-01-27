"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
class Network {
    constructor() {
        this.layers = [];
    }
    addLayer(layer) {
        this.layers.push(layer);
    }
    getLayers() {
        return this.layers;
    }
    recallNetwork() {
        for (const l of this.layers)
            l.recallNeurons();
    }
    meshAllNeurons() {
        let connections = 0;
        for (let index = 1; index < this.layers.length; index++) {
            const firstLayer = this.layers[index - 1];
            const secondLayer = this.layers[index];
            for (const target of secondLayer.getNeurons()) {
                for (const source of firstLayer.getNeurons()) {
                    // create link with deterministic weight seed
                    target.createLink(source, -1 + 0.1 * connections++);
                }
            }
        }
    }
    trainBackpropagation(pattern, itterations, steps) {
        const maxLayerIndex = this.layers.length - 1;
        for (let step = 0; step < steps; step++) {
            for (let i = 0; i < itterations; i++) {
                pattern.activatePatternRandom();
                this.recallNetwork();
                for (const neuron of this.layers[maxLayerIndex].getNeurons()) {
                    neuron.calculateEvaluateOutputError();
                }
                for (let k = maxLayerIndex; k > 0; k--) {
                    for (const neuron of this.layers[k].getNeurons()) {
                        neuron.calculateEvaluateOutputErrorHiddenNeurons(Network.FLAT_SPOT);
                    }
                }
                for (let k = maxLayerIndex; k > 0; k--) {
                    for (const neuron of this.layers[k].getNeurons()) {
                        for (const link of neuron.getLinks()) {
                            const weightDecayTerm = Math.pow(10, -Network.WEIGHT_DECAY) * link.weight;
                            const momentumTerm = Network.ALPHA * link.deltaWeigthOld;
                            link.deltaWeigth = link.deltaWeigth - Network.GAMMA * link.source.output * neuron.getOutputDerived() * neuron.getOutputError() + momentumTerm - weightDecayTerm;
                        }
                    }
                }
                for (let k = maxLayerIndex; k > 0; k--) {
                    for (const neuron of this.layers[k].getNeurons()) {
                        for (const link of neuron.getLinks()) {
                            link.weight = link.weight + link.deltaWeigth;
                            link.deltaWeigthOld = link.deltaWeigth;
                            link.deltaWeigth = 0.0;
                        }
                    }
                }
                for (let k = maxLayerIndex; k > 0; k--) {
                    for (const neuron of this.layers[k].getNeurons()) {
                        neuron.setOutputError(0.0);
                    }
                }
            }
        }
    }
    resetLinks() {
        for (const layer of this.layers)
            layer.resetLinks();
    }
    rms(patterns) {
        let result = 0.0;
        const patternNumber = patterns.getNumberOfPattern();
        for (let i = 0; i < patternNumber; i++) {
            patterns.activatePattern(i);
            this.recallNetwork();
            for (const neuron of this.layers[this.layers.length - 1].getNeurons()) {
                neuron.calculateEvaluateOutputError();
                result += Math.pow(neuron.getOutputError(), 2.0);
            }
        }
        return result / patternNumber;
    }
    toString() {
        return `{"layers":[${this.layers.map(l => l.toString()).join(',')}]}`;
    }
}
exports.Network = Network;
Network.GAMMA = 2.0;
Network.ALPHA = 0.1;
Network.WEIGHT_DECAY = 4.0;
Network.FLAT_SPOT = 0.001;
