const chroma = require('chroma-js/src/chroma');

// feel free to comment out anything to rollup
// a smaller chroma.js built

// io --> convert colors
require('chroma-js/src/io/hex');

// operators --> modify existing Colors
require('chroma-js/src/ops/alpha');

// interpolators
require('chroma-js/src/interpolator/rgb');

// generators -- > create new colors
chroma.blend = require('chroma-js/src/generator/blend');
chroma.mix = chroma.interpolate = require('chroma-js/src/generator/mix');
chroma.scale = require('chroma-js/src/generator/scale');

// other utility methods

// scale

module.exports = chroma;
