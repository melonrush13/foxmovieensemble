/**
 * Custom build script to monkey-patch code-splitting out of production builds
 * @see https://github.com/facebook/create-react-app/issues/5306
 */
const rewire = require("rewire");
const defaults = rewire("react-scripts/scripts/build.js");
let config = defaults.__get__("config");

config.optimization.splitChunks = {
  cacheGroups: {
    default: false
  }
};

config.optimization.runtimeChunk = false; // Disable chunks
config.output.filename = 'static/js/[name].js' // disable hashed filenames
