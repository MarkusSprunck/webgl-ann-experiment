import type { Neuron } from './Neuron';
export declare class Link {
    source: Neuron | null;
    weight: number;
    deltaWeigth: number;
    deltaWeigthOld: number;
}
