/* core */
import Config from 'javascript/config';
import Viewport from 'javascript/viewport'

/* utility */
import compileShader from 'javascript/utility/compileShader'
import getAttribLocation from 'javascript/utility/getAttribLocation'
import getUniformLocation from 'javascript/utility/getUniformLocation'

/* shaders */
import vertexShaderSource from 'shaders/vertexShader.glsl'
import shaderSource from 'shaders/fractal.glsl'

/* libraries */
import HashSubscriber from 'hash-subscriber'

var canvas  = document.getElementById("main");

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

canvas.width  = WIDTH;
canvas.height = HEIGHT;

var context = canvas.getContext('webgl');

Viewport.create({
  canvas: canvas,
  getConfig: Config.getConfig,
  setConfig: Config.setConfig
});

/* IGNORING 'ITERATIONS' FOR NOW */
// HashSubscriber.subscribe(['iterations'], () => {
//   Fractal.MAX_ITERATIONS = getConfig().iterations;
//   renderer.render();
// });

var {brightness, x_min, x_max, y_min, y_max} = Config.getConfig()
HashSubscriber.subscribe(['brightness', 'x_min', 'x_max', 'y_min', 'y_max'], () => {
  const config = Config.getConfig()

  x_min = config.x_min
  x_max = config.x_max
  y_min = config.y_min
  y_max = config.y_max

  brightness = config.brightness
});

/**
 * Shaders
 */

var vertexShader = compileShader(vertexShaderSource, context.VERTEX_SHADER, context);
var fragmentShader = compileShader(shaderSource, context.FRAGMENT_SHADER, context);

var program = context.createProgram();
context.attachShader(program, vertexShader);
context.attachShader(program, fragmentShader);
context.linkProgram(program);
context.useProgram(program);

/**
 * Geometry setup
 */

// Set up 4 vertices, which we'll draw as a rectangle
// via 2 triangles
//
//   A---C
//   |  /|
//   | / |
//   |/  |
//   B---D
//
// We order them like so, so that when we draw with
// context.TRIANGLE_STRIP, we draw triangle ABC and BCD.
var vertexData = new Float32Array([
  -1.0,  1.0, // top left
  -1.0, -1.0, // bottom left
   1.0,  1.0, // top right
   1.0, -1.0  // bottom right
]);
var vertexDataBuffer = context.createBuffer();
context.bindBuffer(context.ARRAY_BUFFER, vertexDataBuffer);
context.bufferData(context.ARRAY_BUFFER, vertexData, context.STATIC_DRAW);

/**
 * Attribute setup
 */

// To make the geometry information available in the shader as attributes, we
// need to tell WebGL what the layout of our data in the vertex buffer is.
var positionHandle = getAttribLocation(program, 'position', context);
context.enableVertexAttribArray(positionHandle);
context.vertexAttribPointer(positionHandle,
                       2, // position is a vec2
                       context.FLOAT, // each component is a float
                       context.FALSE, // don't normalize values
                       2 * 4, // two 4 byte float components per vertex
                       0 // offset into each span of vertex data
                       );

/**
 * Draw
 */

function drawFrame() {
  var dataToSendToGPU = new Float32Array(9);

  var time = Date.now();

  dataToSendToGPU[0] = WIDTH;
  dataToSendToGPU[1] = HEIGHT;
  dataToSendToGPU[2] = -0.795 + Math.sin(time / 2000) / 40;
  dataToSendToGPU[3] = 0.2321 + Math.cos(time / 1330) / 40;
  dataToSendToGPU[4] = brightness
  dataToSendToGPU[5] = x_min;
  dataToSendToGPU[6] = x_max;
  dataToSendToGPU[7] = y_min;
  dataToSendToGPU[8] = y_max;

  var dataPointer = getUniformLocation(program, 'data', context);
  context.uniform1fv(dataPointer, dataToSendToGPU);
  context.drawArrays(context.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(drawFrame)
}

requestAnimationFrame(drawFrame)

// Render the 4 vertices specified above (starting at index 0)
// in TRIANGLE_STRIP mode.
