precision mediump float;

varying vec3 vnormal;
varying vec3 vposition;
uniform vec3 eye;

#pragma glslify: orenn = require('glsl-diffuse-oren-nayar')
#pragma glslify: gauss = require('glsl-specular-gaussian')
#pragma glslify: fog = require('glsl-fog')

void main() {
  vec3 direction = normalize(vec3(0, 1, 0.2));
  vec3 viewDiff = eye - vposition;
  float diff = orenn(direction, normalize(viewDiff), vnormal, 0.9, 0.95);
  float spec = gauss(direction, normalize(viewDiff), vnormal, 0.5);

  vec3 material = vec3(1, 0, 0);

  material = mix(material, vec3(0.6, 1.3, 0.4), clamp(floor(vposition.y) * 0.25 + 2., 0.0, 1.0));
  material = mix(material, vec3(2), clamp(floor(vposition.y) * 0.25, 0.0, 1.0));

  vec3 color = vec3(material * diff + spec * material) * 0.5;

  color = mix(color, vec3(1.15, 1.1, 1.2), fog(length(viewDiff), 0.05));

  gl_FragColor = vec4(color, 1);
}
