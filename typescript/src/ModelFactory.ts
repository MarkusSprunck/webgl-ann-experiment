import {Network} from './Network';
import {Layer} from './Layer';
import {Neuron, NeuronType} from './Neuron';
import {Pattern} from './Pattern';

export class ModelFactory extends Pattern {
    private static readonly ALPHA_INCRMENT = Math.PI / 180.0 * 8.0;
    private static readonly PHASE_INCRMENT = Math.PI / 180.0 * 5.0;

    // Inherits numberOfPattern, inputNeurons, outputNeurons and value from Pattern

    createBindTestPattern(): Network {
        const network = new Network();
        const inputChanels = 20;
        const hiddenNeurons = 15;
        const outputChanels = 10;

        const layer10 = new Layer();
        for (let i = 0; i < inputChanels; i++) layer10.addNeuron(new Neuron(NeuronType.INPUT));
        network.addLayer(layer10);

        const layer20b = new Layer();
        for (let i = 0; i < hiddenNeurons; i++) layer20b.addNeuron(new Neuron());
        network.addLayer(layer20b);

        const layer30 = new Layer();
        for (let i = 0; i < outputChanels; i++) layer30.addNeuron(new Neuron(NeuronType.OUTPUT));
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
                    let map = this.value.get(this.numberOfPattern)!;
                    if (output === frequenceFactor) map.set(this.outputNeurons[output - 1], 0.9);
                    else map.set(this.outputNeurons[output - 1], 0.1);
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
