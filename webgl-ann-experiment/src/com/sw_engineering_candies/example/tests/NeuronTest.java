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

package com.sw_engineering_candies.example.tests;

import static org.junit.Assert.assertEquals;
import junit.framework.Assert;

import org.junit.BeforeClass;
import org.junit.Test;

import com.sw_engineering_candies.example.shared.Neuron;
import com.sw_engineering_candies.example.shared.Neuron.Type;

public class NeuronTest {

	private static Neuron underTestNeuronOutput;
	private static Neuron underTestNeuronInput;
	private static Neuron underTestNeuronInner;

	@BeforeClass
	public static void setUpBeforeClass() {
		underTestNeuronInner = new Neuron();
		underTestNeuronInput = new Neuron(Type.INPUT);
		underTestNeuronOutput = new Neuron(Type.OUTPUT);
	}

	@Test
	public void testIsInputNeuron() {
		Assert.assertTrue(underTestNeuronInput.isInputNeuron());
		Assert.assertFalse(underTestNeuronOutput.isInputNeuron());
		Assert.assertFalse(underTestNeuronInner.isInputNeuron());
	}

	@Test
	public void testIsOutputNeuron() {
		Assert.assertTrue(underTestNeuronOutput.isOutputNeuron());
		Assert.assertFalse(underTestNeuronInput.isOutputNeuron());
		Assert.assertFalse(underTestNeuronInner.isOutputNeuron());
	}

	@Test
	public void testIsInnnerNeuron() {
		Assert.assertTrue(underTestNeuronInner.isInnerNeuron());
		Assert.assertFalse(underTestNeuronOutput.isInnerNeuron());
		Assert.assertFalse(underTestNeuronInput.isInnerNeuron());
	}

	@Test
	public void testCreateLink() {
		Assert.assertEquals(0, underTestNeuronInner.getLinks().size());
		underTestNeuronInner.createLink(underTestNeuronInput, 1);
		Assert.assertEquals(1, underTestNeuronInner.getLinks().size());
	}

	@Test(expected = IllegalArgumentException.class)
	public void testCreateLinkWrong() {
		Assert.assertEquals(1, underTestNeuronInner.getLinks().size());
		underTestNeuronInner.createLink(underTestNeuronInner, 1);
	}

	@Test
	public void testSetY() {
		Assert.assertEquals(0.0, underTestNeuronInput.getOutput());
		underTestNeuronInput.setInput(1.123);
		underTestNeuronInput.recall();
		Assert.assertEquals(1.123, underTestNeuronInput.getOutput());
	}

	@Test
	public void testRecall() {

		underTestNeuronInput.setInput(Double.MIN_EXPONENT - 1.0);
		underTestNeuronInput.recall();
		underTestNeuronInner.recall();
		Assert.assertEquals(-1023.0, underTestNeuronInput.getOutput());
		Assert.assertEquals(1.0, underTestNeuronInput.getOutputDerived());
		Assert.assertEquals(0.0, underTestNeuronInner.getOutput());
		Assert.assertEquals(0.0, underTestNeuronInner.getOutputDerived());

		underTestNeuronInput.setInput(-1.0);
		underTestNeuronInput.recall();
		underTestNeuronInner.recall();
		Assert.assertEquals(0.2689414213699951,
				underTestNeuronInner.getOutput());
		Assert.assertEquals(0.19661193324148185,
				underTestNeuronInner.getOutputDerived());

		underTestNeuronInput.setInput(0.0);
		underTestNeuronInput.recall();
		underTestNeuronInner.recall();
		Assert.assertEquals(0.5, underTestNeuronInner.getOutput());
		Assert.assertEquals(0.25, underTestNeuronInner.getOutputDerived());

		underTestNeuronInput.setInput(1.0);
		underTestNeuronInput.recall();
		underTestNeuronInner.recall();
		Assert.assertEquals(0.7310585786300049,
				underTestNeuronInner.getOutput());
		Assert.assertEquals(0.19661193324148185,
				underTestNeuronInner.getOutputDerived());

		underTestNeuronInput.setInput(Double.MAX_EXPONENT + 1.0);
		underTestNeuronInput.recall();
		underTestNeuronInner.recall();
		Assert.assertEquals(1.0, underTestNeuronInner.getOutput());
		Assert.assertEquals(0.0, underTestNeuronInner.getOutputDerived());

		underTestNeuronOutput.setOutputExpected(0.24);
		underTestNeuronOutput.recall();
		Assert.assertEquals(0.24, underTestNeuronOutput.getOutputExpected());
	}

	@Test
	public void testToString() {
		assertEquals("{\"y\":0.0,\"y_ex\":0.0}",
				underTestNeuronInner.toString());
		assertEquals("{\"y\":1.123,\"y_ex\":0.0}",
				underTestNeuronInput.toString());
		assertEquals("{\"y\":0.0,\"y_ex\":12.0}",
				underTestNeuronOutput.toString());
	}

	@Test(expected = IllegalStateException.class)
	public void testSetInputWrong1() {
		underTestNeuronInner.setInput(1.0);
	}

	@Test(expected = IllegalArgumentException.class)
	public void testCalculateEvaluateOutputErrorWrong() {
		underTestNeuronInner.calculateEvaluateOutputError();
	}

	@Test(expected = IllegalArgumentException.class)
	public void testErrorHiddenNeuronsWrong() {
		underTestNeuronInput.calculateEvaluateOutputErrorHiddenNeurons(0.01);
	}

	@Test
	public void testSetInput() {
		underTestNeuronInput.setInput(13.0);
		assertEquals(13.0, underTestNeuronInput.getInput(), 0.0);
	}

	@Test
	public void testOutputExpected() {
		underTestNeuronOutput.setOutputExpected(12.0);
		assertEquals(12.0, underTestNeuronOutput.getOutputExpected(), 0.0);
	}

}
