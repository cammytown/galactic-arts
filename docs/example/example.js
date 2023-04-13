//import GalacticArts from '../src/index.js';

class Example {
	constructor() {
		this.galacticArts = new GalacticArts();
		this.setupControls();
	}

	setupControls() {
		var saveToPNG = document.getElementById('save-to-png');
		saveToPNG.addEventListener('click', this.saveToPNG.bind(this));

		var rotationSpeedInp = document.getElementById('rotation-speed');
		rotationSpeedInp.addEventListener('input', this.changeRotationSpeed.bind(this));

		var clearCanvasOnDraw = document.getElementById('clear-canvas-on-draw');
		clearCanvasOnDraw.addEventListener('click', this.clearCanvasOnDraw.bind(this));

		//var clearCanvas = document.getElementById('clear-canvas');
		//clearCanvas.addEventListener('click', this.clearCanvas.bind(this));

		var blendModeSelect = document.getElementById('blend-mode');
		blendModeSelect.addEventListener('change', this.changeBlendMode.bind(this));

		var canvasBackgroundInp = document.getElementById('canvas-background');
		canvasBackgroundInp.addEventListener('input', this.changeCanvasBackground.bind(this));
	}

	saveToPNG() {
		this.galacticArts.saveAsPNG();
	}

	changeRotationSpeed(event) {
		this.galacticArts.updateControls({rotationSpeed: event.target.value});
	}

	clearCanvasOnDraw(event) {
		this.galacticArts.updateControls({clearCanvasOnDraw: event.target.checked});
	}

	clearCanvas() {
		this.galacticArts.clearCanvas();
	}

	changeBlendMode(event) {
		this.galacticArts.updateControls({blendMode: event.target.value});
	}

	changeCanvasBackground(event) {
		this.galacticArts.updateControls({canvasBackgroundColor: event.target.value});
	}
}

window.onload = function() {
	var example = new Example();
}
