import { Layer } from './Layer';
import { Pattern } from './Pattern';
export declare class Network {
    private static readonly GAMMA;
    private static readonly ALPHA;
    private static readonly WEIGHT_DECAY;
    private static readonly FLAT_SPOT;
    private layers;
    addLayer(layer: Layer): void;
    getLayers(): Layer[];
    recallNetwork(): void;
    meshAllNeurons(): void;
    trainBackpropagation(pattern: Pattern, itterations: number, steps: number): void;
    resetLinks(): void;
    rms(patterns: Pattern): number;
    toString(): string;
}
