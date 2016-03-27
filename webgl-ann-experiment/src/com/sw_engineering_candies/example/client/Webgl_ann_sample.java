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

package com.sw_engineering_candies.example.client;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.i18n.client.NumberFormat;
import com.google.gwt.user.client.Timer;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.RootPanel;
import com.sw_engineering_candies.example.shared.ModelFactory;
import com.sw_engineering_candies.example.shared.Network;

public class Webgl_ann_sample implements EntryPoint {

	// Artificial Neural Network
	private static ModelFactory pattern = new ModelFactory();
	private static Network network = new Network();
	private static int trainingStep = 0;
	private static int activePatternNumber = 0;

	private static final int MAX_STEPS = 100;

	// GUI Elements
	private Timer timerModelUpdate;
	private Timer trainModelUpdate;
	final Button resetButton = new Button("Reset");
	final Button trainButton = new Button("Train");
	final Label messageLabel1 = new Label();
	final Label messageLabel2 = new Label();

	@Override
	public void onModuleLoad() {

		// create neural network
		pattern = new ModelFactory();
		network = pattern.createBindTestPattern();

		messageLabel1.setWidth("280px");
		messageLabel1.setStyleName("text");
		RootPanel.get("infoLabelContainer1").add(messageLabel1);

		messageLabel2.setWidth("280px");
		messageLabel2.setStyleName("text");
		RootPanel.get("infoLabelContainer1").add(messageLabel2);

		trainButton.setWidth("80px");
		RootPanel.get("trainButtonContainer").add(trainButton);
		class MyHandlerTrain implements ClickHandler {
			@Override
			public void onClick(final ClickEvent event) {
				trainModelUpdate.cancel();
				trainModelUpdate.scheduleRepeating(50);

				resetButton.setEnabled(true);
				trainButton.setEnabled(false);

				resetButton.setFocus(true);
			}
		}
		final MyHandlerTrain handlerTrain = new MyHandlerTrain();
		trainButton.addClickHandler(handlerTrain);
		trainButton.setVisible(false);

		resetButton.setWidth("80px");
		RootPanel.get("resetButtonContainer").add(resetButton);
		class MyHandlerReset implements ClickHandler {
			@Override
			public void onClick(final ClickEvent event) {
				trainModelUpdate.cancel();
				network.resetLinks();
				trainButton.setEnabled(true);
				resetButton.setEnabled(false);
				trainButton.setFocus(true);
				trainingStep = 0;
				outputStatusMessage();
			}
		}
		final MyHandlerReset handlerReset = new MyHandlerReset();
		resetButton.addClickHandler(handlerReset);
		resetButton.setVisible(false);

		timerModelUpdate = new Timer() {
			@Override
			public void run() {
				renderNetwork(getModel());
				outputStatusMessage();
				trainButton.setVisible(true);
				resetButton.setVisible(true);
			}
		};

		trainingStep = 0;
		trainModelUpdate = new Timer() {
			@Override
			public void run() {
				final int numberOfPatterns = pattern.getNumberOfPattern();
				network.trainBackpropagation(pattern, numberOfPatterns, 1);
				resetButton.setFocus(true);
				trainingStep++;
				if (trainingStep > MAX_STEPS) {
					this.cancel();
					trainingStep = 0;
					timerModelUpdate.cancel();
					trainModelUpdate.cancel();
					timerModelUpdate.scheduleRepeating(50);
				}
			}

		};
		timerModelUpdate.scheduleRepeating(50);
		trainModelUpdate.scheduleRepeating(50);

		resetButton.setFocus(true);
	}

	public void outputStatusMessage() {

		final StringBuffer message1 = new StringBuffer(
				"mean squared error  = ");
		final double rms = network.rms(pattern);
		message1.append(NumberFormat.getFormat("##.0000").format(rms));
		messageLabel1.setText(message1.toString());

		final StringBuffer message2 = new StringBuffer("training");
		if (trainingStep > 0) {
			message2.append(" running step ").append(trainingStep)
					.append(" / ").append(MAX_STEPS);
		} else {
			message2.append(" stopped");
		}
		messageLabel2.setText(message2.toString());
	}

	private static String getModel() {
		pattern.activatePattern(activePatternNumber);
		if (pattern.getNumberOfPattern() - 1 == activePatternNumber) {
			activePatternNumber = 0;
		} else {
			activePatternNumber++;
		}
		network.recallNetwork();
		return network.toString();
	};

	public static native String renderNetwork(String model) // $codepro.audit.disable
															// disallowNativeMethods
	/*-{
		$wnd.renderData(model);
	}-*/;
}
