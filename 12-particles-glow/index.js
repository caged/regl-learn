const regl = require('regl')({
  container: document.body
})
const d3 = require('d3')

const numPoints = 20000

// Size of vertex in bytes (4.0 is GL_FLOAT size)
const vertSize = 4 * 10

// random number generator for position
const rng = d3.randomNormal(0, 0.15)

// random number generator for velocity
const rngv = d3.randomNormal(0.0001, 0.0005)

// create initial set of points
const points = regl.buffer(
  Array(numPoints)
    .fill()
    .map(() => {
      return [
        rng(), // x
        rng(), // y

        rngv(), // x velocity
        rngv(), // y velocity

        69 / 255, // red
        173 / 255, // green
        233 / 255, // blue

        17 / 255, // red
        17 / 255, // green
        98 / 255 // blue
      ]
    })
)

const drawPoints = regl({
  depth: {enable: false},
  stencil: {enable: false},
  blend: {
    enable: true,
    func: {
      srcRGB: 'src alpha',
      srcAlpha: 'src color',
      dstRGB: 'one minus src color',
      dstAlpha: 'one minus src color'
      // src: 'one',
      // dst: 'one'
    },
    equation: 'add',
    color: [1, 1, 1, 1]
  },
  frag: `
    precision mediump float;
    varying vec3 fill;

    void main() {
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      float r = dot(cxy, cxy);
      if (r > 1.0) discard;


      gl_FragColor = vec4(fill, 1.0);
    }
  `,
  vert: `
    #define M_2PI   6.28318530717958647692528676655900
    precision mediump float;
    attribute vec2 position;
    attribute vec2 velocity;
    attribute vec3 color1;
    attribute vec3 color2;
    uniform float tick;
    uniform float time;
    varying vec3 fill;
    vec3 foobar;

    void main() {
      float colorspeed = 5.0;
      float colorfreq = 3.0;

      vec2 newpos = vec2(position.x + velocity.x * tick, position.y + velocity.y * tick);
      gl_PointSize = 7.0;
      gl_Position = vec4(newpos, 0, 1);

      // Not necissary, but makes colors a little more interesting
      fill = mix(
        mix(color1, vec3(1, 1, 1), cos(colorspeed * time + colorfreq * position.x * M_2PI) / 2.0 + 0.5),
        color2,
        sin(colorspeed * time + colorfreq * position.x * M_2PI) / 2.0 + 0.5
      );
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

    color1: {
      buffer: points,
      stride: vertSize,
      offset: 16
    },

    color2: {
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
  count: numPoints,

  // specify that each vertex is a point (not part of a mesh)
  primitive: 'points'
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  drawPoints({points})
})
