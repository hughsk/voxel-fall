precision mediump float;

varying vec3 vnormal;
varying vec3 vposition;
uniform vec3 eye;

#pragma glslify: orenn = require('glsl-diffuse-oren-nayar')
#pragma glslify: gauss = require('glsl-specular-gaussian')

void main() {
  vec3 direction = normalize(vec3(0, 1, 0.2));
  float diff = orenn(direction, normalize(eye - vposition), vnormal, 0.9, 0.95);
  float spec = gauss(direction, normalize(eye - vposition), vnormal, 0.5);

  vec3 color = vec3(diff + spec) * 0.5;

  gl_FragColor = vec4(color, 1);
}
