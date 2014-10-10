precision mediump float;

uniform mat4 view;
uniform mat4 model;
uniform vec3 eye;
uniform vec3 params;

varying vec3 vNormal;
varying vec3 fragColor;


uniform int textured;


#pragma glslify: hemisphere = require(glsl-hemisphere-light)

void main() {
  gl_FragColor = vec4(1.0);

}

