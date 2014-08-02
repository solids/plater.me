precision mediump float;

uniform mat4 view;
uniform mat4 model;
uniform vec3 eye;
varying vec3 vNormal;


#pragma glslify: hemisphere = require(glsl-hemisphere-light)

void main() {

  vec3 sky = vec3(1.0, 1.0, 0.9);
  vec3 gnd = vec3(0.1, 0.1, 0.35);

  vec3 direction = vec3(0.0, 1.0, 0.0);

  vec3 lighting = hemisphere(
      vNormal
    , sky
    , gnd
    , direction
    , model
    , view
    , eye

    , 20.0
    , 0.2
  );

  gl_FragColor = vec4(lighting, 1.0);


  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
