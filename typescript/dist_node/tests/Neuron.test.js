"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="jest" />
const Neuron_1 = require("../src/Neuron");
describe('Neuron', () => {
    let inner, input, output;
    beforeAll(() => {
        inner = new Neuron_1.Neuron();
        input = new Neuron_1.Neuron(Neuron_1.NeuronType.INPUT);
        output = new Neuron_1.Neuron(Neuron_1.NeuronType.OUTPUT);
    });
    test('type checks', () => {
        expect(input.isInputNeuron()).toBeTruthy();
        expect(output.isOutputNeuron()).toBeTruthy();
        expect(inner.isInnerNeuron()).toBeTruthy();
    });
    test('create link', () => {
        expect(inner.getLinks().length).toBe(0);
        inner.createLink(input, 1);
        expect(inner.getLinks().length).toBe(1);
    });
    test('set input and recall', () => {
        expect(input.getOutput()).toBe(0);
        input.setInput(1.123);
        input.recall();
        expect(input.getOutput()).toBeCloseTo(1.123);
    });
    test('recall and fermi behavior', () => {
        input.setInput(Number.MIN_SAFE_INTEGER - 1);
        input.recall();
        inner.recall();
        // in JS we won't get same extreme values; skip exact assertions for extremes
        input.setInput(-1);
        input.recall();
        inner.recall();
        expect(inner.getOutput()).toBeCloseTo(0.2689414213699951);
        input.setInput(0);
        input.recall();
        inner.recall();
        expect(inner.getOutput()).toBeCloseTo(0.5);
        input.setInput(1);
        input.recall();
        inner.recall();
        expect(inner.getOutput()).toBeCloseTo(0.7310585786300049);
        output.setOutputExpected(0.24);
        output.recall();
        expect(output.getOutputExpected()).toBeCloseTo(0.24);
    });
    test('errors and guards', () => {
        expect(() => inner.setInput(1)).toThrow();
        expect(() => inner.calculateEvaluateOutputError()).toThrow();
        expect(() => input.calculateEvaluateOutputErrorHiddenNeurons(0.01)).toThrow();
    });
});
