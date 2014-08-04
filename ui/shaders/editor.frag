precision mediump float;

uniform mat4 view;
uniform mat4 model;
uniform vec3 eye;
varying vec3 vNormal;


#pragma glslify: hemisphere = require(glsl-hemisphere-light)

void main() {

  vec3 sky = vec3(.3, 0.3, .3);
  vec3 gnd = vec3(0.2, 0.2, 0.2);

  vec3 direction = vec3(0.0, 100.0, 100.0);

  vec3 lighting = hemisphere(
      vNormal
    , sky
    , gnd
    , eye + direction
    , model
    , view
    , eye

    , 0.1
    , 0.5
  );


  gl_FragColor = vec4(lighting, 1.0);

}
