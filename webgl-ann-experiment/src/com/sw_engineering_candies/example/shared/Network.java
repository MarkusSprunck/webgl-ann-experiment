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

public class Network {

	private static final double GAMMA = 2.0;

	private static final double ALPHA = 0.1;

	private static final double WEIGHT_DECAY = 4.0;

	private static final double FLAT_SPOT = 0.001;

	private final List<Layer> layers = new ArrayList<Layer>();

	public void addLayer(final Layer layer) {
		layers.add(layer);
	}

	public List<Layer> getLayers() {
		return Collections.unmodifiableList(layers);
	}

	public void recallNetwork() {
		for (final Layer layer : layers) {
			layer.recallNeurons();
		}
	}

	public void meshAllNeurons() {
		int connections = 0;
		Layer firstLayer = null;
		Layer secondLayer = null;
		final int numberOfLayers = layers.size();
		for (int index = 1; index < numberOfLayers; index++) {
			firstLayer = layers.get(index - 1);
			secondLayer = layers.get(index);
			for (final Neuron target : secondLayer.getNeurons()) {
				for (final Neuron source : firstLayer.getNeurons()) {
					target.createLink(source, -1 + 0.1 * connections++);
				}
			}
		}
	}

	public void trainBackpropagation(final Pattern pattern, final int itterations, final int steps) {

		final int maxLayerIndex = layers.size() - 1;

		for (int step = 0; step < steps; step++) {

			for (int i = 0; i < itterations; i++) {

				// Activate a random pattern
				pattern.activatePatternRandom();

				// Forward propagation of input values
				recallNetwork();

				// Calculate errors of output neurons
				for (final Neuron neuron : layers.get(maxLayerIndex).getNeurons()) {
					neuron.calculateEvaluateOutputError();
				}

				// Calculate errors of hidden neurons
				for (int k = maxLayerIndex; k > 0; k--) {
					for (final Neuron neuron : layers.get(k).getNeurons()) {
						neuron.calculateEvaluateOutputErrorHiddenNeurons(FLAT_SPOT);
					}
				}

				// Calculate delta weights
				for (int k = maxLayerIndex; k > 0; k--) {
					for (final Neuron neuron : layers.get(k).getNeurons()) {
						for (final Link link : neuron.getLinks()) {
							final double weightDecayTerm = Math.pow(10, -WEIGHT_DECAY) * link.getWeight();
							final double momentumTerm = ALPHA * link.getDeltaWeigthOld();
							link.setDeltaWeigth(link.getDeltaWeigth() - GAMMA * link.getSource().getOutput()
									* neuron.getOutputDerived() * neuron.getOutputError() + momentumTerm
									- weightDecayTerm);
						}
					}
				}

				// calculate new weights of links
				for (int k = maxLayerIndex; k > 0; k--) {
					for (final Neuron neuron : layers.get(k).getNeurons()) {
						for (final Link link : neuron.getLinks()) {
							link.setWeight(link.getWeight() + link.getDeltaWeigth());
							link.setDeltaWeigthOld(link.getDeltaWeigth());
							link.setDeltaWeigth(0.0);
						}
					}
				}

				// Reset error of all neurons
				for (int k = maxLayerIndex; k > 0; k--) {
					for (final Neuron neuron : layers.get(k).getNeurons()) {
						neuron.setOutputError(0.0);
					}
				}
			}
			// System.out.println(String.format("rms=%1.15f", rms(pattern)));
		}
	}

	public void resetLinks() {
		for (final Layer layer : layers) {
			layer.resetLinks();
		}
	}

	public double rms(final Pattern patterns) {

		double result = 0.0;
		final int patternNumber = patterns.getNumberOfPattern();
		for (int i = 0; i < patternNumber; i++) {
			// Activate a random pattern
			patterns.activatePattern(i);

			// Forward propagation of input values
			recallNetwork();

			// Calculate errors of output neurons
			for (final Neuron neuron : layers.get(layers.size() - 1).getNeurons()) {
				neuron.calculateEvaluateOutputError();
				result += Math.pow(neuron.getOutputError(), 2.0);
			}
		}

		return result / (double) patternNumber;
	}

	@Override
	public String toString() {
		final StringBuilder result = new StringBuilder("{\"layers\":[");
		final int layerNumber = layers.size();
		for (int index = 0; index < layerNumber; index++) {
			result.append(layers.get(index).toString());
			result.append(index == layerNumber - 1 ? "" : ",");
		}
		result.append("]}");
		return result.toString();
	}

}
