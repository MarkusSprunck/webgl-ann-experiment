import { Neuron } from './Neuron';
export declare class Layer {
    neurons: Neuron[];
    addNeuron(n: Neuron): void;
    getNeurons(): readonly Neuron[];
    recallNeurons(): void;
    resetLinks(): void;
    toString(): string;
}
