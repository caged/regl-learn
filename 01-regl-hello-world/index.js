const regl = require('regl')(document.body)

const drawSpinningStretchyTriangle = regl({
  frag: `
  void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
  }`,

  vert: `
  attribute vec2 position;
  uniform float angle, scale, width, height;
  void main() {
    float aspect = width / height;
    gl_Position = vec4(
      scale * (cos(angle) * position.x - sin(angle) * position.y),
      aspect * scale * (sin(angle) * position.x + cos(angle) * position.y),
      0,
      1);
  }`,

  attributes: {
    position: [[0, -1], [-1, 0], [1, 1]]
  },

  uniforms: {
    //
    // Dynamic properties can be functions.  Each function gets passed:
    //
    //  * context: which contains data about the current regl environment
    //  * props: which are user specified arguments
    //  * batchId: which is the index of the draw command in the batch
    //
    angle: (context, props, batchId) => {
      return props.speed * context.tick + 0.01 * batchId
    },

    // As a shortcut/optimization we can also just read out a property
    // from the props.  For example, this
    //
    scale: regl.prop('scale'),
    //
    // is semantically equivalent to
    //
    //  scale: function (context, props) {
    //    return props.scale
    //  }
    //

    // Similarly there are shortcuts for accessing context variables
    width: regl.context('viewportWidth'),
    height: regl.context('viewportHeight')
    //
    // which is the same as writing:
    //
    // width: function (context) {
    //    return context.viewportWidth
    // }
    //
  },

  count: 3
})

// drawSpinningStretchyTriangle([
//   {
//     // batchId 0
//     scale: 1,
//     speed: 1
//   },
//   {
//     // batchId 1
//     scale: 2,
//     speed: 0.1
//   },
//   {
//     // batchId 2
//     scale: 0.25,
//     speed: 3
//   }
// ]);

const loop = regl.frame(context => {
  drawSpinningStretchyTriangle({
    scale: 0.4,
    speed: 0.2
  })

  if (context.time > 10.0) {
    loop.cancel()
  }
})
