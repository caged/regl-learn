attribute vec2 position;
attribute vec3 color;

varying vec3 fragColor;

uniform float pointWidth;
uniform float stageWidth;
uniform float stageHeight;

vec2 normalizeCoords(vec2 position) {
  float x = position[0];
  float y = position[1];

  return vec2(
    2.0 * ((x / stageWidth) - 0.5),
    -(2.0 * ((y / stageHeight) - 0.5))
  );
}

void main() {
  gl_PointSize = pointWidth;
  fragColor = color;

  gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
}
