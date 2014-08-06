precision mediump float;

uniform mat4 view;
uniform mat4 model;
uniform vec3 eye;
uniform vec3 params;

uniform sampler2D texture;

varying vec2 planeUV;

varying vec3 vNormal;
varying vec3 fragColor;

#pragma glslify: hemisphere = require(glsl-hemisphere-light)

void main() {
  // #16368A
  vec3 sky = vec3(
    0.08627450980392157,
    0.21176470588235294,
    0.5411764705882353
  );

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

  // gl_FragColor = texture2D(texture, planeUV);
  vec4 color = vec4(
    0.08627450980392157,
    0.21176470588235294,
    0.5411764705882353,
    1.0
  );

  gl_FragColor = color;
  // gl_FragColor = normalize(
  //   color + vec4(lighting, 1.0) + texture2D(texture, planeUV)
  // );
}
