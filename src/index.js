//import '../node_modules/gl-matrix/gl-matrix.js';
//import { mat4 } from 'gl-matrix';
//import '../node_modules/gl-matrix/mat4.js';

var mat4 = glMatrix.mat4; //@TODO hack

class GalacticArts {
	canvas = document.getElementById('galactic-canvas');
	gl = this.canvas.getContext('webgl2');

	// Shaders
	shaderProgram = null;
	vertexShader = null;
	fragmentShader = null;

	// Buffers
	vertexBuffer = null;
	colorBuffer = null;

	// Matrices
	//projectionMatrix = null;
	//viewMatrix = null;
	//modelMatrix = null;
	//modelViewMatrix = null;
	//modelViewProjectionMatrix = null;

	// Camera
	rotation = 0;

	// Stars
	stars = [];
	
	// Value ranges
	ranges = {};

	constructor() {
		// Load HYG star data
		this.loadStars();

		// Initialize GL
		//this.initializeGL();

		// Draw scene
		//this.draw();
	}

	loadStars() {
		// Load HYG star data
		// http://www.astronexus.com/hyg

		// Load stars
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '../data/hygdata_v3.csv', true);
		xhr.onload = function() {
			if(xhr.status === 200) {
				var stars = xhr.responseText.split('\n');

				// Extract names from and remove first line
				var names = stars[0].split(',');
				stars.shift();

				for(var star of stars) {
					star = star.split(',');

					// Add star to stars array
					//@TODO only extract properties user wants
					var star = {
						id: parseFloat(star[names.indexOf('id')]),
						x: parseFloat(star[names.indexOf('x')]),
						y: parseFloat(star[names.indexOf('y')]),
						z: parseFloat(star[names.indexOf('z')]),
						colorIndex: parseFloat(star[names.indexOf('ci')]),
						magnitude: parseFloat(star[names.indexOf('mag')]),
						absMagnitude: parseFloat(star[names.indexOf('absmag')]),
						luminosity: parseFloat(star[names.indexOf('lum')]),
						spectralClass: star[names.indexOf('spect')],
						constellation: star[names.indexOf('con')],
					}

					this.stars.push(star);

					// Keep track of value ranges
					for(var prop in star) {
						if(!this.ranges.hasOwnProperty(prop)) {
							this.ranges[prop] = {
								min: star[prop],
								max: star[prop]
							};
						} else {
							if(star[prop] < this.ranges[prop].min) {
								this.ranges[prop].min = star[prop];
							} else if(star[prop] > this.ranges[prop].max) {
								this.ranges[prop].max = star[prop];
							}
						}
					}
				}

				console.log(this.ranges)

				//this.stars = this.stars.slice(0, 10);
				//console.log(stars.length);

				this.initializeGL();
				this.draw();
			} else {
				console.error('Error loading stars');
			}
		}.bind(this);
		xhr.send();

