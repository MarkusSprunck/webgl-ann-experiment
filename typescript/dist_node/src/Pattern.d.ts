import { Neuron } from './Neuron';
export declare class Pattern {
    protected numberOfPattern: number;
    protected inputNeurons: readonly Neuron[];
    protected outputNeurons: readonly Neuron[];
    protected value: Map<number, Map<Neuron, number>>;
    bind(network: {
        getLayers: () => {
            getNeurons: () => Neuron[];
        }[];
    }, table: number[][]): void;
    getPatterns(): Map<number, Map<Neuron, number>>;
    activatePatternRandom(): void;
    activatePattern(index: number): void;
    getNumberOfPattern(): number;
}
