const sharp = require('sharp');
const { toBase64, toFile } = require('./outputs');
const promiseAllMap = require('./utils/promiseAllMap');

const process = function ({ image, options, width }) {
  return new Promise((resolve, reject) => {
    let processingImage = image.clone();

    if (width !== 'original') {
      processingImage = processingImage
        .withoutEnlargement(true)
        .resize(width, null);
    }

    processingImage
      .toFormat({
        id: options.format,
        force: true,
        quality: options.quality
      })
      .toBuffer((error, buffer, info) => {
        /* istanbul ignore if */
        if (error) {
          reject(error);
        } else {
          resolve({ buffer, info });
        }
      });
  });
};

const createCachedProcessor = function ({ image, loaderContext, metadata, options }) {
  const cache = {};

  return (width) => {
    const actualWidth = width >= metadata.width ? 'original' : width;

    if (!cache[actualWidth]) {
      cache[actualWidth] = process({
        options,
        image,
        width: actualWidth
      })
      .then((data) => toFile(loaderContext, options, data));
    }

    return cache[actualWidth];
  };
};

const processImage = function (loaderContext, path, options) {
  const image = sharp(path);

  return image
    .metadata()
    .then((metadata) => {
      const processor = createCachedProcessor({ image, loaderContext, metadata, options });
      const output = {};

      output.main = processor(options.width);

      if (Array.isArray(options.srcset)) {
        output.srcset = Promise.all(options.srcset.map(processor));
      }

      if (options.placeholder) {
        output.placeholder = process({
          options: {
            format: 'png'
          },
          image,
          width: options.placeholder,
        })
        .then((data) => toBase64(loaderContext, options, data));
      }

      return promiseAllMap(output);
    });
};

module.exports = processImage;
