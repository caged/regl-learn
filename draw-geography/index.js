const regl = require("regl")(document.body);
const d3 = require("d3");
const topojson = require("topojson-client");

const width = window.innerWidth;
const height = window.innerHeight;

const x = d3.scaleLinear().range([-1, 1]);
const y = d3.scaleLinear().range([1, -1]);

// You can't actually tweak this on many environments.  Drawing thick lines with
// webgl is much more complex.  See https://github.com/jpweeks/regl-line-builder for a
// convenient API
const lineWidth = 1;

const drawLines = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

  vert: `
    precision mediump float;
    attribute vec2 position;

    void main() {
      gl_Position = vec4(position, 0, 1);
    }`,

  attributes: {
    position: (context, props) => {
      return props.positions;
    }
  },

  elements: (context, props) => {
    return props.elements;
  },

  uniforms: {
    color: [1, 0, 0, 1]
  },

  lineWidth: lineWidth
});

d3.json("https://unpkg.com/us-atlas@1/us/10m.json").then((us, err) => {
  const { states } = us.objects;
  const statesGeo = topojson.feature(us, states);
  const oregon = statesGeo.features[19];
  const oregonGeo = oregon.geometry.coordinates[0][0];
  const xext = d3.extent(oregonGeo, d => d[0]);
  const yext = d3.extent(oregonGeo, d => d[1]);

  x.domain(xext);
  y.domain(yext);

  const positions = oregonGeo.map(d => [x(d[0]), y(d[1])]);
  const indexes = positions.reduce((a, b, i) => {
    if (i + 1 < positions.length) a.push([i, i + 1]);
    return a;
  }, []);

  const elements = regl.elements({
    primitive: "lines",
    data: indexes
  });

  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  });

  drawLines({ elements, positions });
});
