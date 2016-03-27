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

import com.google.common.base.Preconditions;

public class Neuron {

	public enum Type {
		INPUT, OUTPUT, INNER
	}

	private final List<Link> links = new ArrayList<Link>();

	private double output = 0.0;

	private double outputExpected = 0.0;

	private double outputError = 0.0;

	private double input = 0.0;

	private double outputDerived = 1.0;

	private final Type type;

	public Neuron() {
		this(Type.INNER);
	}

	public Neuron(final Type type) {
		this.type = type;
	}

	public void createLink(final Neuron source, final double weight) {
		Link link = null;

		Preconditions.checkNotNull(source);
		Preconditions.checkArgument(!source.equals(this));

		link = new Link();
		link.setSource(source);
		link.setWeight(weight);
		links.add(link);
	}

	private double functionFermi(final double x) {
		if (x > 15) {
			return 1.0;
		} else if (x < -15) {
			return 0.0;
		} else {
			final double y = 1.0 / (1.0 + Math.exp(-x));
			return y;
		}
	}

	private double functionFermiDerive(final double x) {
		final double z = functionFermi(x);
		final double y = z * (1 - z);
		return y;
	}

	public double getInput() {
		return input;
	}

	public List<Link> getLinks() {
		return Collections.unmodifiableList(links);
	}

	public double getOutput() {
		return output;
	}

	public double getOutputDerived() {
		return outputDerived;
	}

	public double getOutputExpected() {
		return outputExpected;
	}

	public boolean isInputNeuron() {
		return Type.INPUT.equals(type);
	}

	public boolean isInnerNeuron() {
		return Type.INNER.equals(type);
	}

	public boolean isOutputNeuron() {
		return Type.OUTPUT.equals(type);
	}

	public void setInput(final double input) {
		Preconditions.checkState(Type.INPUT == type);
		this.input = input;
	}

	public void recall() {

		if (Type.INPUT.equals(type)) {
			output = input;
			outputDerived = 1.0;
		} else {
			double sum = 0.0;
			for (final Link link : links) {
				sum += link.getSource().getOutput() * link.getWeight();
			}
			output = functionFermi(sum);
			outputDerived = functionFermiDerive(sum);
		}
	}

	public void calculateEvaluateOutputError() {
		Preconditions.checkArgument(Type.OUTPUT == type);
		outputError = output - outputExpected;
	};

	public void calculateEvaluateOutputErrorHiddenNeurons(
			final double m_FlatSpot) {
		Preconditions.checkArgument(Type.INPUT != type);

		for (final Link link : links) {
			final double derivation = outputDerived + m_FlatSpot;
			final double oldError = link.getSource().getOutputError();
			link.getSource().setOutputError(
					derivation * outputError * link.getWeight() + oldError);
		}
	};

	public void setOutputError(final double outputError) {
		this.outputError = outputError;
	}

	public double getOutputError() {
		return outputError;
	}

	public void setOutputExpected(final double outputExpected) {
		this.outputExpected = outputExpected;
	}

	@Override
	public String toString() {
		return "{\"y\":" + output + ",\"y_ex\":" + outputExpected + "}";
	}

}
