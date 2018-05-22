const regl = require('regl')(document.body)
const d3 = require('d3')

// How many points to draw
const numPoints = 1000000

// Size of vertex data in bytes (4.0 is GL_FLOAT size)
const vertSize = 4 * 8

// The current number of points
let pointCount = 0

// point increment
const pointIncrement = 1000

// random number generator for position
const rng = d3.randomNormal(0, 0.4)

// random number generator for velocity
const rngv = d3.randomNormal(0.0001, 0.001)

// Allocate a dynamic buffer that can store
// our points
const points = regl.buffer({
  usage: 'dynamic',
  type: 'float',
  length: vertSize * numPoints
})

// Debug container
const debug = d3
  .select(document.body)
  .append('div')
  .attr('style', `padding:10px;background-color:#fff;position:absolute;right:0;top:0;color:green;font-family:courier`)

const drawPoints = regl({
  profile: true,
  depth: {enable: false},
  stencil: {enable: false},
  frag: `
    precision mediump float;
    varying vec4 fill;

    void main() {
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      float r = dot(cxy, cxy);
      if (r > 1.0) discard;

      gl_FragColor = vec4(fill);
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;
    attribute vec2 velocity;
    attribute vec4 color;
    uniform float tick;
    varying vec4 fill;

    void main() {
      vec2 newpos = vec2(position.x + velocity.x * tick, position.y + velocity.y * tick);
      gl_PointSize = 2.0;
      gl_Position = vec4(newpos, 0, 1);
      fill = color;
    }
  `,

  attributes: {
    position: {
      buffer: points,
      stride: vertSize,
      offset: 0
    },

    velocity: {
      buffer: points,
      stride: vertSize,
      offset: 8
    },

    color: {
      buffer: points,
      stride: vertSize,
      offset: 16
    }
  },

  uniforms: {
    tick: ({tick}) => tick
  },

  // specify the number of points to draw
  count: () => pointCount,

  // specify that each vertex is a point (not part of a mesh)
  primitive: 'points'
})

function makePoint() {
  if (pointCount < numPoints) {
    // Add vertext data as subdata
    const newPoints = Array(pointIncrement)
      .fill()
      .map(() => {
        const {r, g, b} = d3.hsl(Math.random() * 60, 1, Math.max(0.2, Math.random() * 1)).rgb()
        return [
          rng(), // x
          rng(), // y

          rngv(), // x velocity
          rngv(), // y velocity

          r / 255, // red
          g / 255, // green
          b / 255, // blue
          1.0 // alpha
        ]
      })

    points.subdata(newPoints, pointCount * vertSize)
    pointCount += pointIncrement
    debug.text(`${pointCount} points`)
  }
}

regl.frame(() => {
  // Every tick, add a `pointIncrement` num points to the buffer
  makePoint()

  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  drawPoints({points})
})
