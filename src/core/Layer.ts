import {Neuron} from './Neuron';

export class Layer {
    neurons: Neuron[] = [];

    addNeuron(n: Neuron) {
        this.neurons.push(n);
    }

    getNeurons() {
        return Object.freeze([...this.neurons]);
    }

    recallNeurons() {
        for (const n of this.neurons) n.recall();
    }

    resetLinks() {
        for (const neuron of this.neurons) {
            for (const link of neuron.getLinks() as any) {
                link.weight = 0.1 * (Math.random() - 0.5);
            }
        }
    }

    toString() {
        return `{"nodes":[${this.neurons.map(n => n.toString()).join(',')}]}`;
    }
}
