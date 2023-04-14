//import GalacticArts from '../src/index.js';

class Example {
	// The controls that are saved in the URL
	urlControls = [
		'clearCanvasOnDraw',
		'blendMode',
		'canvasBackground',
		'rotation',
		'rotationSpeed',
		'translation',
		'translationSpeed',
		'nearPlane',
		'farPlane',
		'fov',
		'starPosScale',
		//'starColor',
		//'starSize',
	];

	constructor() {
		this.galacticArts = new GalacticArts({
			hygDataPath: '../../data/hygdata_v3.csv',
			//hygDataPath: 'https://raw.githubusercontent.com/astronexus/HYG-Database/master/hygdata_v3.csv',
		});
		this.setupControls();
		this.controlsFromURL();
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

	updateControls(controls) {
		this.galacticArts.updateControls(controls);
		this.controlsToURL();
	}

	changeRotation(event) {
		var rotationXInp = document.getElementById('rotation-x');
		var rotationYInp = document.getElementById('rotation-y');
		var rotationZInp = document.getElementById('rotation-z');

		this.updateControls({
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
		this.updateControls({
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
		this.updateControls({
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
		this.updateControls({
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
		this.updateControls({
			starPosScale: {
				x: parseFloat(starPosScaleXInp.value),
				y: parseFloat(starPosScaleYInp.value),
				z: parseFloat(starPosScaleZInp.value)
			}
		});
	}

	changeNearPlane(event) {
		this.updateControls({
			nearPlane: parseFloat(event.target.value)
		});
	}

	changeFarPlane(event) {
		//console.log(event.target.value);
		this.updateControls({
			farPlane: parseFloat(event.target.value)
		});
	}

	changeFOV(event) {
		this.updateControls({
			fov: parseFloat(event.target.value)
		});
	}


	//changeScale(event) {
	//    var scaleXInp = document.getElementById('scale-x');
	//    var scaleYInp = document.getElementById('scale-y');
	//    var scaleZInp = document.getElementById('scale-z');
	//    this.updateControls({
	//        scale: {
	//            x: parseFloat(scaleXInp.value),
	//            y: parseFloat(scaleYInp.value),
	//            z: parseFloat(scaleZInp.value)
	//        }
	//    });
	//}

	clearCanvasOnDraw(event) {
		this.updateControls({clearCanvasOnDraw: event.target.checked});
	}

	clearCanvas() {
		this.galacticArts.clearCanvas();
	}

	changeBlendMode(event) {
		this.updateControls({blendMode: event.target.value});
	}

	changeCanvasBackground(event) {
		this.updateControls({canvasBackgroundColor: event.target.value});
	}


	extractControlType(key) {
		if(key.indexOf('[') > -1) {
			var type = key.split('[')[1].split(']')[0];
		}
	}

	controlsFromURL() {
		// Get the URL
		var url = window.location.href.split('#')[0];


		// Get the URL params
		var params = window.location.href.split('#')[1];

		// Decode the URL params
		params = decodeURIComponent(params);

		if (params) {
			params = params.split('&');
		} else {
			params = [];
		}

		// Make a copy of controls object
		var controls = JSON.parse(JSON.stringify(this.galacticArts.controls));

		// Loop through the URL params and update the controls
		for (var i = 0; i < params.length; i++) {
			var param = params[i].split('=');
			var key = param[0];
			var value = param[1];

			// Convert the value to the correct type
			//@REVISIT
			if (value === 'true') {
				value = true;
			} else if (value === 'false') {
				value = false;
			} else if (!isNaN(value)) {
				value = parseFloat(value);
			}

			if (key.indexOf('[') > -1) {
				//var type = extractControlType(key);
				var subKey = key.split('[')[1].split(']')[0];
				key = key.split('[')[0];
				controls[key][subKey] = value;
			} else {
				controls[key] = value;
			}
		}

		// Update the controls
		this.galacticArts.updateControls(controls);
	}

	controlsToURL() {
		// Loop through controls and add them to the URL
		var controls = this.galacticArts.controls;
		var url = window.location.href.split('#')[0];
		var params = [];
		for (var key of this.urlControls) {
			var value = controls[key];
			if (typeof value === 'object') {
				for (var subKey in value) {
					params.push(key + '[' + subKey + ']=' + value[subKey]);
				}
			} else {
				params.push(key + '=' + value);
			}
		}
		url += '#' + params.join('&');

		// Encode the URL
		url = encodeURI(url);

		console.log(url);

		// Update the URL
		window.history.pushState({}, '', url);
	}
}

window.onload = function() {
	var example = new Example();
}
