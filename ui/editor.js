var qel = require('./qel');
var glnow = require('gl-now');
var glslify = require('glslify');
var createBuffer = require('gl-buffer');
var glm = require('gl-matrix');
var vec3 = glm.vec3;
var mat3 = glm.mat3;
var mat4 = glm.mat4;
var orbitCamera = require('orbit-camera');
var eye = require('eye-vector');

var scratch = glm.mat4.create();

var max = Math.max;
var cos = Math.cos;

var upvec = [0, 0, 1];

var createShader = glslify({
  vertex: './shaders/editor.vert',
  fragment: './shaders/editor.frag'
});

module.exports = Editor;

function Editor(el) {
  if (!(this instanceof Editor)) {
    return new Editor(el);
  }
  this.el = el;

  this.eyevec = vec3.create();
  window.editor = this;
};

Editor.prototype.shell = null;
Editor.prototype.el = null;

Editor.prototype.setupBuffers = function(gl, obj) {
  var aspect = this.shell.width/this.shell.height;
  var fov = Math.PI/4.0;

  this.object = obj;
  this.projection = mat4.create();

  mat4.perspective(
    this.projection,
    fov,
    aspect,
    0.1,
    1000.0
  );

  if (this.shell.gl.buffer) {
    this.shell.gl.buffer.dispose();
    this.shell.gl.normals.dispose();
  }

  this.shell.gl.buffer = createBuffer(this.shell.gl, obj.buffer);
  this.shell.gl.normals = createBuffer(this.shell.gl, obj.normals);

  var r = obj.rect;
  var d = [
    r[1][0] - r[0][0],
    r[1][1] - r[0][1],
    r[1][2] - r[0][2]
  ];

  this.center = [
    d[0]/2 + r[0][0],
    d[1]/2 + r[0][1],
    d[2]/2 + r[0][2]
  ];

  var dm = max(d[0], max(d[1], d[2]*1.5)) * 2;

  this.pos = [
    this.center[0],
    this.center[1] + dm/Math.cos(fov/2),
    this.center[2]
  ];

  this.camera.lookAt(this.pos, this.center, upvec);

  // TODO: there is a better way
  this.camera.pan([
    0,
    Math.min(.2, Math.tan((Math.PI*2 - (fov/2 + Math.PI/2)))/d[2]),
    0
  ]);
}

Editor.prototype.display = function(object, color) {
  var that = this;

  if (!this.shell) {

    var color = 0x11 / 255;
    var shell = this.shell = glnow({
      element: this.el,
      clearColor : [color, color, color, 1]
    });

    shell.element = this.el;

    var camera = that.camera = orbitCamera();

    shell.on("gl-init", function() {
      var gl = shell.gl

      that.setupBuffers(shell.gl, object);
      gl.program = createShader(gl);
      gl.program.bind();
      gl.program.attributes.position.location = 0;
      gl.program.attributes.aNormal.location = 1
    });

    var last = 0;
    shell.on("gl-render", function(t) {

      var gl = shell.gl

      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.CULL_FACE)

      var shader = gl.program;

      shader.bind();
      gl.buffer.bind();

      shader.attributes.position.pointer();
      shader.attributes.aNormal.pointer();

      shader.uniforms.model = mat4.identity(scratch);

      shader.uniforms.projection = that.projection;

      eye(camera.view(), that.eyevec);

      camera.rotate([t*.1, 0], [t*.1 - .005, 0]);

      shader.uniforms.view = camera.view(scratch)

      shader.uniforms.eye = that.eyevec;

      gl.drawArrays(gl.TRIANGLES, 0, that.object.verts.length/3);
    });

    shell.on("gl-error", function(e) {
      throw new Error("WebGL not supported :(")
    });
  } else {
    this.setupBuffers(this.shell.gl, object);
  }
};

