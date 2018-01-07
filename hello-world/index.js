const regl = require('regl')(document.body)
const shader = require('./index.shader');

regl({
  frag: () => shader.fragment,
  vert: () => shader.vertex,
  attributes: {
    position: [
      [-1, 1],
      [1,  1],
      [1, -1],
      [-1, -1]
    ]
  },

  uniforms: {
    color: [1, 0, 0, 1]
  },

  count: 3
})()
