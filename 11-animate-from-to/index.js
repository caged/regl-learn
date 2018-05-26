const regl = require('regl')({
  container: document.body
})
const d3 = require('d3')

// How many points to draw
const numPoints = 50000

// Size of vertex data in bytes (4.0 is GL_FLOAT size)
const vertSize = 4 * 11

// The current number of points
let pointCount = 0

// point increment
const pointIncrement = 2

// random number generator for position
const rng = d3.randomNormal(0.001, 0.1)

// random number generator for velocity
const rngv = d3.randomNormal(0.1, 0.5)

// Allocate a dynamic buffer that can store
// our points
const points = regl.buffer({
  usage: 'dynamic',
  type: 'float',
  length: vertSize * numPoints
})

const drawPoints = regl({
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
    attribute vec2 endpos;
    attribute vec2 velocity;
    attribute float birth;
    attribute vec4 color;
    uniform float tick;
    uniform float time;
    varying vec4 fill;


    void main() {
      vec2 d = endpos - position;
      // vec2 newpos = (position + d + velocity) * (tick / birth);

      // Works with consitent velocity towards endpos
      // vec2 newpos = (position + d) * (time - birth);

      // Works with consitent velocity towards endpos
      vec2 newpos = position + (d * ((time - birth) / 3.0));

      gl_PointSize = 10.0;
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

    endpos: {
      buffer: points,
      stride: vertSize,
      offset: 8
    },

    velocity: {
      buffer: points,
      stride: vertSize,
      offset: 16
    },

    birth: {
      buffer: points,
      stride: vertSize,
      offset: 24
    },

    color: {
      buffer: points,
      stride: vertSize,
      offset: 28
    }
  },

  uniforms: {
    tick: regl.context('tick'),
    time: regl.context('time')
  },

  // specify the number of points to draw
  count: () => pointCount,

  // specify that each vertex is a point (not part of a mesh)
  primitive: 'points'
})

function makePoint(time) {
  if (pointCount < numPoints) {
    // Add vertext data as subdata
    const newPoints = Array(pointIncrement)
      .fill()
      .map(() => {
        const {r, g, b} = d3.hsl(Math.random() * 60, 1, Math.max(0.2, Math.random() * 1)).rgb()
        return [
          rng(), // x
          rng(), // y

          1.0, // endx
          0.0, // endy

          rngv(), // x velocity
          rngv(), // y velocity

          time, // birth time particle was born

          r / 255, // red
          g / 255, // green
          b / 255, // blue
          1.0 // alpha
        ]
      })

    points.subdata(newPoints, pointCount * vertSize)
    pointCount += pointIncrement
  }
}

makePoint(0)
regl.frame(({time, tick}) => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  drawPoints({points})

  // Every 60 frames (about 1 second), generate new points
  if (tick % 60 === 0) {
    makePoint(time)
  }
})
