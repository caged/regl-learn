/* eslint-env node, browser */
// Derived from https://www.shadertoy.com/view/XsXXDn
const regl = require('regl')({
  extensions: ['OES_texture_float'],
  optionalExtensions: ['EXT_disjoint_timer_query']
})

const drawThing = regl({
  depth: {enable: false},
  stencil: {enable: false},
  frag: `
    precision mediump float;
    uniform float runtime;
    uniform vec2 resolution;
    void main() {
      vec3 c;
      float l, z=runtime;
      for(int i = 0; i < 3; i++) {
        vec2 uv, p = gl_FragCoord.xy / resolution.xy;
        uv = p;
        p -= 0.5;
        p.x *= resolution.x / resolution.y;
        z += 0.05;
        l = length(p);
        uv += p / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z * 2.0));
        c[i] = 0.01 / length(abs(mod(uv, 1.0) - 0.5));
      }

      gl_FragColor = vec4(c / l, runtime);
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
    position: [[-1, -1], [1, -1], [-1, 1], [-1, 1], [1, 1], [1, -1]]
  },

  uniforms: {
    resolution: ctx => {
      return [ctx.viewportWidth, ctx.viewportHeight]
    },
    viewportWidth: regl.context('viewportWidth'),
    viewportHeight: regl.context('viewportHeight'),
    runtime: regl.context('time')
  },
  count: 6
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  drawThing()
})
