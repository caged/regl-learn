precision mediump float;
uniform sampler2D tex0;
uniform float border; // 0.01
uniform float circleRadius; // 0.5
uniform vec4 circleColor; // vec4(1.0, 1.0, 1.0, 1.0)
uniform vec2 circleCenter; // vec2(0.5, 0.5)
varying vec2 uv;
void main (void) {

  vec4 bkg_color = texture2D(tex0, uv * vec2(1.0, -1.0));

  // Offset uv with the center of the circle.
  // uv -= circleCenter;

  float dist =  sqrt(dot(uv - circleCenter, uv - circleCenter));

  if ((dist > (circleRadius + border)) || (dist < (circleRadius - border))) {
    gl_FragColor = texture2D(tex0, uv);
  } else {
    gl_FragColor = circleColor;
  }
  // gl_FragColor = texture2D(tex0, uv);
}
