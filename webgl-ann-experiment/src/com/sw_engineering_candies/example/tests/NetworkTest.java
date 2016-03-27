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

import java.util.List;

import org.junit.BeforeClass;
import org.junit.Test;

import com.sw_engineering_candies.example.shared.Layer;
import com.sw_engineering_candies.example.shared.Network;
import com.sw_engineering_candies.example.shared.Neuron;
import com.sw_engineering_candies.example.shared.Neuron.Type;
import com.sw_engineering_candies.example.shared.Pattern;

public class NetworkTest {

	private static Pattern testObjectPatterns = new Pattern();
	private static Network testObjectNetwork = new Network();
	private static Neuron testObjectNeuron11 = new Neuron(Type.INPUT);
	private static Neuron testObjectNeuron12 = new Neuron(Type.INPUT);
	private static Neuron testObjectNeuron21 = new Neuron();
	private static Neuron testObjectNeuron22 = new Neuron();
	private static Neuron testObjectNeuron31 = new Neuron(Type.OUTPUT);
	private static Layer layer10 = new Layer();
	private static Layer layer20 = new Layer();
	private static Layer layer30 = new Layer();

	@BeforeClass
	public static void setUpBeforeClass() {

		layer10.addNeuron(testObjectNeuron11);
		layer10.addNeuron(testObjectNeuron12);
		testObjectNetwork.addLayer(layer10);

		layer20.addNeuron(testObjectNeuron21);
		layer20.addNeuron(testObjectNeuron22);
		testObjectNetwork.addLayer(layer20);

		layer30.addNeuron(testObjectNeuron31);
		testObjectNetwork.addLayer(layer30);

		testObjectNetwork.meshAllNeurons();
	}

	@Test
	public void testSetPatterns() {
		final Double[][] table = new Double[][] { { 0.5, 0.6, 1.1 }, { 0.8, 0.7, 1.2 } };
		testObjectPatterns.bind(testObjectNetwork, table);
		assertEquals("{0=0.5, 1=0.8}", testObjectPatterns.getPatterns().column(testObjectNeuron11).toString());
		assertEquals("{0=0.6, 1=0.7}", testObjectPatterns.getPatterns().column(testObjectNeuron12).toString());
		assertEquals("{0=1.1, 1=1.2}", testObjectPatterns.getPatterns().column(testObjectNeuron31).toString());

		testObjectPatterns.activatePattern(0);
		assertEquals(0.5, testObjectNeuron11.getInput(), 0);
		assertEquals(0.6, testObjectNeuron12.getInput(), 0);
		assertEquals(1.1, testObjectNeuron31.getOutputExpected(), 0);
		testObjectNetwork.recallNetwork();
		assertEquals(0.4232192546513898, testObjectNeuron31.getOutput(), 0);

		testObjectPatterns.activatePattern(1);
		assertEquals(0.8, testObjectNeuron11.getInput(), 0);
		assertEquals(0.7, testObjectNeuron12.getInput(), 0);
		assertEquals(1.2, testObjectNeuron31.getOutputExpected(), 0);
		testObjectNetwork.recallNetwork();
		assertEquals(0.4407941265386288, testObjectNeuron31.getOutput(), 0.0000000001);
	}

	@Test
	public void testSetPatternsWrong() {
		final Double[][] table = new Double[][] { { 0.5, 0.6, 1.1 }, { 0.8, 0.7, 1.2 } };
		testObjectPatterns.bind(testObjectNetwork, table);
		assertEquals("{}", testObjectPatterns.getPatterns().column(testObjectNeuron21).toString());
	}

	@Test(expected = IllegalArgumentException.class)
	public void testSetPatternsWrong1() {
		testObjectPatterns.bind(testObjectNetwork, new Double[][] { {} });
	}

	@Test(expected = IllegalArgumentException.class)
	public void testSetPatternsWrong2() {
		testObjectPatterns.bind(testObjectNetwork, new Double[][] {});
	}

