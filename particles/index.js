const regl = require("regl")(document.body);
const d3 = require("d3");

const numPoints = 10000;

// dimensions of the viewport we are drawing in
const width = window.innerWidth;
const height = window.innerHeight;

// random number generator from d3-random
const rng = d3.randomNormal(0, 0.3);

// create initial set of points
const points = d3.range(numPoints).map(i => ({
  x: rng(),
  y: rng()
}));

const drawPoints = regl({
  frag: `
    precision mediump float;

    void main() {
      gl_FragColor = vec4(0, 1, 0, 1);
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;

    void main() {
      gl_PointSize = 2.0;
      gl_Position = vec4(position, 0, 1);
    }
  `,

  attributes: {
    position: (ctx, props) => props.points.map(p => [p.x, p.y])
  },

  uniforms: {},

  // specify the number of points to draw
  count: points.length,

  // specify that each vertex is a point (not part of a mesh)
  primitive: "points"
});

regl.clear({
  color: [0, 0, 0, 1],
  depth: 1
});

drawPoints({ points });
