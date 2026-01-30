import {Link} from './Link';

export enum NeuronType { INPUT = 'INPUT', OUTPUT = 'OUTPUT', INNER = 'INNER' }

export class Neuron {
    links: Link[] = [];
    output = 0.0;
    outputExpected = 0.0;
    outputError = 0.0;
    input = 0.0;
    outputDerived = 1.0;
    type: NeuronType;

    constructor(type: NeuronType = NeuronType.INNER) {
        this.type = type;
    }

    createLink(source: Neuron, weight: number) {
        if (!source) throw new Error('source is null');
        if (source === this) throw new Error('source equals this');
        const link = new Link();
        link.source = source;
        link.weight = weight;
        this.links.push(link);
    }

    getInput() {
        return this.input;
    }

    getLinks(): Link[] {
        return this.links;
    }

    getOutput() {
        return this.output;
    }

    getOutputDerived() {
        return this.outputDerived;
    }

    getOutputExpected() {
        return this.outputExpected;
    }

    isInputNeuron() {
        return this.type === NeuronType.INPUT;
    }

    isInnerNeuron() {
        return this.type === NeuronType.INNER;
    }

    isOutputNeuron() {
        return this.type === NeuronType.OUTPUT;
    }

    setInput(v: number) {
        if (this.type !== NeuronType.INPUT) throw new Error('IllegalState: not input neuron');
        this.input = v;
    }

    recall() {
        if (this.type === NeuronType.INPUT) {
            this.output = this.input;
            this.outputDerived = 1.0;
        } else {
            let sum = 0.0;
            for (const link of this.links) {
                // use getter to avoid direct property access on linked neuron
                sum += (link.source!.getOutput()) * link.weight;
            }
            this.output = this.functionFermi(sum);
            this.outputDerived = this.functionFermiDerive(sum);
        }
    }

    calculateEvaluateOutputError() {
        if (this.type !== NeuronType.OUTPUT) throw new Error('IllegalArgument: not output');
        this.outputError = this.output - this.outputExpected;
    }

    calculateEvaluateOutputErrorHiddenNeurons(m_FlatSpot: number) {
        if (this.type === NeuronType.INPUT) throw new Error('IllegalArgument: is input');
        for (const link of this.links) {
            const derivation = this.outputDerived + m_FlatSpot;
            const oldError = link.source!.getOutputError();
            link.source!.setOutputError(derivation * this.outputError * link.weight + oldError);
        }
    }

    setOutputError(v: number) {
        this.outputError = v;
    }

    getOutputError() {
        return this.outputError;
    }

    setOutputExpected(v: number) {
        this.outputExpected = v;
    }

    toString() {
        return `{"y":${this.output},"y_ex":${this.outputExpected}}`;
    }

    private functionFermi(x: number) {
        if (x > 15) return 1.0;
        if (x < -15) return 0.0;
        const y = 1.0 / (1.0 + Math.exp(-x));
        return y;
    }

    private functionFermiDerive(x: number) {
        const z = this.functionFermi(x);
        return z * (1 - z);
    }
}
