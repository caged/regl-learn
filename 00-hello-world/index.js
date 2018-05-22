// Vertex shaders are responsible for setting the position of pixels on the
// screen by setting `gl_Position`.
const vertex = `
  attribute vec4 a_position;

  void main() {
    gl_Position = a_position;
  }
`

// Fragment shaders are responsible for setting the color of pixels on screen by
// setting `gl_FragColor`
const fragment = `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(1, 0, 0.5, 1);
  }
`

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  gl.deleteShader(shader)
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl')
  const vshader = createShader(gl, gl.VERTEX_SHADER, vertex)
  const fshader = createShader(gl, gl.FRAGMENT_SHADER, fragment)

  /* eslint-disable no-console */
  console.log(vshader, fshader)
})
