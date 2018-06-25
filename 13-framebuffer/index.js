const regl = require('regl')(document.body)

const drawParticles = regl({
  depth: {enable: false},
  stencil: {enable: false},
  frag: `
    void main() {}
  `,
  vert: `
    void main() {}
  `,

  count: 1,
  primitive: 'points'
})

const loop = regl.frame(({time}) => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  drawParticles()

  if (time > 10.0) {
    loop.cancel()
  }
})
