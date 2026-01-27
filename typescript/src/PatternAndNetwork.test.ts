/// <reference types="jest" />
import { Layer } from './Layer';
import { Network } from './Network';
import { Neuron, NeuronType } from './Neuron';
import { Pattern } from './Pattern';

describe('Pattern and Network', () => {
  test('bind and recall basics', () => {
    const n1 = new Neuron(NeuronType.INPUT);
    const n2 = new Neuron(NeuronType.INPUT);
    const n3 = new Neuron(NeuronType.INNER);
    const n4 = new Neuron(NeuronType.INNER);
    const n5 = new Neuron(NeuronType.OUTPUT);
    const l1 = new Layer(); l1.addNeuron(n1); l1.addNeuron(n2);
    const l2 = new Layer(); l2.addNeuron(n3); l2.addNeuron(n4);
    const l3 = new Layer(); l3.addNeuron(n5);
    const net = new Network(); net.addLayer(l1); net.addLayer(l2); net.addLayer(l3);
    net.meshAllNeurons();

    const table = [[0.5,0.6,1.1],[0.8,0.7,1.2]];
    const p = new Pattern();
    p.bind(net as any, table);
    expect((p.getPatterns().get(0)!.get(n1))).toBeCloseTo(0.5);
    p.activatePattern(0);
    expect(n1.getInput()).toBeCloseTo(0.5);
    net.recallNetwork();
    expect(n5.getOutput()).toBeCloseTo(0.4232192546513898);
  });

  test('pattern bounds', () => {
    const net = new Network();
    const l1 = new Layer(); l1.addNeuron(new Neuron(NeuronType.INPUT));
    const l2 = new Layer(); l2.addNeuron(new Neuron());
    const l3 = new Layer(); l3.addNeuron(new Neuron(NeuronType.OUTPUT));
    net.addLayer(l1); net.addLayer(l2); net.addLayer(l3);
    net.meshAllNeurons();
    const p = new Pattern();
    expect(() => p.bind(net as any, [[] as any])).toThrow();
    expect(() => p.bind(net as any, [])).toThrow();
    expect(() => p.bind(net as any, null as any)).toThrow();
  });
});
