precision mediump float;


attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 eye;
varying vec3 fragColor;


varying vec3 vNormal;

void main() {
  vNormal = normalize(normal);
  gl_Position = projection * view * model * vec4(position, 1.0);
  fragColor = color;
}
