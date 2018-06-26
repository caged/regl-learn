/* eslint-env node, browser */
// Heavily adapted from https://www.shadertoy.com/view/lscczl
const path = require('path')
const resl = require('resl')
const mat4 = require('gl-mat4')
const createCanvas = require('regl')
const glslify = require('glslify')
const shader = require('shader-reload')({
  vertex: glslify(path.resolve(__dirname, 'index.vert')),
  fragment: glslify(path.resolve(__dirname, 'index.frag'))
})

const canvas = document.createElement('canvas')
canvas.width = 1024
canvas.height = 767
document.body.appendChild(canvas)

const regl = createCanvas({
  canvas,
  extensions: ['OES_texture_float'],
  optionalExtensions: ['EXT_disjoint_timer_query']
})

const drawParticles = regl({
  depth: {enable: false},
  stencil: {enable: false},
  frag: shader.fragment,
  vert: shader.vertex,
  attributes: {
    position: [[-1, -1], [1, -1], [-1, 1], [-1, 1], [1, 1], [1, -1]]
  },

  uniforms: {
    border: 0.01,
    circleRadius: 0.1,
    circleColor: [1, 1, 1, 1],
    circleCenter: [0.5, 0.5],
    tex0: regl.prop('texture'),
    view: ({tick}) => {
      const t = 0.01 * tick
      return mat4.lookAt([], [5 * Math.cos(t), 2.5 * Math.sin(t), 5 * Math.sin(t)], [0, 0.0, 0], [0, 1, 0])
    },
    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective([], Math.PI / 4, viewportWidth / viewportHeight, 0.01, 10)
  },
  count: 6
})

resl({
  manifest: {
    texture: {
      type: 'image',
      src: '/mountains.jpg',
      parser: data => {
        return regl.texture({
          data,
          mag: 'linear',
          min: 'linear'
        })
      }
    }
  },
  onDone: ({texture}) => {
    const loop = regl.frame(ctx => {
      regl.clear({
        color: [0, 0, 0, 1],
        depth: 1
      })

      drawParticles({texture})

      if (ctx.time > 1.0) {
        loop.cancel()
      }
    })
  }
})
