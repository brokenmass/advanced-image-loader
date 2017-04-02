# advanced-image-loader

[![Build Status](https://travis-ci.org/brokenmass/advanced-image-loader.svg?branch=master)](https://travis-ci.org/brokenmass/advanced-image-loader)

Advanced webpack2 image loader with support for image resizing, srcset and inlined placeholder.
Thanks to [sharp](https://github.com/lovell/sharp) it's blazing fast (see [benchmars](docs/benchmarks.md))!

## Install

```
npm install advanced-image-loader --save-dev
```

## Usage

Require in your javascript
```js
import image from `advanced-image-loader!image.jpg?width=400
  &quality=90
  &placeholder=32
  &srcset[]=200&srcset[]=400&srcset[]=800`;

// generates images
// test-200@90.jpg
// test-400@90.jpg
// test-800@90.jpg
// and image object is
{
  "src": "test-400@90",
  "width": 400,
  "height": 225,
  "srcset": "test-200@90 200w, test-400@90 400w, test-800@90 800w",
  "placeholder": {
    "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAASCAYAAAA6yNxSAAAACXBIWXMAAAsSAAALEgHS3X78AAAAh0lEQVRIie3SMQpDIRBF0euoA4L7X5W70WJANClCQlKa/GDjK0fxHRhDKeXGxsjO8gM4gAMACCuXW2uEEJhz4r3HzFDV17mI4Jz7mF0KAKi1AuCcY4yBqmJmmBnee1T1f4CcMzlnAOaciDw2mFICoPdOjHHlye//wLP8PavlPwGuygEcwHbAHUfTHurTFT+dAAAAAElFTkSuQmCC",
    "width": 32,
    "height": 18
  },
  "images": [
    {
      "src": "test-200@90",
      "width": 200,
      "height": 113
    },
    {
      "src": "test-400@90",
      "width": 400,
      "height": 225
    },
    {
      "src": "test-800@90",
      "width": 800,
      "height": 450
    }
  ]
};

// image object toString return the main image src
image.toString() === "test-400@90"

```

or css
```css
.image {
  background: url('advanced-image-loader!image.jpg');
}
.imageLQ {
  background: url('advanced-image-loader!image.jpg?quality=30');
}

@media (max-width: 480px) {
  .image {
    background: url('advanced-image-loader!image.jpg?width=480');
  }
}
```


## Configuration

All the parameter can be set as webpack rule option or defined on a per resource base using resourceQuery parameters.
In case a configuration parameter is defined in both location the resourceQuery has higher priority.

- `width: integer or 'original'` `default: 'original'`: define the output width of the 'main' image
- `srcset: array of 'widths' (integer or 'original')`: if specified define the width of all the images in the srcset
- `format: string` `default: 'jpeg'`: define the output format of the images (valid values are `jpeg`, `png`, `tiff`, `webp`)
- `quality: integer` `default: '95'`: define the compression quality (ignored if format is `png`)
- `placeholder: integer`: if specified define the width of the image used as placeholder and inlined as data URI


## Examples

** webpack.config.js options **
```js
module.exports = {
  entry: {...},
  output: {...},
  module: {
    rules: [
      {
        test: /\.(jpg)$/i,
        loader: 'advanced-image-loader',
        options: {
          width: 1280,
          srcset: [320, 640, 960, 1280, 1920],
          quality: 90,
          placeholder: 32
        }
      }
    ]
  }
}
```

** resourceQuery overrides **
see [here](https://github.com/webpack/loader-utils#parsequery) for more information about resourceQuery syntax

```js
// only webpack rule options apply.
import image from './image.jpg';

// override previous configuration lowering output quality and disabling srcset and placeholder. only the main image, 1280px wide and 25% quality will be returned
import imageLQ from './image.jpg?quality=25&-srcset&-placeholder';

// generate additional image 2048px wide
import imageHighRes from './image.jpg?width=2048&-srcset&-placeholder';
```


## Based and inspired by:

- [responsive-loader](https://github.com/herrstucki/responsive-loader)
- [resize-image-loader](https://github.com/puppybits/resize-image-loader)
- [file-loader](https://github.com/webpack-contrib/file-loader)
