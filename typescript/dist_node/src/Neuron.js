"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neuron = exports.NeuronType = void 0;
const Link_1 = require("./Link");
var NeuronType;
(function (NeuronType) {
    NeuronType["INPUT"] = "INPUT";
    NeuronType["OUTPUT"] = "OUTPUT";
    NeuronType["INNER"] = "INNER";
})(NeuronType || (exports.NeuronType = NeuronType = {}));
class Neuron {
    constructor(type = NeuronType.INNER) {
        this.links = [];
        this.output = 0.0;
        this.outputExpected = 0.0;
        this.outputError = 0.0;
        this.input = 0.0;
        this.outputDerived = 1.0;
        this.type = type;
    }
    createLink(source, weight) {
        if (!source)
            throw new Error('source is null');
        if (source === this)
            throw new Error('source equals this');
        const link = new Link_1.Link();
        link.source = source;
        link.weight = weight;
        this.links.push(link);
    }
    getInput() {
        return this.input;
    }
    getLinks() {
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
    setInput(v) {
        if (this.type !== NeuronType.INPUT)
            throw new Error('IllegalState: not input neuron');
        this.input = v;
    }
    recall() {
        if (this.type === NeuronType.INPUT) {
            this.output = this.input;
            this.outputDerived = 1.0;
        }
        else {
            let sum = 0.0;
            for (const link of this.links) {
                // use getter to avoid direct property access on linked neuron
                sum += (link.source.getOutput()) * link.weight;
            }
            this.output = this.functionFermi(sum);
            this.outputDerived = this.functionFermiDerive(sum);
        }
    }
    calculateEvaluateOutputError() {
        if (this.type !== NeuronType.OUTPUT)
            throw new Error('IllegalArgument: not output');
        this.outputError = this.output - this.outputExpected;
    }
    calculateEvaluateOutputErrorHiddenNeurons(m_FlatSpot) {
        if (this.type === NeuronType.INPUT)
            throw new Error('IllegalArgument: is input');
        for (const link of this.links) {
            const derivation = this.outputDerived + m_FlatSpot;
            const oldError = link.source.getOutputError();
            link.source.setOutputError(derivation * this.outputError * link.weight + oldError);
        }
    }
    setOutputError(v) {
        this.outputError = v;
    }
    getOutputError() {
        return this.outputError;
    }
    setOutputExpected(v) {
        this.outputExpected = v;
    }
    toString() {
        return `{"y":${this.output},"y_ex":${this.outputExpected}}`;
    }
    functionFermi(x) {
        if (x > 15)
            return 1.0;
        if (x < -15)
            return 0.0;
        const y = 1.0 / (1.0 + Math.exp(-x));
        return y;
    }
    functionFermiDerive(x) {
        const z = this.functionFermi(x);
        return z * (1 - z);
    }
}
exports.Neuron = Neuron;
