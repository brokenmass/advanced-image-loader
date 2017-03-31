const loaderUtils = require('loader-utils');

const toFile = function (loaderContext, options, { buffer, info }) {
  const extension = info.format === 'jpeg' ? 'jpg' : info.format;

  let fileName;
  if (typeof options.name === 'function') {
    fileName = options.name({
      buffer,
      info: Object.assign({}, info),
      options: Object.assign({}, options),
      resourcePath: loaderContext.resourcePath,
    });
  } else {
    fileName = loaderUtils.interpolateName(loaderContext, options.name, {
      content: buffer
    })
    .replace(/\[height\]/g, info.height)
    .replace(/\[width\]/g, info.width)
    .replace(/\[quality\]/g, options.quality);
  }

  loaderContext.emitFile(`${fileName}.${extension}`, buffer);

  return {
    src: `__webpack_public_path__ + ${JSON.stringify(fileName)}`,
    width: info.width,
    height: info.height
  };
};

const toBase64 = function (loaderContext, options, { buffer, info }) {
  const dataUri = `data:image/${info.format};base64,${buffer.toString('base64')}`;

  return {
    src: JSON.stringify(dataUri),
    width: info.width,
    height: info.height
  };
};

module.exports = {
  toFile,
  toBase64
};
