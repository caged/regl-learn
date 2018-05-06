const regl = require("regl")(document.body);
const shader = require("./index.shader");
const d3 = require("d3");

const numPoints = 100000;
const pointWidth = 2;
const width = window.innerWidth;
const height = window.innerHeight;

shader.on("change", () => {
  console.log("Shader updated");
});

const rng = d3.randomNormal(0, 0.25);
const points = d3.range(numPoints).map(i => ({
  x: rng() * width + width / 2,
  y: rng() * height + height / 2,
  color: [1, Math.random(), Math.random(), 0.2]
}));

const drawPoints = regl({
  frag: () => shader.fragment,
  vert: () => shader.vertex,
  attributes: {
    position: points.map(d => [d.x, d.y]),
    color: points.map(d => d.color)
  },

  uniforms: {
    pointWidth: regl.prop("pointWidth"),
    stageWidth: regl.prop("stageWidth"),
    stageHeight: regl.prop("stageHeight")
  },

  count: points.length,
  primitive: "points"
});

const loop = regl.frame(({ tick }) => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  });

  drawPoints({});

  // if (loop) {
  //   loop.cancel();
  // }
});
