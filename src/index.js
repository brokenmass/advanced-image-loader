const loaderUtils = require('loader-utils');
const validateOptions = require('./validateOptions');
const processImage = require('./processImage');
const serializeOutput = require('./serializeOutput');

const DEFAULTS = {
  format: 'jpeg',
  name: '[name]-[width]@[quality]',
  width: 'original',
  quality: 95,
  progressive: false
};

const tryParse = function (width) {
  return Number(width) || width;
};

const normalizeOptions = function (options) {
  /* eslint-disable no-param-reassign */

  options.placeholder = tryParse(options.placeholder);
  options.quality = tryParse(options.quality);
  options.width = tryParse(options.width);

  if (Array.isArray(options.srcset)) {
    options.srcset = options.srcset.map(tryParse);
  }

  return options;
};

const loader = function () {
  /* istanbul ignore if */
  if (this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();
  const loaderOptions = loaderUtils.getOptions(this);
  const resurceOptions = loaderUtils.parseQuery(this.resourceQuery || '?');

  const options = normalizeOptions(Object.assign({}, DEFAULTS, loaderOptions, resurceOptions));

  validateOptions(options)
    .then(() => processImage(this, this.resourcePath, options))
    .then((output) => serializeOutput(output))
    .then((body) => callback(null, `module.exports = ${body};`))
    .catch((error) => callback(error));
};

module.exports = loader;
