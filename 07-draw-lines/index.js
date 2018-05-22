const regl = require('regl')(document.body)

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

    void main() {
      gl_Position = vec4(position, 0, 1);
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
    color: [1, 0, 0, 1]
  },

  lineWidth
})

regl.clear({
  color: [0, 0, 0, 1],
  depth: 1
})

drawLines({})
