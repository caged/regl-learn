//
//
// WARNING: While this works for animating points, it's _very_ inneficient since position
// updates are computed on the CPU.  I wouldn't recommend this, but it was a step on my
// journey to understanding animation points with webgl.
//
//
const regl = require("regl")(document.body);
const d3 = require("d3");

const numPoints = 100000;

// Size of vertex in bytes (4.0 is GL_FLOAT size)
const vertSize = 4 * 7;

// dimensions of the viewport we are drawing in
const width = window.innerWidth;
const height = window.innerHeight;

// random number generator from d3-random
const rng = d3.randomNormal(0, 0.4);
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
        0.5 // blue
      ];
    })
);

const drawPoints = regl({
  depth: { enable: false },
  stencil: { enable: false },
  frag: `
    precision mediump float;
    varying vec3 fill;

    void main() {
      gl_FragColor = vec4(fill, 1);
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;
    attribute vec2 velocity;
    attribute vec3 color;
    uniform float tick;
    uniform float time;
    varying vec3 fill;

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
