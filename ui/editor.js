var qel = require('./qel');
var glnow = require('gl-now');
var glslify = require('glslify');
var createBuffer = require('gl-buffer');
var glm = require('gl-matrix');
var attachCamera = require('game-shell-orbit-camera');
var eye = require('eye-vector');


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

  this.eyevec = new Float32Array(3)
};

Editor.prototype.shell = null;
Editor.prototype.el = null;

Editor.prototype.setupBuffers = function(gl, obj) {
  if (this.shell.gl.buffer) {
    this.shell.gl.buffer.dispose();
    this.shell.gl.normals.dispose();
  }

  this.shell.gl.buffer = createBuffer(this.shell.gl, obj.buffer);
  this.shell.gl.normals = createBuffer(this.shell.gl, obj.normals);
}

Editor.prototype.display = function(object, color) {
  var buffer = object.buffer;
  var that = this;
  that.object = object;

  if (!this.shell) {
    var shell = this.shell = glnow({
      element: this.el,
      clearColor : [0,0,0,1]
    });
    shell.element = this.el;

    var camera = attachCamera(shell);

    shell.on("gl-init", function() {
      var gl = shell.gl

      that.setupBuffers(shell.gl, object);
      gl.program = createShader(gl);
      gl.program.bind();
      gl.program.attributes.position.location = 0;
      gl.program.attributes.aNormal.location = 1
    });

    shell.on("gl-render", function(t) {
      var gl = shell.gl

      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.CULL_FACE)

      var shader = gl.program;
      var scratch = glm.mat4.create()

      shader.bind();
      gl.buffer.bind();

      shader.attributes.position.pointer();

      shader.uniforms.model = scratch

      shader.uniforms.projection = glm.mat4.perspective(
        scratch,
        Math.PI/4.0,
        shell.width/shell.height,
        0.1,
        1000.0
      );

      eye(camera.view(), that.eyevec);

      shader.uniforms.view = camera.view()

      shader.uniforms.eye = that.eyevec;

      gl.drawArrays(gl.TRIANGLES, 0, that.object.verts.length/3);

      gl.flush();
    });

    shell.on("gl-error", function(e) {
      throw new Error("WebGL not supported :(")
    });
  } else {
    this.setupBuffers(this.shell.gl, object);
  }
};

