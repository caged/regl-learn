const regl = require("regl")(document.body);

const drawTriangle = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;

    void main() {
      gl_FragColor = color;
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;

    void main() {
      gl_Position = vec4(position, 0, 1);
    }
  `,
  attributes: {
    position: [[-1, 1], [1, 1], [1, -1]]
  },

  uniforms: {
    color: regl.prop("color")
  },

  count: 3
});

const loop = regl.frame(({ time }) => {
  const color = [
    Math.cos(time * 0.1),
    Math.sin(time * 0.8),
    Math.cos(time * 0.003),
    1
  ];
  drawTriangle({ color });
});
