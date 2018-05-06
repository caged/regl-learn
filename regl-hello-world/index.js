const regl = require('regl')(document.body)
const shader = require('./index.shader');

shader.on('change', () => {
  console.log('Shader updated');
})

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
