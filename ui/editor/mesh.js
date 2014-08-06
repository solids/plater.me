module.exports = Mesh;


function Mesh() {

}

Mesh.prototype.program = null;
Mesh.prototype.vbo = null;

Mesh.prototype.setVBO = function(a) {

};

Mesh.prototype.render = function render(gl) {

  if (this.program) {
    this.program.bind();
  }

};
