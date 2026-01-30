import {Layer} from './Layer';
import {Pattern} from './Pattern';

export class Network {
    private static readonly GAMMA = 2.0;
    private static readonly ALPHA = 0.1;
    private static readonly WEIGHT_DECAY = 4.0;
    private static readonly FLAT_SPOT = 0.001;

    private layers: Layer[] = [];

    addLayer(layer: Layer) {
        this.layers.push(layer);
    }

    getLayers() {
        return this.layers;
    }

    recallNetwork() {
        for (const l of this.layers) l.recallNeurons();
    }

    meshAllNeurons() {
        let connections = 0;
        for (let index = 1; index < this.layers.length; index++) {
            const firstLayer = this.layers[index - 1];
            const secondLayer = this.layers[index];
            for (const target of secondLayer.getNeurons()) {
                for (const source of firstLayer.getNeurons()) {
                    // create link with deterministic weight seed
                    (target as any).createLink(source, -1 + 0.1 * connections++);
                }
            }
        }
    }

    trainBackpropagation(pattern: Pattern, itterations: number, steps: number) {
        const maxLayerIndex = this.layers.length - 1;
        for (let step = 0; step < steps; step++) {
            for (let i = 0; i < itterations; i++) {
                pattern.activatePatternRandom();
                this.recallNetwork();
                for (const neuron of this.layers[maxLayerIndex].getNeurons()) {
                    (neuron as any).calculateEvaluateOutputError();
                }
                for (let k = maxLayerIndex; k > 0; k--) {
                    for (const neuron of this.layers[k].getNeurons()) {
                        (neuron as any).calculateEvaluateOutputErrorHiddenNeurons(Network.FLAT_SPOT);
                    }
                }
                for (let k = maxLayerIndex; k > 0; k--) {
                    for (const neuron of this.layers[k].getNeurons()) {
                        for (const link of (neuron as any).getLinks()) {
                            const weightDecayTerm = Math.pow(10, -Network.WEIGHT_DECAY) * link.weight;
                            const momentumTerm = Network.ALPHA * link.deltaWeigthOld;
                            link.deltaWeigth = link.deltaWeigth - Network.GAMMA * link.source.output * (neuron as any).getOutputDerived() * (neuron as any).getOutputError() + momentumTerm - weightDecayTerm;
                        }
                    }
                }
                for (let k = maxLayerIndex; k > 0; k--) {
                    for (const neuron of this.layers[k].getNeurons()) {
                        for (const link of (neuron as any).getLinks()) {
                            link.weight = link.weight + link.deltaWeigth;
                            link.deltaWeigthOld = link.deltaWeigth;
                            link.deltaWeigth = 0.0;
                        }
                    }
                }
                for (let k = maxLayerIndex; k > 0; k--) {
                    for (const neuron of this.layers[k].getNeurons()) {
                        (neuron as any).setOutputError(0.0);
                    }
                }
            }
        }
    }

    resetLinks() {
        for (const layer of this.layers) layer.resetLinks();
    }

    rms(patterns: Pattern) {
        let result = 0.0;
        const patternNumber = patterns.getNumberOfPattern();
        for (let i = 0; i < patternNumber; i++) {
            patterns.activatePattern(i);
            this.recallNetwork();
            for (const neuron of this.layers[this.layers.length - 1].getNeurons()) {
                (neuron as any).calculateEvaluateOutputError();
                result += Math.pow((neuron as any).getOutputError(), 2.0);
            }
        }
        return result / patternNumber;
    }

    toString() {
        return `{"layers":[${this.layers.map(l => l.toString()).join(',')}]}`;
    }
}
