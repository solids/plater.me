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
  vNormal = normalize(aNormal);
  gl_Position = projection * view * model * vec4(position, 1.0);
  fragColor = color;
  planeUV = vec2(0.0,1.0)+vec2(0.5,-0.5) * (position.xy + 1.0);
}
