const regl = require('regl')(document.body)
const mat4 = require('gl-mat4')
// You can't actually tweak this on many environments.  Drawing thick lines with
// webgl is much more complex.  See https://github.com/jpweeks/regl-line-builder for a
// convenient API
const lineWidth = 1

const lines = regl.elements({
  primitive: 'lines',
  // data represents the index of the `position` data
  data: [[0, 1], [1, 2], [2, 3], [3, 0]]
})

const drawLines = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform mat4 projection;
    uniform mat4 view;

    void main() {
      gl_Position = projection * view * vec4(position, 0, 1);
    }`,

  attributes: {
    position: [
      [0.5, 0.5], // 0
      [0.5, -0.5], // 1
      [-0.5, -0.5], // 2
      [-0.5, 0.5] // 3
    ]
  },

  elements: lines,

  uniforms: {
    color: [1, 0, 0, 1],

    view: ({tick}) => {
      const t = 0.01 * tick
      return mat4.lookAt([], [10 * Math.sin(t), 0, -2 * Math.cos(t)], [0, 0, 1], [0, -1, 0])
    },

    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective([], Math.PI / 4, viewportWidth / viewportHeight, 0.05, 1000)
  },

  lineWidth
})

regl.frame(() => {
  regl.clear({color: [0, 0, 0, 1]})

  drawLines()
})
