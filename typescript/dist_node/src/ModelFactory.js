"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelFactory = void 0;
const Network_1 = require("./Network");
const Layer_1 = require("./Layer");
const Neuron_1 = require("./Neuron");
const Pattern_1 = require("./Pattern");
class ModelFactory extends Pattern_1.Pattern {
    // Inherits numberOfPattern, inputNeurons, outputNeurons and value from Pattern
    createBindTestPattern() {
        const network = new Network_1.Network();
        const inputChanels = 20;
        const hiddenNeurons = 15;
        const outputChanels = 10;
        const layer10 = new Layer_1.Layer();
        for (let i = 0; i < inputChanels; i++)
            layer10.addNeuron(new Neuron_1.Neuron(Neuron_1.NeuronType.INPUT));
        network.addLayer(layer10);
        const layer20b = new Layer_1.Layer();
        for (let i = 0; i < hiddenNeurons; i++)
            layer20b.addNeuron(new Neuron_1.Neuron());
        network.addLayer(layer20b);
        const layer30 = new Layer_1.Layer();
        for (let i = 0; i < outputChanels; i++)
            layer30.addNeuron(new Neuron_1.Neuron(Neuron_1.NeuronType.OUTPUT));
        network.addLayer(layer30);
        network.meshAllNeurons();
        this.inputNeurons = network.getLayers()[0].getNeurons();
        this.outputNeurons = network.getLayers()[network.getLayers().length - 1].getNeurons();
        this.value = new Map();
        const maxFrequenceFactor = outputChanels;
        this.numberOfPattern = 0;
        let phase = 0;
        for (let frequenceFactor = 1; frequenceFactor <= maxFrequenceFactor; frequenceFactor++) {
            for (let indexPhase = 0; indexPhase < inputChanels; indexPhase++) {
                phase += ModelFactory.PHASE_INCRMENT * frequenceFactor;
                for (let index = 0; index < inputChanels; index++) {
                    const alpha = ModelFactory.ALPHA_INCRMENT * index;
                    const input = 0.6 + 0.5 * Math.cos(frequenceFactor * alpha + phase);
                    let map = this.value.get(this.numberOfPattern);
                    if (!map) {
                        map = new Map();
                        this.value.set(this.numberOfPattern, map);
                    }
                    map.set(this.inputNeurons[index], input);
                }
                for (let output = 1; output <= outputChanels; output++) {
                    let map = this.value.get(this.numberOfPattern);
                    if (output === frequenceFactor)
                        map.set(this.outputNeurons[output - 1], 0.9);
                    else
                        map.set(this.outputNeurons[output - 1], 0.1);
                }
                this.numberOfPattern++;
            }
        }
        network.resetLinks();
        return network;
    }
    getNumberOfPattern() {
        return this.numberOfPattern;
    }
}
exports.ModelFactory = ModelFactory;
ModelFactory.ALPHA_INCRMENT = Math.PI / 180.0 * 8.0;
ModelFactory.PHASE_INCRMENT = Math.PI / 180.0 * 5.0;
