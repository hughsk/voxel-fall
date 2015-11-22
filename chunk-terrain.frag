precision mediump float;

varying vec3 vnormal;
varying vec3 vposition;
varying vec3 vworld;
uniform vec3 eye;
uniform vec3 light1;
uniform vec3 light2;

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
  vec3 lightDir1 = light1 - vposition;
  vec3 lightDir2 = light2 - vposition;


  // float diff = orenn(direction, normalize(viewDiff), vnormal, 0.9, 0.95);
  // float spec = gauss(direction, normalize(viewDiff), vnormal, 0.5);
  float diff1 = orenn(normalize(lightDir1), normalize(viewDiff), vnormal, 0.9, 0.95);
  float spec1 = gauss(normalize(lightDir1), normalize(viewDiff), vnormal, 0.5);
  float diff2 = orenn(normalize(lightDir2), normalize(viewDiff), vnormal, 0.9, 0.95);
  float spec2 = gauss(normalize(lightDir2), normalize(viewDiff), vnormal, 0.5);

  vec3 material = vec3(1);
  float att1 = calcLightAttenuation(length(lightDir1), 20.0, 0.5);
  float att2 = calcLightAttenuation(length(lightDir2), 10.0, 0.8);
  vec3 lcol1 = att1 * vec3(1, 0.7, 0.4);
  vec3 lcol2 = att2 * vec3(0.3, 0.8, 1);


  // material = mix(material, vec3(0.6, 1.3, 0.4), clamp(floor(vposition.y) * 0.25 + 2., 0.0, 1.0));
  // material = mix(material, vec3(2), clamp(floor(vposition.y) * 0.25, 0.0, 1.0));

  vec3 color = (
    lcol1 * vec3(material * diff1 + spec1) +
    lcol2 * vec3(material * diff2 + spec2)
  );

  color = mix(color, vec3(-0.6, -0.9, 0.1), fog(length(viewDiff), 0.02));

  gl_FragColor = vec4(color, 1);
}
