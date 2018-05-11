const regl = require("regl")(document.body);
const d3 = require("d3");
const fps = require("fps-indicator")({
  style: "background:rgba(255, 255, 255, 0.9); padding: 0.2rem"
});
const numPoints = 250000;

// Size of vertex in bytes (4.0 is GL_FLOAT size)
const vertSize = 4 * 8;

// random number generator for position
const rng = d3.randomNormal(0, 0.5);

// random number generator for velocity
const rngv = d3.randomNormal(0.0001, 0.001);

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

        Math.random(), // red
        Math.random(), // green
        0.5, // blue
        1.0 // alpha
      ];
    })
);

const drawPoints = regl({
  depth: { enable: false },
  stencil: { enable: false },
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
      gl_PointSize = 3.0;
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
    tick: ({ tick }) => tick
  },

  // specify the number of points to draw
  count: numPoints,

  // specify that each vertex is a point (not part of a mesh)
  primitive: "points"
});

regl.frame(({ tick }) => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  });

  drawPoints({ points });
});
