const regl = require('regl')(document.body)
const d3 = require('d3')

// How many points to draw
const numPoints = 500

// Size of vertex data in bytes (4.0 is GL_FLOAT size)
const vertSize = 4 * 11

// The current number of points
let pointCount = 0

// point increment
const pointIncrement = 1

// random number generator for position
const rng = d3.randomNormal(0.0001, 0.0001)

// random number generator for velocity
const rngv = d3.randomNormal(0.0001, 0.001)

// let pointData = []

// Allocate a dynamic buffer that can store
// our points
const points = regl.buffer({
  usage: 'dynamic',
  type: 'float',
  length: vertSize * numPoints
})

// Debug container
// const debug = d3
//   .select(document.body)
//   .append('div')
//   .attr('style', `padding:10px;background-color:#fff;position:absolute;right:0;top:0;color:green;font-family:courier`)

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
    varying vec4 fill;


    void main() {
      vec2 d = endpos - position;
      // vec2 newpos = (position + d + velocity) * (tick / birth);
      vec2 newpos = position + velocity * tick;
      // if(newpos.x >= endpos.x && newpos.y >= endpos.y) {
      //   gl_PointSize = 0.0;
      // } else {
      //   gl_PointSize = 4.0;
      // }

      gl_PointSize = 8.0;
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
    tick: ({tick}) => tick
  },

  // specify the number of points to draw
  count: () => pointCount,

  // specify that each vertex is a point (not part of a mesh)
  primitive: 'points'
})

function makePoint(birth) {
  if (pointCount < numPoints) {
    // Add vertext data as subdata
    const newPoints = Array(pointIncrement)
      .fill()
      .map(() => {
        const {r, g, b} = d3.hsl(Math.random() * 60, 1, Math.max(0.2, Math.random() * 1)).rgb()
        return [
          0.5, // x
          0.5, // y

          0.0, // endx
          0.0, // endy

          0.001, // x velocity
          0.001, // y velocity

          birth,

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

// Maybe fully replace buffer with new set of points that haven't
// hit the endpos?
function cullPoints(time, tick) {
  // vec2 d = endpos - position;
  // vec2 newpos = position + d * (tick - birth);
  // points({
  //   data:
  // })
  let numPoints = pointData.length

  const tickSize = tick / 200
  while (numPoints--) {
    const point = pointData[numPoints]
    // Start x
    const [sx, sy] = point.slice(0, 2)
    // End x, y
    const [ex, ey] = point.slice(2, 4)
    // Distance x, y
    const dx = ex - sx
    const dy = ey - sy

    // Birth time
    const birth = point[6]

    const px = sx + dx * (tickSize - birth)
    const py = sy + dy * (tickSize - birth)
    // console.log(px, py, ex, ey)

    // console.log(px, py, ex, ey)
    if (px <= ex && py >= ey) {
      pointData.splice(numPoints, 1)
      // pointCount--
    }
  }
  // for (const point of pointData) {
  //   // Start x, y
  //   const [sx, sy] = point.slice(0, 2)
  //   // End x, y
  //   const [ex, ey] = point.slice(2, 4)
  //   // Distance x, y
  //   const dx = ex - sx
  //   const dy = ey - sy
  //
  //   // Birth time
  //   const birth = point[6]
  //
  //   const px = sx + dx * (tick - birth)
  //   const py = sy + dy * (tick - birth)
  //   // console.log(px, py, ex, ey)
  //   //
  //   if (px <= ex && py >= ey) {
  //     pointData.splice()
  //   }
  //
  //   // console.log(epos)
  //   // console.log(point)
  // }
}

regl.frame(({time, tick}) => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  drawPoints({points})
  // cullPoints(time, tick)
  if (tick % 20 == 0) {
    makePoint(time)
  }
})
