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

    /**
     * Reset all link weights in this layer using normalized initialization.
     *
     * This network uses sigmoid activation function (Fermi function: 1/(1+e^-x)).
     * For sigmoid activations, we use a variant of Xavier/LeCun initialization:
     *   weight = random(-sqrt(3/n), sqrt(3/n))
     * where n is the number of input connections (fan-in).
     *
     * Note: Classic Xavier uses sqrt(6/n) for tanh, but sigmoid has different
     * properties (range [0,1], max derivative 0.25), so sqrt(3/n) provides
     * better initial variance for this activation function.
     *
     * This initialization:
     * - Prevents vanishing/exploding gradients
     * - Scales appropriately with layer size
     * - Maintains stable variance through the network
     *
     * Reference: LeCun et al. 1998, "Efficient BackProp"
     */
    resetLinks() {
        for (const neuron of this.neurons) {
            const links = neuron.getLinks() as any;
            const n = links.length;

            if (n === 0) continue;

            // Normalized initialization for sigmoid: weights in range [-sqrt(3/n), sqrt(3/n)]
            // This is more appropriate than Xavier's sqrt(6/n) for sigmoid activations
            const limit = Math.sqrt(3 / n);

            for (const link of links) {
                // Random value in range [-limit, limit]
                link.weight = (Math.random() * 2 - 1) * limit;
            }
        }
    }

    toString() {
        return `{"nodes":[${this.neurons.map(n => n.toString()).join(',')}]}`;
    }
}
