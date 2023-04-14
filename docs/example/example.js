//import GalacticArts from '../src/index.js';

class Example {
	constructor() {
		this.galacticArts = new GalacticArts();
		this.setupControls();
	}

	setupControls() {
		var saveToPNG = document.getElementById('save-to-png');
		saveToPNG.addEventListener('click', this.saveToPNG.bind(this));

		var clearCanvasOnDraw = document.getElementById('clear-canvas-on-draw');
		clearCanvasOnDraw.addEventListener('click', this.clearCanvasOnDraw.bind(this));

		//var clearCanvas = document.getElementById('clear-canvas');
		//clearCanvas.addEventListener('click', this.clearCanvas.bind(this));

		var blendModeSelect = document.getElementById('blend-mode');
		blendModeSelect.addEventListener('change', this.changeBlendMode.bind(this));

		var canvasBackgroundInp = document.getElementById('canvas-background');
		canvasBackgroundInp.addEventListener('input', this.changeCanvasBackground.bind(this));

		// Camera

		var rotationXInp = document.getElementById('rotation-x');
		rotationXInp.addEventListener('input', this.changeRotation.bind(this));
		var rotationYInp = document.getElementById('rotation-y');
		rotationYInp.addEventListener('input', this.changeRotation.bind(this));
		var rotationZInp = document.getElementById('rotation-z');
		rotationZInp.addEventListener('input', this.changeRotation.bind(this));

		var rotationSpeedXInp = document.getElementById('rotation-speed-x');
		rotationSpeedXInp.addEventListener('input', this.changeRotationSpeed.bind(this));
		var rotationSpeedYInp = document.getElementById('rotation-speed-y');
		rotationSpeedYInp.addEventListener('input', this.changeRotationSpeed.bind(this));
		var rotationSpeedZInp = document.getElementById('rotation-speed-z');
		rotationSpeedZInp.addEventListener('input', this.changeRotationSpeed.bind(this));

		var translationXInp = document.getElementById('translation-x');
		translationXInp.addEventListener('input', this.changeTranslation.bind(this));
		var translationYInp = document.getElementById('translation-y');
		translationYInp.addEventListener('input', this.changeTranslation.bind(this));
		var translationZInp = document.getElementById('translation-z');
		translationZInp.addEventListener('input', this.changeTranslation.bind(this));

		var translationSpeedXInp = document.getElementById('translation-speed-x');
		translationSpeedXInp.addEventListener('input', this.changeTranslationSpeed.bind(this));
		var translationSpeedYInp = document.getElementById('translation-speed-y');
		translationSpeedYInp.addEventListener('input', this.changeTranslationSpeed.bind(this));
		var translationSpeedZInp = document.getElementById('translation-speed-z');
		translationSpeedZInp.addEventListener('input', this.changeTranslationSpeed.bind(this));

		// Clipping planes
		var nearPlaneInp = document.getElementById('near-plane');
		nearPlaneInp.addEventListener('input', this.changeNearPlane.bind(this));
		var farPlaneInp = document.getElementById('far-plane');
		farPlaneInp.addEventListener('input', this.changeFarPlane.bind(this));

		// FOV
		var fovInp = document.getElementById('fov');
		fovInp.addEventListener('input', this.changeFOV.bind(this));

		// Stars

		var starPosScaleXInp = document.getElementById('star-pos-scale-x');
		starPosScaleXInp.addEventListener('input', this.changeStarPosScale.bind(this));
		var starPosScaleYInp = document.getElementById('star-pos-scale-y');
		starPosScaleYInp.addEventListener('input', this.changeStarPosScale.bind(this));
		var starPosScaleZInp = document.getElementById('star-pos-scale-z');
		starPosScaleZInp.addEventListener('input', this.changeStarPosScale.bind(this));

		//var scaleXInp = document.getElementById('scale-x');
		//scaleXInp.addEventListener('input', this.changeScale.bind(this));
		//var scaleYInp = document.getElementById('scale-y');
		//scaleYInp.addEventListener('input', this.changeScale.bind(this));
		//var scaleZInp = document.getElementById('scale-z');
		//scaleZInp.addEventListener('input', this.changeScale.bind(this));

	}

	saveToPNG() {
		this.galacticArts.saveAsPNG();
	}

	changeRotation(event) {
		var rotationXInp = document.getElementById('rotation-x');
		var rotationYInp = document.getElementById('rotation-y');
		var rotationZInp = document.getElementById('rotation-z');

		this.galacticArts.updateControls({
			rotation: {
				x: parseFloat(rotationXInp.value),
				y: parseFloat(rotationYInp.value),
				z: parseFloat(rotationZInp.value)
			}
		});
	}

	changeRotationSpeed(event) {
		var rotationSpeedXInp = document.getElementById('rotation-speed-x');
		var rotationSpeedYInp = document.getElementById('rotation-speed-y');
		var rotationSpeedZInp = document.getElementById('rotation-speed-z');
		this.galacticArts.updateControls({
			rotationSpeed: {
				x: parseFloat(rotationSpeedXInp.value),
				y: parseFloat(rotationSpeedYInp.value),
				z: parseFloat(rotationSpeedZInp.value)
			}
		});
	}

	changeTranslation(event) {
		var translationXInp = document.getElementById('translation-x');
		var translationYInp = document.getElementById('translation-y');
		var translationZInp = document.getElementById('translation-z');
		this.galacticArts.updateControls({
			translation: {
				x: parseFloat(translationXInp.value),
				y: parseFloat(translationYInp.value),
				z: parseFloat(translationZInp.value)
			}
		});
	}

	changeTranslationSpeed(event) {
		var translationSpeedXInp = document.getElementById('translation-speed-x');
		var translationSpeedYInp = document.getElementById('translation-speed-y');
		var translationSpeedZInp = document.getElementById('translation-speed-z');
		this.galacticArts.updateControls({
			translationSpeed: {
				x: parseFloat(translationSpeedXInp.value),
				y: parseFloat(translationSpeedYInp.value),
				z: parseFloat(translationSpeedZInp.value)
			}
		});
	}

	changeStarPosScale(event) {
		var starPosScaleXInp = document.getElementById('star-pos-scale-x');
		var starPosScaleYInp = document.getElementById('star-pos-scale-y');
		var starPosScaleZInp = document.getElementById('star-pos-scale-z');
		this.galacticArts.updateControls({
			starPosScale: {
				x: parseFloat(starPosScaleXInp.value),
				y: parseFloat(starPosScaleYInp.value),
				z: parseFloat(starPosScaleZInp.value)
			}
		});
	}

	changeNearPlane(event) {
		this.galacticArts.updateControls({
			nearPlane: parseFloat(event.target.value)
		});
	}

	changeFarPlane(event) {
		//console.log(event.target.value);
		this.galacticArts.updateControls({
			farPlane: parseFloat(event.target.value)
		});
	}

	changeFOV(event) {
		this.galacticArts.updateControls({
			fov: parseFloat(event.target.value)
		});
	}


	//changeScale(event) {
	//    var scaleXInp = document.getElementById('scale-x');
	//    var scaleYInp = document.getElementById('scale-y');
	//    var scaleZInp = document.getElementById('scale-z');
	//    this.galacticArts.updateControls({
	//        scale: {
	//            x: parseFloat(scaleXInp.value),
	//            y: parseFloat(scaleYInp.value),
	//            z: parseFloat(scaleZInp.value)
	//        }
	//    });
	//}

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
