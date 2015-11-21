precision mediump float;

uniform mat4 proj;
uniform mat4 view;

attribute vec3 position;

void main() {
  gl_PointSize = 2.0;
  gl_Position = proj * view * vec4(position, 1);
}
