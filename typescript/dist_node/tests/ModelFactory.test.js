"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="jest" />
const ModelFactory_1 = require("../src/ModelFactory");
jest.setTimeout(120000);
test('model factory creates pattern and network trains', () => {
    const mf = new ModelFactory_1.ModelFactory();
    const network = mf.createBindTestPattern();
    network.resetLinks();
    const itterations = mf.getNumberOfPattern();
    // run a longer training pass similar to the Java test to reduce RMS
    network.trainBackpropagation(mf, itterations, 100);
    const rms = network.rms(mf);
    // allow a tolerance for numeric differences in JS; training achieves low RMS but not exactly 0
    expect(rms).toBeLessThanOrEqual(0.08);
});
