import { Link } from './Link';
export declare enum NeuronType {
    INPUT = "INPUT",
    OUTPUT = "OUTPUT",
    INNER = "INNER"
}
export declare class Neuron {
    links: Link[];
    output: number;
    outputExpected: number;
    outputError: number;
    input: number;
    outputDerived: number;
    type: NeuronType;
    constructor(type?: NeuronType);
    createLink(source: Neuron, weight: number): void;
    getInput(): number;
    getLinks(): Link[];
    getOutput(): number;
    getOutputDerived(): number;
    getOutputExpected(): number;
    isInputNeuron(): boolean;
    isInnerNeuron(): boolean;
    isOutputNeuron(): boolean;
    setInput(v: number): void;
    recall(): void;
    calculateEvaluateOutputError(): void;
    calculateEvaluateOutputErrorHiddenNeurons(m_FlatSpot: number): void;
    setOutputError(v: number): void;
    getOutputError(): number;
    setOutputExpected(v: number): void;
    toString(): string;
    private functionFermi;
    private functionFermiDerive;
}
