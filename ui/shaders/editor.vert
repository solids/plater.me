precision mediump float;


attribute vec3 position;
attribute vec3 color;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 eye;
varying vec3 fragColor;


attribute vec3 aNormal;
varying vec3 vNormal;

void main() {
  vNormal = aNormal;
  gl_Position = projection * view * model * vec4(position, 1.0);
  fragColor = color;
}
