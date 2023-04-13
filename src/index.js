//import { mat4 } from 'gl-matrix';
var mat4 = glMatrix.mat4; //@TODO hack

class GalacticArts {
	canvas = document.getElementById('galactic-canvas');
	gl = this.canvas.getContext('webgl2');

	// Background (last frame) shaders
	backgroundShaderProgram = null;
	backgroundVertexShader = null;
	backgroundFragmentShader = null;
	offscreen = null; //@REVISIT naming
	backgroundQuad = null;
	backgroundPositionAttribute = null;
	backgroundTexCoordAttribute = null;

	// Shaders
	shaderProgram = null;
	vertexShader = null;
	fragmentShader = null;

	// Buffers
	vertexBuffer = null;
	colorBuffer = null;

	// Matrices
	projectionMatrix = null;
	viewMatrix = null;
	modelMatrix = null;
	modelViewMatrix = null;
	modelViewProjectionMatrix = null;


	// Canvas controls
	controls = {
		clearCanvasOnDraw: true,
		rotation: 0,
		rotationSpeed: 0.0,
		blendMode: 'none',
		savingToPNG: false,
	}

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
		//@TODO revisit is this necessary for a local file? use fetch?
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '../data/hygdata_v3.csv', true);
		xhr.onload = function() {
			if(xhr.status === 200) {
				var starRows = xhr.responseText.split('\n');

				// Extract names from and remove first line
				var names = starRows[0].split(',');
				starRows.shift();

				for(var starRow of starRows) {
					// Check if row is empty
					//@REVISIT better check?
					if(starRow === '') {
						continue;
					}

					// Split row's columns into array
					starRow = starRow.split(',');

					//console.log(starRow);

					// Add star to stars array
					//@TODO only extract properties user wants
					var star = {
						id: parseFloat(starRow[names.indexOf('id')]),
						x: parseFloat(starRow[names.indexOf('x')]),
						y: parseFloat(starRow[names.indexOf('y')]),
						z: parseFloat(starRow[names.indexOf('z')]),
						colorIndex: parseFloat(starRow[names.indexOf('ci')]),
						magnitude: parseFloat(starRow[names.indexOf('mag')]),
						absMagnitude: parseFloat(starRow[names.indexOf('absmag')]),
						luminosity: parseFloat(starRow[names.indexOf('lum')]),
						spectralClass: starRow[names.indexOf('spect')],
						constellation: starRow[names.indexOf('con')],
					}

					if(isNaN(star.id)) {
						console.log(starRows.indexOf(starRow));
						console.log(starRow);
						return;
						//continue;
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

				//console.log(this.ranges)
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

		this.compileShaders();
		this.linkShaders();

		this.setupMatrices();
		this.setupBuffers();

		// Use shader program
		this.gl.useProgram(this.shaderProgram);

		// Check for errors
		if(this.gl.getError() != this.gl.NO_ERROR) {
			console.log('Error initializing WebGL');
		}

		this.setupUniforms();

		// Enable depth testing
		this.gl.enable(this.gl.DEPTH_TEST);

		// Near things obscure far things
		this.gl.depthFunc(this.gl.LEQUAL);

		// Set clear color
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

		// Clear the canvas before we start drawing on it.
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// Set viewport
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		// Enable blending
		this.gl.enable(this.gl.BLEND);
	}

	compileShaders() {
		// Set up shaders
		this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(this.vertexShader, `
			attribute vec4 aVertexPosition;
			attribute vec4 aVertexColor;
			varying vec4 vColor;

			uniform mat4 uModelViewMatrix;
			uniform mat4 uProjectionMatrix;

			void main(void) {
				gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
				vColor = aVertexColor;
			}
		`);


		//this.gl.shaderSource(this.vertexShader, `
		//    attribute vec4 aVertexPosition;
		//    attribute vec4 aVertexColor;
		//    varying vec4 vColor;

		//    void main(void) {
		//        gl_Position = aVertexPosition;
		//        vColor = aVertexColor;
		//    }
		//`);

		this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(this.fragmentShader, `
			precision mediump float;
			varying vec4 vColor;

			void main(void) {
				gl_FragColor = vColor;
			}
		`);
		//this.gl.shaderSource(this.fragmentShader, `
		//    precision mediump float;
		//    varying vec4 vColor;

		//    void main(void) {
		//        gl_FragColor = vColor;
		//    }
		//`);

		// Compile shaders
		this.gl.compileShader(this.vertexShader);
		this.gl.compileShader(this.fragmentShader);

		// Background (last frame) shader
		this.offscreen = this.createFramebuffer(this.canvas.width, this.canvas.height);
		this.backgroundQuad = this.createBackgroundQuad();

		// Set up shaders
		this.backgroundVertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(this.backgroundVertexShader, `
			attribute vec2 a_position;
			attribute vec2 a_texCoord;
			varying vec2 v_texCoord;
			void main() {
			  gl_Position = vec4(a_position, 0, 1);
			  v_texCoord = a_texCoord;
			}
		`);

		this.backgroundFragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(this.backgroundFragmentShader, `
			precision mediump float;
			uniform sampler2D u_texture;
			varying vec2 v_texCoord;
			void main() {
			  gl_FragColor = texture2D(u_texture, v_texCoord);
			}
		`);

		// Compile shaders
		this.gl.compileShader(this.backgroundVertexShader);
		this.gl.compileShader(this.backgroundFragmentShader);
	}

	linkShaders() {
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

		// Create background (last frame) shader program
		this.backgroundShaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.backgroundShaderProgram, this.backgroundVertexShader);
		this.gl.attachShader(this.backgroundShaderProgram, this.backgroundFragmentShader);
		this.gl.linkProgram(this.backgroundShaderProgram);

		// Check if shader program linked successfully
		if(!this.gl.getProgramParameter(this.backgroundShaderProgram, this.gl.LINK_STATUS)) {
			throw new Error(
				'Unable to initialize the background shader program: '
				+ this.gl.getProgramInfoLog(this.backgroundShaderProgram)
			);
		}

		// Get attribute locations for the background shader program
		this.backgroundPositionAttribute = this.gl.getAttribLocation(
			this.backgroundShaderProgram,
			"a_position"
		);

		this.backgroundTexCoordAttribute = this.gl.getAttribLocation(
			this.backgroundShaderProgram,
			"a_texCoord"
		);
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

	setupBuffers() {
		// Set up vertex buffer
		this.vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

		// Add stars to vertex buffer
		var vertices = [];
		for(var star of this.stars) {
			var scale = 0.22;

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
	}

	/**
	 * Create a framebuffer for drawing frame to texture.
	 * @param {number} width - Width of framebuffer.
	 * @param {number} height - Height of framebuffer.
	 * @returns {WebGLFramebuffer} Framebuffer.
	 */
	createFramebuffer(width, height) {
		var gl = this.gl;

		const framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);

		return { framebuffer, texture };
	}

	/**
	 * Create a quad for drawing to the screen.
	 * @returns {WebGLBuffer} Buffer.
	 */
	createBackgroundQuad() {
		var gl = this.gl;

		const vertices = new Float32Array([
			-1, -1, 0, 0,
			1, -1, 1, 0,
			-1, 1, 0, 1,
			1, 1, 1, 1,
		]);

		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		return buffer;
	}

	/**
	 * Draw the previous frame.
	 * @returns {void}
	 */
	drawLastFrame() {
		var gl = this.gl;

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.useProgram(this.backgroundShaderProgram);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundQuad);
		gl.vertexAttribPointer(this.backgroundPositionAttribute, 2, gl.FLOAT, false, 16, 0);
		gl.vertexAttribPointer(this.backgroundTexCoordAttribute, 2, gl.FLOAT, false, 16, 8);
		gl.enableVertexAttribArray(this.backgroundPositionAttribute);
		gl.enableVertexAttribArray(this.backgroundTexCoordAttribute);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.offscreen.texture);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	drawStars() {
		var gl = this.gl;

		// Set up shader program
		gl.useProgram(this.shaderProgram);

		// Set up vertex buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.vertexAttribPointer(this.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

		// Draw the scene
		this.gl.drawArrays(this.gl.POINTS, 0, this.stars.length);
	}

	/**
	 * Draw the scene.
	 */
	draw() {
		var gl = this.gl;

		// Disable blending
		gl.disable(gl.BLEND);

		// Clear the canvas
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Enable blending
		gl.enable(gl.BLEND);

		if(!this.controls.clearCanvasOnDraw) {
			//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			//gl.clear(gl.DEPTH_BUFFER_BIT);
			this.drawLastFrame();

			// Bind the framebuffer
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.offscreen.framebuffer);
		}

		this.drawStars();

		if(!this.controls.clearCanvasOnDraw) {
			// Unbind the framebuffer
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}

		if(this.controls.savingToPNG) {
			this.outputToPNG();
			this.controls.savingToPNG = false;
		}

		// Update rotation
		this.updateRotation();

		// Request next frame
		requestAnimationFrame(this.draw.bind(this));

		// Update stats
		//this.stats.update();
	}


	/**
	 * Update rotation.
	 * @private
	 * @returns {void}
	 */
	updateRotation() {
		// Update rotation
		this.controls.rotation += this.controls.rotationSpeed;

		// Update model-view matrix
		this.modelViewMatrix = mat4.create();
		mat4.translate(
			this.modelViewMatrix,
			this.modelViewMatrix,
			[0.0, 0.0, -20.0]
		);
		mat4.rotate(
			this.modelViewMatrix,
			this.modelViewMatrix,
			this.controls.rotation,
			[0, 1, 0]
		);
		mat4.rotate(
			this.modelViewMatrix,
			this.modelViewMatrix,
			this.controls.rotation,
			[1, 0, 0]
		);
		mat4.rotate(
			this.modelViewMatrix,
			this.modelViewMatrix,
			this.controls.rotation,
			[0, 0, 1]
		);
		this.gl.uniformMatrix4fv(
			this.modelViewMatrixUniform,
			false,
			this.modelViewMatrix
		);

		// Update model-view-projection matrix
		this.modelViewProjectionMatrix = mat4.create();
		mat4.multiply(
			this.modelViewProjectionMatrix,
			this.projectionMatrix,
			this.modelViewMatrix
		);
		this.gl.uniformMatrix4fv(
			this.modelViewProjectionMatrixUniform,
			false,
			this.modelViewProjectionMatrix
		);
	}

	/**
	 * Update a control or controls.
	 * @param {Object} controls - The controls.
	 * @returns {void}
	 */
	updateControls(controls) {
		// Assign supplied values to controls
		for(var key in controls) {
			// Check if the control exists
			if(this.controls.hasOwnProperty(key)) {
				// If value is a number, convert it
				if(typeof this.controls[key] === 'number') {
					this.controls[key] = parseFloat(controls[key]);
				} else if(typeof this.controls[key] === 'string') {
					this.controls[key] = controls[key].toLowerCase();
				} else if(typeof this.controls[key] === 'boolean') {
					this.controls[key] = !!controls[key];
				} else if(typeof this.controls[key] === 'object') {
					this.controls[key] = JSON.parse(JSON.stringify(controls[key]));
				} else {
					console.warn('Unknown control type: ' + key);
					//this.controls[key] = controls[key];
				}
			} else {
				console.warn('Unknown control: ' + key);
			}

			// Handle special cases
			switch(key) {
				case 'clearCanvasOnDraw': {
					if(controls[key]) {
						// Bind the framebuffer
						this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.offscreen.framebuffer);

						// Clear the canvas
						this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

						// Unbind the framebuffer
						this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
					}
				} break;

				case 'blendMode': {
					this.gl.enable(this.gl.BLEND);
					switch(this.controls.blendMode) {
						case 'additive':
							this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
							break;
						case 'subtractive':
							this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE_MINUS_SRC_ALPHA);
							break;
						case 'multiply':
							this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ONE_MINUS_SRC_ALPHA);
							break;
						case 'none':
							this.gl.disable(this.gl.BLEND);
							break;
						case 'normal':
							this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
							break;
						default:
							console.warn('Unknown blend mode: ' + this.controls.blendMode);
							break;
					}
				} break;

				case 'canvasBackgroundColor': {
					this.canvas.style.backgroundColor = this.controls.canvasBackgroundColor;
					//@TODO change clear color
				} break;

				default: {
					console.warn('Unknown control: ' + key);
				} break;
			}
		}
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

		console.assert(color.a >= 0.0 && color.a <= 1.0, 'alpha out of range: ' + color.a);
		if(isNaN(color.a)) {
			console.log(star);
			return {r: 0.0, g: 0.0, b: 0.0, a: 0.0};
		}


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
	}

	saveAsPNG() {
		this.controls.savingToPNG = true;
	}

	/**
	 * Output current canvas to PNG.
	 * @private
	 * @returns {void}
	 */
	//outputToPNG() {
	//    var gl = this.gl;

	//    // Get WebGL canvas size
	//    var width = gl.drawingBufferWidth;
	//    var height = gl.drawingBufferHeight;

	//    // Read pixels from WebGL canvas
	//    var pixels = new Uint8Array(width * height * 4);
	//    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	//    // Create a 2D canvas and get its context
	//    var canvas2D = document.createElement('canvas');
	//    canvas2D.width = width;
	//    canvas2D.height = height;
	//    var ctx = canvas2D.getContext('2d');

	//    // Put the read pixels into a 2D canvas
	//    var imageData = ctx.createImageData(width, height);
	//    imageData.data.set(pixels);
	//    ctx.putImageData(imageData, 0, 0);

	//    // Flip the image vertically since WebGL has a different coordinate system
	//    ctx.scale(1, -1);
	//    ctx.drawImage(canvas2D, 0, -height);

	//    // Get 2D canvas data
	//    var data = canvas2D.toDataURL('image/png');

	//    // Create image
	//    var image = new Image();
	//    image.src = data;

	//    // Create link
	//    var link = document.createElement('a');
	//    link.href = image.src;

	//    //@TODO build filename based on controls
	//    link.download = 'image.png';

	//    // Click link
	//    link.click();
	//}

	outputToPNG() {
		// Get canvas data
		var data = this.canvas.toDataURL('image/png');

		// Create image
		var image = new Image();
		image.src = data;

		// Create link
		var link = document.createElement('a');
		link.href = image.src;

		//@TODO build filename based on controls
		link.download = 'image.png';

		// Click link
		link.click();
	}
}

//export default GalacticArts;
