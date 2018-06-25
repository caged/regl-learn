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
const pointIncrement = 3

// chunk counter
let chunk = 0
const totalChunks = numPoints / pointIncrement

// random number generator for position
const rng = d3.randomUniform(0.15, -0.15)

// random number generator for velocity
const rngv = d3.randomUniform(2, 4)

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
      // vec2 d = distance(position, endpos);
      // vec2 newpos = (position + d + velocity) * (tick / birth);

      // Works with consitent velocity towards endpos
      // vec2 newpos = (position + d) * (time - birth);

      // Works with consitent velocity towards endpos
      vec2 newpos = position + (d * ((time - birth) / velocity.x));

      // If we've made it to the x position, skip drawing the point
      // gl_PointSize = newpos.x > endpos.x ? 0.0 : 10.0;
      gl_Position = newpos.x > endpos.x ? vec4(-2, -1, 0, 1) : vec4(newpos, 0, 1);
      gl_PointSize = 6.0;
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
  count: () => {
    return pointCount + pointIncrement
  },

  // specify that each vertex is a point (not part of a mesh)
  primitive: 'points'
})

const drawNode = regl({
  frag: `
    precision mediump float;

    void main() {
      gl_FragColor = vec4(1.0, 1.0, 0.0, 1);
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform vec2 offset;
    uniform vec2 scale;
    uniform float viewportWidth;
    uniform float viewportHeight;

    void main() {
      float r = (viewportWidth) / (viewportHeight);
      gl_Position = vec4(position.xy * scale * vec2(1.0, r) + offset, 0, 1);
    }
  `,

  attributes: {
    position: [[-1, -1], [+1, +1], [-1, +1], [-1, -1], [+1, -1], [+1, +1]]
  },

  uniforms: {
    offset: regl.prop('offset'),
    scale: regl.prop('scale'),
    viewportWidth: regl.context('viewportWidth'),
    viewportHeight: regl.context('viewportHeight')
  },

  // specify the number of points to draw
  depth: {
    enable: false
  },
  cull: {
    enable: false
  },
  count: 6
})

function makePoint(time) {
  if (pointCount < numPoints) {
    // Add vertext data as subdata
    const newPoints = Array(pointIncrement)
      .fill()
      .map(() => {
        return [
          -0.5, // x
          rng(), // y

          0.5, // endx
          0.0, // endy

          rngv(), // x velocity
          rngv(), // y velocity

          time, // birth time particle was born

          Math.random() * 100 / 255, // red
          Math.random() * 255 / 255, // green
          Math.random() * 255 / 255, // blue
          1.0 // alpha
        ]
      })

    // We are contiously streaming in new data, but we don't want to have a buffer with unbounded
    // growth.  What we're doing here is updating the buffer subdata in chunks and starting over
    // at byte offset 0 when the totalChunks limit has been hit.
    //
    // This makes the assumption that by the time we get to the end of the buffer, the data at the
    // beginning of the buffer is ok to be replaced.  Put another way, by the time we animate in
    // the last points, we assume the first points are "done" and have reached their destination and
    // are ready to be replaced.
    //
    // This nice thing about this approach is that it allows us to replace data at the beginning of
    // the buffer without having to store the data and itterate over every point during every tick
    // to do some check.
    //
    // The drawbacks of this approach are that we never know for sure if the data we're replacing has
    // actually made it to the target location.
    if (chunk >= totalChunks) chunk = 0
    points.subdata(newPoints, chunk * pointIncrement * vertSize)

    if (pointCount + pointIncrement < numPoints) {
      pointCount = chunk * pointIncrement
    }
    chunk += 1
  }
}

// Make the first batch of points
makePoint(0)

regl.frame(({time, tick}) => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  // Draw the points
  drawPoints({points})

  // Draw some origin and destination nodes.
  drawNode([
    {
      scale: [0.01, 0.1],
      offset: [-0.5, 0.0]
    },
    {
      scale: [0.01, 0.01],
      offset: [0.5, 0.0]
    }
  ])

  // Every `n` frames generate a new point
  if (tick % 10 === 0) {
    makePoint(time)
  }
})
