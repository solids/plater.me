var qel = require('./qel');
var glnow = require('gl-now');
var glslify = require('glslify');
var createBuffer = require('gl-buffer');
var glm = require('gl-matrix');
var attachCamera = require('game-shell-orbit-camera');

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
};

Editor.prototype.shell = null;
Editor.prototype.el = null;

Editor.prototype.display = function(object, color) {
  var buffer = object.buffer;
  var that = this;
  this.facetCount = object.facets.length;

  if (!this.shell) {
    var shell = this.shell = glnow({
      element: this.el,
      clearColor : [0,0,0,1]
    });
    shell.element = this.el;

    var camera = attachCamera(shell);

    shell.on("gl-init", function() {
      var gl = shell.gl

      gl.buffer = createBuffer(gl, buffer);

      gl.program = createShader(gl);
      gl.program.bind();
      gl.program.attributes.position.location = 0;
    });

    shell.on("gl-render", function(t) {
      var gl = shell.gl

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

      shader.uniforms.view = camera.view(scratch)

      gl.drawArrays(gl.TRIANGLES, 0, that.facetCount);

      gl.flush();
    });

    shell.on("gl-error", function(e) {
      throw new Error("WebGL not supported :(")
    });
  } else {
    this.shell.gl.buffer.dispose();
    this.shell.gl.buffer = createBuffer(this.shell.gl, buffer);
  }
};

