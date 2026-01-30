import {Network} from '../core/Network';
import {Layer} from '../core/Layer';
import {Neuron, NeuronType} from '../core/Neuron';
import {Pattern} from '../core/Pattern';

export class ModelFactory extends Pattern {
    private static readonly ALPHA_INCRMENT = Math.PI / 180.0 * 8.0;
    private static readonly PHASE_INCRMENT = Math.PI / 180.0 * 5.0;

    // Inherits numberOfPattern, inputNeurons, outputNeurons and value from Pattern

    // Train/test split
    private trainIndices: number[] = [];
    private testIndices: number[] = [];
    private allIndices: number[] = [];

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

    /**
     * Create 80/20 train/test split with random selection
     */
    createTrainTestSplit(): void {
        this.allIndices = [];
        for (let i = 0; i < this.numberOfPattern; i++) {
            this.allIndices.push(i);
        }

        // Shuffle indices randomly (Fisher-Yates shuffle)
        for (let i = this.allIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.allIndices[i], this.allIndices[j]] = [this.allIndices[j], this.allIndices[i]];
        }

        // Split 80/20
        const splitIndex = Math.floor(this.numberOfPattern * 0.8);
        this.trainIndices = this.allIndices.slice(0, splitIndex);
        this.testIndices = this.allIndices.slice(splitIndex);

        console.log(`Train/Test split created: ${this.trainIndices.length} training, ${this.testIndices.length} test samples`);
    }

    /**
     * Activate a training pattern
     */
    activateTrainPattern(index: number): void {
        if (index >= 0 && index < this.trainIndices.length) {
            this.activatePattern(this.trainIndices[index]);
        }
    }

    /**
     * Activate a test pattern
     */
    activateTestPattern(index: number): void {
        if (index >= 0 && index < this.testIndices.length) {
            this.activatePattern(this.testIndices[index]);
        }
    }

    /**
     * Get number of training patterns
     */
    getTrainSize(): number {
        return this.trainIndices.length;
    }

    /**
     * Get number of test patterns
     */
    getTestSize(): number {
        return this.testIndices.length;
    }
}
