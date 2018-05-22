const c = document.getElementById('c')
const gl = c.getContext('webgl')

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  gl.deleteShader(shader)
}

const vsource = document.getElementById('vertex').text
const fsource = document.getElementById('frag').text

createShader(gl, gl.VERTEX_SHADER, vsource)
createShader(gl, gl.FRAGMENT_SHADER, fsource)
