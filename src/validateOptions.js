const schema = require('../schemas/advancedImageLoaderSchema.json');
const Ajv = require('ajv');
const ajvKeywords = require('ajv-keywords');

const ajv = new Ajv({
  errorDataPath: 'configuration',
  allErrors: true,
  verbose: true
});
ajvKeywords(ajv, ['instanceof']);

const validate = ajv.compile(schema);

const errorDefinitions = {
  '.format': 'option "format" must be a supported format ["jpeg", "png", "tiff" or "webp"]',
  '.name': 'option "name" must be either a non empty string or a function',
  '.placeholder': 'option "placeholder" must be a integer between 1 and 160',
  '.quality': 'option "quality" must be a integer between 1 and 100',
  '.srcset': 'option "srcset" must be an array of valid widths [positive integer or "original" string]',
  '.width': 'option "width" must be a valid width [positive integer or "original" string]',
};

const toErrorMessage = function (errors) {
  const missing = {};
  const invalid = {};
  errors.forEach((error) => {
    if (error.keyword === 'required') {
      const missingProperty = error.params.missingProperty;
      missing[missingProperty] = true;
    } else {
      const baseDataPath = error.dataPath.split('[')[0];
      invalid[baseDataPath] = true;
    }
  });

  const missingMessages = Object.keys(missing)
    .map((property) => `Missing REQUIRED option "${property}"`);

  const invalidMessages = Object.keys(invalid)
    .map((dataPath) => errorDefinitions[dataPath]);

  return missingMessages
    .concat(invalidMessages)
    .map((message) => `    - ${message}`)
    .join('\n');
};

const validateOptions = function (options) {
  return new Promise((resolve, reject) => {
    if (validate(options)) {
      resolve();
    } else {
      const errorMessage = toErrorMessage(validate.errors);

      reject(new Error(`advanced-image-loader options validation error:\n${errorMessage}`));
    }
  });
};

module.exports = validateOptions;
