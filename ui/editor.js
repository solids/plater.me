var qel = require('./qel');
var glnow = require('gl-now');
var glslify = require('glslify');
var createBuffer = require('gl-buffer');

var createShader = glslify({
  vertex: './shaders/editor.vert',
  fragment: './shaders/editor.frag'
});

module.exports = Editor;

function Editor(el) {
  if (!(this instanceof Editor)) {
    return new Editor(el);
  }

  var shell = this.shell = glnow({ element: el });
  shell.element = el;

  shell.on("gl-init", function() {
    var gl = shell.gl

    gl.buffer = createBuffer(gl, new Float32Array([
      -1, 0, 0,
      0, -1, 0,
      1, 1, 0
    ]));

    var program = gl.program = createShader(gl);
    program.bind();
    program.attributes.position.location = 0;
  })

  shell.on("gl-render", function(t) {
    var gl = shell.gl

    gl.program.bind();
    gl.buffer.bind();
    gl.program.attributes.position.pointer();

    //Draw arrays
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  })

  shell.on("gl-error", function(e) {
    throw new Error("WebGL not supported :(")
  })
};

Editor.prototype.shell = null;

