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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Layer {

	private final List<Neuron> neurons = new ArrayList<Neuron>();

	public void addNeuron(final Neuron neuron) {
		neurons.add(neuron);
	}

	public List<Neuron> getNeurons() {
		return Collections.unmodifiableList(neurons);
	}

	public void recallNeurons() {
		for (final Neuron neuron : neurons) {
			neuron.recall();
		}
	}

	public void resetLinks() {
		for (final Neuron neuron : neurons) {
			for (final Link link : neuron.getLinks()) {
				link.setWeight(0.1*(Math.random() - 0.5));
			}
		}
	}

	@Override
	public String toString() {
		final StringBuilder result = new StringBuilder("{\"nodes\":[");
		final int neuronNumber = neurons.size();
		for (int index = 0; index < neuronNumber; index++) {
			result.append(neurons.get(index).toString());
			result.append(index == neuronNumber - 1 ? "" : ",");
		}
		result.append("]}");
		return result.toString();
	}

}
