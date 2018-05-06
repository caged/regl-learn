const c = document.getElementById('c')
const gl = c.getContext('webgl')

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader
  }

  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

const vsource = document.getElementById('vertex').text
const fsource = document.getElementById('frag').text

const vshader = createShader(gl, gl.VERTEX_SHADER, vsource)
const fshader = createShader(gl, gl.FRAGMENT_SHADER, fsource)

console.log(vshader);
