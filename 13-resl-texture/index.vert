uniform mat4 projection, view;
attribute vec2 position;
varying vec2 uv;
void main()
{
  uv = position;
  gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  // gl_Position = projection * view * vec4(position, 0, 1);
  // gl_TexCoord[0] = gl_MultiTexCoord0;
}
