import type {Neuron} from './Neuron';

export class Link {
    source: Neuron | null = null;
    weight: number = 0;
    deltaWeigth: number = 0;
    deltaWeigthOld: number = 0;
}
