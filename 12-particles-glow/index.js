const regl = require('regl')({
  container: document.body,
  extensions: ['EXT_blend_minmax']
})
const d3 = require('d3')

const numPoints = 200000

// Size of vertex in bytes (4.0 is GL_FLOAT size)
const vertSize = 4 * 8

// random number generator for position
const rng = d3.randomNormal(0, 0.1)

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
        1.0, // alpha

        17 / 255, // red
        17 / 255, // green
        98 / 255, // blue
        1.0 // alpha
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
    varying vec4 fill;

    void main() {
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      float r = dot(cxy, cxy);
      if (r > 1.0) discard;

      gl_FragColor = vec4(fill);
    }
  `,
  vert: `
    #define M_2PI   6.28318530717958647692528676655900
    #pragma glslify: blendColorDodge = require(glsl-blend/color-dodge)
    precision mediump float;
    attribute vec2 position;
    attribute vec2 velocity;
    attribute vec4 color1;
    attribute vec4 color2;
    uniform float tick;
    uniform float time;
    varying vec4 fill;
    vec3 foobar;

    void main() {
      float colorspeed = 2.0;
      float colorfreq = 50.0;

      vec2 newpos = vec2(position.x + velocity.x * tick, position.y + velocity.y * tick);
      gl_PointSize = 7.0;
      gl_Position = vec4(newpos, 0, 1);
      // foobar = blendColorDodge(vec3(1.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0), 1.0);
      fill = mix(color1, color2, sin(colorspeed * time + colorfreq * position.x * M_2PI) / 2.0 + 0.5);;
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
      offset: 32
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
