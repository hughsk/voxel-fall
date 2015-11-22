precision mediump float;

varying vec3 vnormal;
varying vec3 vposition;
varying vec3 vworld;
uniform vec3 eye;
uniform vec3 light;

#pragma glslify: orenn = require('glsl-diffuse-oren-nayar')
#pragma glslify: gauss = require('glsl-specular-gaussian')
#pragma glslify: fog = require('glsl-fog')

float calcLightAttenuation(float lightDistance, float cutoffDistance, float decayExponent) {
  if (decayExponent > 0.0) {
    return pow(clamp(-lightDistance / cutoffDistance + 1.0, 0.0, 1.0), decayExponent);
  }

  return 1.0;
}

void main() {
  vec3 direction = normalize(vec3(0, 1, 0.2));
  vec3 viewDiff = eye - vposition;
  vec3 lightDir = light - vposition;


  // float diff = orenn(direction, normalize(viewDiff), vnormal, 0.9, 0.95);
  // float spec = gauss(direction, normalize(viewDiff), vnormal, 0.5);
  float diff = orenn(normalize(lightDir), normalize(viewDiff), vnormal, 0.9, 0.95);
  float spec = gauss(normalize(lightDir), normalize(viewDiff), vnormal, 0.5);

  vec3 material = vec3(1);
  float att = calcLightAttenuation(length(lightDir), 20.0, 0.5);
  vec3 lcol = att * vec3(1, 0.7, 0.4);


  // material = mix(material, vec3(0.6, 1.3, 0.4), clamp(floor(vposition.y) * 0.25 + 2., 0.0, 1.0));
  // material = mix(material, vec3(2), clamp(floor(vposition.y) * 0.25, 0.0, 1.0));

  vec3 color = lcol * vec3(material * diff + spec);

  color = mix(color, vec3(-0.6, -0.9, 0.1), fog(length(viewDiff), 0.02));

  gl_FragColor = vec4(color, 1);
}
