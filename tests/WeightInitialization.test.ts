import {Network} from '../src/core/Network';
import {Layer} from '../src/core/Layer';
import {Neuron, NeuronType} from '../src/core/Neuron';

describe('Weight Initialization', () => {
  test('analyzeWeightDistribution works correctly', () => {
    const network = new Network();

    // Create a simple network: 2 input -> 3 hidden -> 1 output
    const inputLayer = new Layer();
    inputLayer.addNeuron(new Neuron(NeuronType.INPUT));
    inputLayer.addNeuron(new Neuron(NeuronType.INPUT));

    const hiddenLayer = new Layer();
    hiddenLayer.addNeuron(new Neuron(NeuronType.INNER));
    hiddenLayer.addNeuron(new Neuron(NeuronType.INNER));
    hiddenLayer.addNeuron(new Neuron(NeuronType.INNER));

    const outputLayer = new Layer();
    outputLayer.addNeuron(new Neuron(NeuronType.OUTPUT));

    network.addLayer(inputLayer);
    network.addLayer(hiddenLayer);
    network.addLayer(outputLayer);

    // Mesh neurons (create connections)
    network.meshAllNeurons();

    // Reset links with Xavier initialization
    network.resetLinks();

    // Analyze weight distribution
    const stats = network.analyzeWeightDistribution();

    // Verify stats structure
    expect(stats).toHaveProperty('min');
    expect(stats).toHaveProperty('max');
    expect(stats).toHaveProperty('mean');
    expect(stats).toHaveProperty('stdDev');
    expect(stats).toHaveProperty('count');

    // Verify count (3 hidden neurons with 2 inputs each + 1 output neuron with 3 inputs = 9 weights)
    expect(stats.count).toBe(9);

    // Verify weights are in reasonable range for Xavier initialization
    // For 2 inputs: limit = sqrt(6/2) ≈ 1.73
    // For 3 inputs: limit = sqrt(6/3) ≈ 1.41
    expect(Math.abs(stats.min)).toBeLessThanOrEqual(2.0);
    expect(Math.abs(stats.max)).toBeLessThanOrEqual(2.0);

    console.log('Weight Distribution Stats:', stats);
  });

  test('Xavier initialization scales with input size', () => {
    const network = new Network();

    // Create network with more inputs: 10 input -> 5 hidden -> 1 output
    const inputLayer = new Layer();
    for (let i = 0; i < 10; i++) {
      inputLayer.addNeuron(new Neuron(NeuronType.INPUT));
    }

    const hiddenLayer = new Layer();
    for (let i = 0; i < 5; i++) {
      hiddenLayer.addNeuron(new Neuron(NeuronType.INNER));
    }

    const outputLayer = new Layer();
    outputLayer.addNeuron(new Neuron(NeuronType.OUTPUT));

    network.addLayer(inputLayer);
    network.addLayer(hiddenLayer);
    network.addLayer(outputLayer);

    network.meshAllNeurons();
    network.resetLinks();

    const stats = network.analyzeWeightDistribution();

    // Verify count (5 hidden with 10 inputs + 1 output with 5 inputs = 55 weights)
    expect(stats.count).toBe(55);

    // For 10 inputs: limit = sqrt(6/10) ≈ 0.77
    // Most weights should be in the hidden layer with this limit
    expect(Math.abs(stats.min)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(stats.max)).toBeLessThanOrEqual(1.5);

    console.log('Scaled Network Weight Stats:', stats);
  });

  test('weights are different after reset (randomness)', () => {
    const network = new Network();

    const inputLayer = new Layer();
    inputLayer.addNeuron(new Neuron(NeuronType.INPUT));
    inputLayer.addNeuron(new Neuron(NeuronType.INPUT));

    const outputLayer = new Layer();
    outputLayer.addNeuron(new Neuron(NeuronType.OUTPUT));

    network.addLayer(inputLayer);
    network.addLayer(outputLayer);
    network.meshAllNeurons();

    // Get weights after first reset
    network.resetLinks();
    const stats1 = network.analyzeWeightDistribution();

    // Get weights after second reset
    network.resetLinks();
    const stats2 = network.analyzeWeightDistribution();

    // Weights should be different (very unlikely to be identical)
    // We check that at least mean or min or max is different
    const isDifferent =
      stats1.mean !== stats2.mean ||
      stats1.min !== stats2.min ||
      stats1.max !== stats2.max;

    expect(isDifferent).toBe(true);

    console.log('Reset 1:', stats1);
    console.log('Reset 2:', stats2);
  });
});
