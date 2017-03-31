const serialize = function (obj, indentation = 2) {
  const preSpaces = ' '.repeat(indentation);
  const postSpaces = ' '.repeat(indentation - 2);

  if (Array.isArray(obj)) {
    const contents = obj
      .map((element) => `${preSpaces}${serialize(element, indentation + 2)}`).join(',\n');

    return `[\n${contents}\n${postSpaces}]`;
  } else if (Object.prototype.toString.call(obj) === '[object Object]') {
    const contents = Object.keys(obj)
      .filter((key) => Boolean(obj[key]))
      .map((key) => `${preSpaces}${key}: ${serialize(obj[key], indentation + 2)}`).join(',\n');

    return `{\n${contents}\n${postSpaces}}`;
  }
  return obj;
};

const serializeOutput = function (data) {
  const output = {
    src: data.main.src,
    width: data.main.width,
    height: data.main.height,
    toString: `function() {return ${data.main.src};}`
  };

  if (data.srcset) {
    const srcset = data.srcset
      .filter((value, index, array) => array.indexOf(value) === index)
      .map((image) => `${image.src} + " ${image.width}w"`)
      .join(', ');

    output.srcset = `[${srcset}].join(', ')`;
  }

  if (data.placeholder) {
    output.placeholder = data.placeholder;
  }

  output.images = [data.main].concat(data.srcset || [])
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort((imageA, imageB) => imageA.width - imageB.width);

  return serialize(output);
};


module.exports = serializeOutput;
