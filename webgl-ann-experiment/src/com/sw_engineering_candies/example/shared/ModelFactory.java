/**
 * Copyright (C) 2013, Markus Sprunck
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or
 * without modification, are permitted provided that the following
 * conditions are met:
 *
 * - Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above
 *   copyright notice, this list of conditions and the following
 *   disclaimer in the documentation and/or other materials provided
 *   with the distribution.
 *
 * - The name of its contributor may be used to endorse or promote
 *   products derived from this software without specific prior
 *   written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 * CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package com.sw_engineering_candies.example.shared;

import com.google.common.collect.HashBasedTable;
import com.sw_engineering_candies.example.shared.Neuron.Type;

// $codepro.audit.disable unnecessaryImport

public class ModelFactory extends Pattern {

	private static final double ALPHA_INCRMENT = Math.PI / 180.0 * 8.0;

	private static final double PHASE_INCRMENT = Math.PI / 180.0 * 5.0;

	public Network createBindTestPattern() {

		final Network network = new Network();

		final int inputChanels = 20;

		final int hiddenNeurons = 15;

		final int outputChanels = 10;

		final Layer layer10 = new Layer();
		for (int i = 0; i < inputChanels; i++) {
			layer10.addNeuron(new Neuron(Type.INPUT));
		}
		network.addLayer(layer10);

		final Layer layer20b = new Layer();
		for (int i = 0; i < hiddenNeurons; i++) {
			layer20b.addNeuron(new Neuron());
		}
		network.addLayer(layer20b);

		final Layer layer30 = new Layer();
		for (int i = 0; i < outputChanels; i++) {
			layer30.addNeuron(new Neuron(Type.OUTPUT));
		}
		network.addLayer(layer30);

		network.meshAllNeurons();

		inputNeurons = network.getLayers().get(0).getNeurons();
		outputNeurons = network.getLayers().get(network.getLayers().size() - 1)
				.getNeurons();
		value = HashBasedTable.create();

		final int maxFrequenceFactor = outputChanels;
		numberOfPattern = 0;
		double phase = 0;
		for (int frequenceFactor = 1; frequenceFactor <= maxFrequenceFactor; frequenceFactor++) {
			for (int indexPhase = 0; indexPhase < inputChanels; indexPhase++) {
				phase += PHASE_INCRMENT * frequenceFactor;
				for (int index = 0; index < inputChanels; index++) {
					final double alpha = ALPHA_INCRMENT * index;
					final double input = 0.6 + 0.5 * Math.cos(frequenceFactor
							* alpha + phase);
					value.put(numberOfPattern, inputNeurons.get(index), input);
				}
				for (int output = 1; output <= outputChanels; output++) {
					if (output == frequenceFactor) {
						value.put(numberOfPattern,
								outputNeurons.get(output - 1), 0.9);
					} else {
						value.put(numberOfPattern,
								outputNeurons.get(output - 1), 0.1);
					}
				}
				numberOfPattern++;
			}

		}

		network.resetLinks();
		return network;
	}
}
