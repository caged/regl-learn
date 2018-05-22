attribute vec2 position;
attribute vec3 color;
varying vec3 fragColor;
uniform float pointWidth;

void main() {
  gl_PointSize = pointWidth;
  fragColor = color;

  gl_Position = vec4(position, 0.0, 1.0);
}
