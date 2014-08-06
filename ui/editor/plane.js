var glslify = require('glslify');

var createShader = glslify({
  vertex: './shaders/plane.vert',
  fragment: './shaders/plane.frag'
});

var createBuffer = require('gl-buffer');
var createTexture = require('gl-texture2d');
// TODO: texture
module.exports = Plane;

function Plane(gl, img) {
  this.planeArray = new Float32Array(18);
  this.items = 6;

  this.gl = gl;
  this.program = createShader(gl);
  gl.program.bind();
  gl.program.attributes.position.location = 0;
  gl.program.attributes.aNormal.location = 1


  this.planeBuffer = createBuffer(gl, this.planeArray);
  this.planeNormals = createBuffer(gl, new Float32Array([
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
  ]));

  // Texturing
  this.texture = createTexture(gl, img);
  this.texture.wrap = gl.REPEAT;
}


Plane.prototype.updateObject = function(object) {
  this.object = object;

  var r = object.rect;

  var z = r[0][2];

  this.planeArray[0] = r[0][0] - 10;
  this.planeArray[1] = r[1][1] + 10;
  this.planeArray[2] = z;

  this.planeArray[3] = r[0][0] - 10;
  this.planeArray[4] = r[0][1] - 10;
  this.planeArray[5] = z;

  this.planeArray[6] = r[1][0] + 10;
  this.planeArray[7] = r[0][1] - 10;
  this.planeArray[8] = z;

  this.planeArray[9]  = r[1][0] + 10;
  this.planeArray[10] = r[0][1] - 10;
  this.planeArray[11] = z;

  this.planeArray[12] = r[1][0] + 10;
  this.planeArray[13] = r[1][1] + 10;
  this.planeArray[14] = z;

  this.planeArray[15] = r[0][0] - 10;
  this.planeArray[16] = r[1][1] + 10;
  this.planeArray[17] = z;
  this.planeBuffer.update(this.planeArray);
};

Plane.prototype.render = function(setup) {
  this.program.bind();
  this.planeBuffer.bind();


  if (typeof setup === 'function') {
    setup(this.program);
  }

  // TODO: this is causing some issues.
  // this.planeNormals.bind();
  // this.program.attributes.aNormal.pointer();

  this.program.uniforms.texture = this.texture.bind();

  this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
}