	@Test(expected = IllegalArgumentException.class)
	public void testSetPatternsWrong3() {
		testObjectPatterns.bind(testObjectNetwork, null);
	}

	@Test(expected = IllegalArgumentException.class)
	public void testActivatePatternsWrong1() {
		final Double[][] table = new Double[][] { { 0.5, 0.6, 1.1 }, { 0.8, 0.7, 1.2 } };
		testObjectPatterns.bind(testObjectNetwork, table);
		testObjectPatterns.activatePattern(-1);
	}

	@Test(expected = IllegalArgumentException.class)
	public void testActivatePatternsWrong2() {
		final Double[][] table = new Double[][] { { 0.5, 0.6, 1.1 }, { 0.8, 0.7, 1.2 } };
		testObjectPatterns.bind(testObjectNetwork, table);
		testObjectPatterns.activatePattern(2);
	}



	@Test
	public void testAND() {
		System.out.println("\ntestAND start");

		final Double[][] table = new Double[][] { { -0.9, -0.9, 0.0 }, { -0.9, 0.9, 0.0 }, { 0.9, -0.9, 0.0 },
				{ 0.9, 0.9, 0.45 } };

		testObjectPatterns.bind(testObjectNetwork, table);
		testObjectNetwork.trainBackpropagation(testObjectPatterns, 1000, 10);

		testObjectPatterns.activatePattern(0);
		testObjectNetwork.recallNetwork();
		outputState();
		assertEquals(0.0, testObjectNeuron31.getOutput(), 0.05);

		testObjectPatterns.activatePattern(1);
		testObjectNetwork.recallNetwork();
		outputState();
		assertEquals(0.0, testObjectNeuron31.getOutput(), 0.05);

		testObjectPatterns.activatePattern(2);
		testObjectNetwork.recallNetwork();
		outputState();
		assertEquals(0.0, testObjectNeuron31.getOutput(), 0.05);

		testObjectPatterns.activatePattern(3);
		testObjectNetwork.recallNetwork();
		outputState();
		assertEquals(0.45, testObjectNeuron31.getOutput(), 0.05);

		System.out.println(String.format("rms=%1.6f", testObjectNetwork.rms(testObjectPatterns)));
		System.out.println("testAND succeeded");
	}

	@Test
	public void testOR() {
		System.out.println("\ntestOR start");

		final Double[][] table = new Double[][] { { -0.9, -0.9, 0.0 }, { -0.9, 0.9, 0.45 }, { 0.9, -0.9, 0.45 },
				{ 0.9, 0.9, 0.45 } };

		testObjectPatterns.bind(testObjectNetwork, table);
		testObjectNetwork.trainBackpropagation(testObjectPatterns, 5000, 10);

		testObjectPatterns.activatePattern(0);
		testObjectNetwork.recallNetwork();
		outputState();
		assertEquals(0.0, testObjectNeuron31.getOutput(), 0.2);

		testObjectPatterns.activatePattern(1);
		testObjectNetwork.recallNetwork();
		outputState();
		assertEquals(0.45, testObjectNeuron31.getOutput(), 0.2);

		testObjectPatterns.activatePattern(2);
		testObjectNetwork.recallNetwork();
		outputState();
		assertEquals(0.45, testObjectNeuron31.getOutput(), 0.2);

		testObjectPatterns.activatePattern(3);
		testObjectNetwork.recallNetwork();
		outputState();
		assertEquals(0.45, testObjectNeuron31.getOutput(), 0.2);

		System.out.println(String.format("rms=%f", testObjectNetwork.rms(testObjectPatterns)));
		System.out.println("testOR succeeded");
	}

	
	public void outputState() {
		System.out.println(testObjectNeuron11.getInput() + "   " + testObjectNeuron12.getInput() + "   "
				+ String.format("%1.3f", testObjectNeuron31.getOutput()) + "   "
				+ String.format("%1.3f", testObjectNeuron31.getOutputExpected()));
	}

}
