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

import java.util.List;

import com.google.common.base.Preconditions;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.ImmutableTable;
import com.google.common.collect.Table;

public class Pattern {

	protected int numberOfPattern = 0;

	protected List<Neuron> inputNeurons;

	protected List<Neuron> outputNeurons;

	protected Table<Integer, Neuron, Double> value;

	public void bind(final Network network, final Double[][] table) {
		Preconditions.checkNotNull(network);
		Preconditions.checkArgument(null != table);
		Preconditions.checkArgument(0 < table.length);

		inputNeurons = network.getLayers().get(0).getNeurons();
		outputNeurons = network.getLayers().get(network.getLayers().size() - 1)
				.getNeurons();

		final int inputNeuronNumber = inputNeurons.size();
		final int outputNeuronNumber = outputNeurons.size();
		Preconditions
				.checkArgument(inputNeuronNumber + outputNeuronNumber == table[0].length);
		numberOfPattern = table.length;

		value = HashBasedTable.create();

		for (int col = 0; col < inputNeuronNumber; col++) {
			for (int row = 0; row < numberOfPattern; row++) {
				value.put(row, inputNeurons.get(col), table[row][col]);
			}
		}
		for (int col = 0; col < outputNeuronNumber; col++) {
			for (int row = 0; row < numberOfPattern; row++) {
				value.put(row, outputNeurons.get(col), table[row][col
						+ inputNeuronNumber]);
			}
		}
	}

	public ImmutableTable<Integer, Neuron, Double> getPatterns() {
		return ImmutableTable.copyOf(value);
	}

	public void activatePatternRandom() {
		int index = (int) (Math.random() * numberOfPattern );
		//System.out.println("pattern " + index + "/" + numberOfPattern);
		activatePattern(index);
	}

	public void activatePattern(final int index) {
		Preconditions.checkArgument(index >= 0);
		Preconditions.checkArgument(index < numberOfPattern);

		for (final Neuron inputNeuron : inputNeurons) {
			inputNeuron.setInput(value.get(index, inputNeuron));
		}
		for (final Neuron outputNeuron : outputNeurons) {
			outputNeuron.setOutputExpected(value.get(index, outputNeuron));
		}
	}

	public int getNumberOfPattern() {
		return numberOfPattern;
	}

}
