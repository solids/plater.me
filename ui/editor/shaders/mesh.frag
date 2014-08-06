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

  vec3 sky = fragColor;//vec3(.3, 0.3, .3);
  vec3 gnd = vec3(0.1, 0.1, 0.1);

  vec3 direction = vec3(0.0, 100.0, -100.0);

  vec3 lighting = hemisphere(
      vNormal
    , sky
    , gnd
    , eye + direction
    , model
    , view
    , eye

    , params.x
    , params.y
  );



  if (textured > 0) {
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
  } else {
    gl_FragColor = vec4(lighting, 1.0);
  }
}

