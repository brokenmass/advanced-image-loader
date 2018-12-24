const path = require('path');

module.exports = {
  entry: {
    index: path.join(__dirname, 'index.js')
  },
  module: {
    rules: [{
      test: /\.png$/i,
      loader: './',
      options: {
        width: 1280,
        srcset: [320, 640, 960, 1280, 1920],
        quality: 90,
        placeholder: 32,
        progressive: true
      }
    }]
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../demo-build/')
  }
};
