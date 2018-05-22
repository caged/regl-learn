const regl = require('regl')(document.body)
const d3 = require('d3')
const topojson = require('topojson-client')

// The default us-atlas topojson size is 960x600.  If we wanted to dynamically compute the bounds
// of this we could loop through every point in the geometry and get the extent. See
// https://github.com/topojson/us-atlas#us/10m.json for details.
const width = 960
const height = 600

const x = d3
  .scaleLinear()
  .range([-1, 1])
  .domain([0, width])

const y = d3
  .scaleLinear()
  .range([1, -1])
  .domain([0, height])

// You can't actually tweak this on many environments.  Drawing thick lines with
// webgl is much more complex.  See https://github.com/jpweeks/regl-line-builder for a
// convenient API
const lineWidth = 1

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
    position: (context, props) => {
      return props.positions
    }
  },

  elements: (context, props) => {
    return props.elements
  },

  uniforms: {
    color: [0, 1, 0, 1]
  },

  lineWidth
})

/* eslint-disable github/no-then */
d3.json('https://unpkg.com/us-atlas@1/us/10m.json').then(us => {
  const usMesh = topojson.mesh(us)

  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  for (const mesh of usMesh) {
    // Map xy points to the webgl coordinate system
    const positions = mesh.map(d => [x(d[0]), y(d[1])])

    // Build a list of indexes that map to the positions array
    // [[0, 1], [1, 2], ...]
    const indexes = mesh.reduce((a, b, i) => {
      if (i + 1 < mesh.length) a.push([i, i + 1])
      return a
    }, [])

    const elements = regl.elements({
      primitive: 'lines',
      data: indexes
    })

    drawLines({elements, positions})
  }
})