		//// Load star names
		//var xhr = new XMLHttpRequest();
		//xhr.open('GET', 'data/hygdata_v3_names.csv', true);
	}

	initializeGL() {
		// Check if WebGL2 is supported
		if(!this.gl) {
			// Fallback to WebGL 1
			this.gl = this.canvas.getContext('webgl');
		}

		// Check if WebGL is supported
		if(!this.gl) {
			throw new Error('WebGL is not supported');
		}

		// Set clear color
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

		// Enable depth testing
		this.gl.enable(this.gl.DEPTH_TEST);

		// Near things obscure far things
		this.gl.depthFunc(this.gl.LEQUAL);

		// Clear the canvas before we start drawing on it.
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// Set viewport
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		//this.setupMatrices();
		this.setupShaders();
		this.setupBuffers();
		this.setupAttributes();
		//this.setupUniforms();

		// Use shader program
		this.gl.useProgram(this.shaderProgram);

		// Check for errors
		if(this.gl.getError() != this.gl.NO_ERROR) {
			console.log('Error initializing WebGL');
		}
	}

	setupMatrices() {
		// Set projection matrix
		this.projectionMatrix = mat4.create();
		mat4.perspective(
			this.projectionMatrix,
			45,
			this.canvas.width / this.canvas.height,
			0.1,
			100.0
		);

		// Set view matrix
		this.viewMatrix = mat4.create();
		mat4.translate(this.viewMatrix, this.viewMatrix, [0, 0, -10]);

		// Set model matrix
		this.modelMatrix = mat4.create();

		// Set model-view matrix
		this.modelViewMatrix = mat4.create();
		mat4.multiply(this.modelViewMatrix, this.viewMatrix, this.modelMatrix);

		// Set model-view-projection matrix
		this.modelViewProjectionMatrix = mat4.create();
		mat4.multiply(this.modelViewProjectionMatrix, this.projectionMatrix, this.modelViewMatrix);

		// Set normal matrix
		this.normalMatrix = mat4.create();
		mat4.invert(this.normalMatrix, this.modelViewMatrix);
		mat4.transpose(this.normalMatrix, this.normalMatrix);
	}

	setupShaders() {
		// Set up shaders
		this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(this.vertexShader, `
			attribute vec4 aVertexPosition;
			attribute vec4 aVertexColor;
			varying vec4 vColor;

			void main(void) {
				gl_Position = aVertexPosition;
				vColor = aVertexColor;
			}
		`);

		this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(this.fragmentShader, `
			precision mediump float;
			varying vec4 vColor;

			void main(void) {
				gl_FragColor = vColor;
			}
		`);

		// Compile shaders
		this.gl.compileShader(this.vertexShader);
		this.gl.compileShader(this.fragmentShader);

		// Create shader program
		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, this.vertexShader);
		this.gl.attachShader(this.shaderProgram, this.fragmentShader);
		this.gl.linkProgram(this.shaderProgram);

		// Check if shader program linked successfully
		if(!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
			throw new Error(
				'Unable to initialize the shader program: '
				+ this.gl.getProgramInfoLog(this.shaderProgram)
			);
		}
	}

	setupBuffers() {
		// Set up vertex buffer
		this.vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

		// Add stars to vertex buffer
		var vertices = [];
		for(var star of this.stars) {
			var scale = 0.0022;

			// Add star to vertex buffer
			vertices.push(star.x * scale, star.y * scale, star.z * scale);
		}
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(vertices),
			this.gl.STATIC_DRAW
		);
		// Set up vertex position attribute
		this.vertexPositionAttribute = this.gl.getAttribLocation(
			this.shaderProgram,
			'aVertexPosition'
		);
		this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
		this.gl.vertexAttribPointer(
			this.vertexPositionAttribute,
			3,
			this.gl.FLOAT,
			false,
			0,
			0
		);

		// Set up color buffer
		this.colorBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);

		// Add colors to color buffer
		var colors = [];
		for(var star of this.stars) {
			//// Convert color index to RGB
			//var color = this.bvToRGB(star.colorIndex);

			// Calculate star color based on properties
			var color = this.calculateStarColor(star);

			// Add color to color buffer
			colors.push(color.r, color.g, color.b, color.a);
		}
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(colors),
			this.gl.STATIC_DRAW
		);

		// Set up vertex color attribute
		this.vertexColorAttribute = this.gl.getAttribLocation(
			this.shaderProgram,
			'aVertexColor'
		);
		this.gl.enableVertexAttribArray(this.vertexColorAttribute);
		this.gl.vertexAttribPointer(
			this.vertexColorAttribute,
			4,
			this.gl.FLOAT,
			false,
			0,
			0
		);

		//// Set up normal buffer
		//this.normalBuffer = this.gl.createBuffer();
		//this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);

		//// Add normals to normal buffer
		//var normals = [];
		//for(var star of this.stars) {
		//    // Add normal to normal buffer
		//    normals.push(star.nx, star.ny, star.nz);
		//}
		//this.gl.bufferData(
		//    this.gl.ARRAY_BUFFER,
		//    new Float32Array(normals),
		//    this.gl.STATIC_DRAW
		//);
	}

	setupAttributes() {
	}

	setupUniforms() {
		// Set up model-view matrix uniform
		this.modelViewMatrixUniform = this.gl.getUniformLocation(
			this.shaderProgram,
			'uModelViewMatrix'
		);
		this.gl.uniformMatrix4fv(
			this.modelViewMatrixUniform,
			false,
			this.modelViewMatrix
		);

		// Set up projection matrix uniform
		this.projectionMatrixUniform = this.gl.getUniformLocation(
			this.shaderProgram,
			'uProjectionMatrix'
		);
		this.gl.uniformMatrix4fv(
			this.projectionMatrixUniform,
			false,
			this.projectionMatrix
		);

		// Set up model-view-projection matrix uniform
		this.modelViewProjectionMatrixUniform = this.gl.getUniformLocation(
			this.shaderProgram,
			'uModelViewProjectionMatrix'
		);
		this.gl.uniformMatrix4fv(
			this.modelViewProjectionMatrixUniform,
			false,
			this.modelViewProjectionMatrix
		);

		// Set up normal matrix uniform
		this.normalMatrixUniform = this.gl.getUniformLocation(
			this.shaderProgram,
			'uNormalMatrix'
		);
		this.gl.uniformMatrix4fv(
			this.normalMatrixUniform,
			false,
			this.normalMatrix
		);

		// Set up lighting
		//this.ambientLight = [0.2, 0.2, 0.2];
		//this.directionalLightColor = [1.0, 1.0, 1.0];
		//this.directionalVector = [0.85, 0.8, 0.75];

		// Set up ambient light uniform
		this.ambientLightUniform = this.gl.getUniformLocation(
			this.shaderProgram,
			'uAmbientLight'
		);
		this.gl.uniform3fv(this.ambientLightUniform, this.ambientLight);

		// Set up directional light color uniform
		this.directionalLightColorUniform = this.gl.getUniformLocation(
			this.shaderProgram,
			'uDirectionalLightColor'
		);
		this.gl.uniform3fv(
			this.directionalLightColorUniform,
			this.directionalLightColor
		);

		// Set up directional vector uniform
		this.directionalVectorUniform = this.gl.getUniformLocation(
			this.shaderProgram,
			'uDirectionalVector'
		);
		this.gl.uniform3fv(
			this.directionalVectorUniform,
			this.directionalVector
		);
	}

	/**
	 * Draw the scene.
	 */
	draw() {
		// Clear the canvas
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// Update rotation
		//this.updateRotation();

		// Draw the scene
		this.gl.drawArrays(this.gl.POINTS, 0, this.stars.length);
	}

	updateRotation() {
		// Update rotation
		this.rotation += 0.01;

		// Update model-view matrix
		this.modelViewMatrix = mat4.create();
		mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0.0, 0.0, -20.0]);
		mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.rotation, [0, 1, 0]);
		mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.rotation, [1, 0, 0]);
		mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.rotation, [0, 0, 1]);
		this.gl.uniformMatrix4fv(this.modelViewMatrixUniform, false, this.modelViewMatrix);

		// Update model-view-projection matrix
		this.modelViewProjectionMatrix = mat4.create();
		mat4.multiply(this.modelViewProjectionMatrix, this.projectionMatrix, this.modelViewMatrix);
		this.gl.uniformMatrix4fv(this.modelViewProjectionMatrixUniform, false, this.modelViewProjectionMatrix);
	}

	/**
	 * Calculate a star's color based on its B-V color index and magnitude or luminosity.
	 *
	 * @param {Object} star - The star.
	 * @returns {number[]} The star's color.
	 */
	calculateStarColor(star) {
		// Calculate star color
		var color = this.bvToRGB(star.colorIndex);

		// Offset to keep working values >= 0
		var offsetMagnitude = star.absMagnitude - this.ranges.absMagnitude.min;
		var offsetMax = this.ranges.absMagnitude.max - this.ranges.absMagnitude.min;

		// Calculate alpha based on relative absMagnitude
		var alpha = offsetMagnitude / offsetMax;
		color.a = alpha;

		console.assert(color.a >= 0.0 && color.a <= 1.0, 'alpha out of range');

		//var magnitudeFactor = Math.pow(2.0, magnitude / 2.5);
		//color.r *= magnitudeFactor;

		// Return color
		return color;
	}

	/**
	 * Convert from B-V color index to RGB color.
	 *
	 * @param {number} colorIndex - The star color index.
	 * @returns {number[]} The RGB color.
	 */
	bvToRGB(colorIndex) {
		// Convert from B-V color index to RGB color
		var r = 0;
		var g = 0;
		var b = 0;

		if(colorIndex < 0.0) {
			r = 1.0 + colorIndex;
			g = 0.0;
			b = -(colorIndex / this.ranges.colorIndex.min);
		} else {
			//@TODO revisit how we handle ranges; goes from like -1 to 5 or something
			r = (colorIndex / this.ranges.colorIndex.max);
			//r = colorIndex);
			g = 0.0;
			b = 1.0 - colorIndex;
		}

		// Clamp color values
		r = Math.max(0.0, Math.min(1.0, r));
		g = Math.max(0.0, Math.min(1.0, g));
		b = Math.max(0.0, Math.min(1.0, b));

		// Fallback to zero if NaN
		//@TODO some stars do not have a color index; probably the issue; revisit
		if(isNaN(r)) {
			r = 0.0;
		}
		if(isNaN(g)) {
			g = 0.0;
		}
		if(isNaN(b)) {
			b = 0.0;
		}

		// Return RGB color
		return { r, g, b, a: 1.0 };

		//// ChatGPT-4 generated:
		//// Clamping the input color index to a valid range
		//bv = Math.max(-0.4, Math.min(2.0, bv));

		//// Linearly mapping color index to a range between 0 and 1
		//const t = (bv + 0.4) / 2.4;

		//// Calculate the RGB values
		//let r = t < 0.5 ? 1 : 2 - 2 * t;
		//let g = t < 0.5 ? 2 * t : 2 * (1 - t);
		//let b = t < 0.5 ? 2 * (0.5 - t) : 0;

		//// Convert the RGB values to 8-bit integers
		//r = Math.round(r * 255);
		//g = Math.round(g * 255);
		//b = Math.round(b * 255);
	}
}

//export default GalacticArts;
