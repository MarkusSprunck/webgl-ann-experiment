import { Network } from './Network';
import { Pattern } from './Pattern';
export declare class ModelFactory extends Pattern {
    private static readonly ALPHA_INCRMENT;
    private static readonly PHASE_INCRMENT;
    createBindTestPattern(): Network;
    getNumberOfPattern(): number;
}
