const regl = require('regl')(document.body)
const shader = require('./index.shader')
const d3 = require('d3')

const numPoints = 10000

const rng = d3.randomNormal(0.0, 0.5)
const points = d3.range(numPoints).map(() => ({
  x: rng(),
  y: rng(),
  color: [1, Math.random(), Math.random(), 0.2]
}))

const drawPoints = regl({
  frag: () => shader.fragment,
  vert: () => shader.vertex,
  attributes: {
    position: points.map(d => [d.x, d.y]),
    color: points.map(d => d.color)
  },

  uniforms: {
    pointWidth: regl.prop('pointWidth')
  },

  count: points.length,
  primitive: 'points'
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  drawPoints({
    pointWidth: 2
  })
})
