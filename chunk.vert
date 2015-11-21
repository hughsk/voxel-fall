precision mediump float;

uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vnormal;

void main() {
  vnormal = normal;
  gl_Position = proj * view * model * vec4(position, 1);
}
