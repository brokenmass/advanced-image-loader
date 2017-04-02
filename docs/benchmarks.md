# Results

- `AIL`: advanced-image-loader
- `RL`: [responsive-loader](https://github.com/herrstucki/responsive-loader)
- `RIL`: [resize-image-loader](https://github.com/puppybits/resize-image-loader)

## Execution time

| AIL | RL | RIL |
| -: | -: | -: |
| 2.634s | 26.280s **(+897%)**| 6.041s **(+129%)**|

## File Sizes
| Output file | AIL | RL | RIL |
| -: | -: | -: | -: |
|    main.js | 7.99 kB | 10.4 kB **(+30.1%)**| 3.98 kB *|
|  1-320.jpg | 24.7 kB | 32.6 kB **(+31.9%)**|  111 kB **(+349%)**|
|  1-640.jpg | 90.6 kB |  118 kB **(+30.2%)**|  357 kB **(+294%)**|
|  1-960.jpg |  186 kB |  246 kB **(+32.2%)**|  731 kB **(+293%)**|
| 1-1280.jpg |  322 kB |  416 kB **(+29.1%)**| 1.24 MB **(+285%)**|
| 1-1920.jpg |  649 kB |  838 kB **(+29.1%)**| 2.56 MB **(+294%)**|
|  2-320.jpg | 31.5 kB | 39.3 kB **(+24.7%)**|  125 kB **(+296%)**|
|  2-640.jpg |  118 kB |  140 kB **(+18.6%)**|  379 kB **(+221%)**|
|  2-960.jpg |  248 kB |  293 kB **(+18.1%)**|  770 kB **(+210%)**|
| 2-1280.jpg |  440 kB |  496 kB **(+12.7%)**| 1.31 MB **(+197%)**|
| 2-1920.jpg |  894 kB |  993 kB **(+11.0%)**|  2.7 MB **(+202%)**|
|  3-320.jpg | 31.9 kB | 44.2 kB **(+38.5%)**|  139 kB **(+335%)**|
|  3-640.jpg |  129 kB |  178 kB **(+37.9%)**|  476 kB **(+268%)**|
|  3-960.jpg |  300 kB |  392 kB **(+30.6%)**| 1.01 MB **(+236%)**|
| 3-1280.jpg |  520 kB |  668 kB **(+28.4%)**|  1.7 MB **(+226%)**|
| 3-1920.jpg |  1.1 MB | 1.33 MB **(+20.9%)**| 3.45 MB **(+213%)**|

* resize-image-loader javascript output is much smaller as it does not contains the inlined placeholder data because of  [this issue](https://github.com/puppybits/resize-image-loader/pull/3)

# Test

## Test images

- Image 1: Resolution 4752 × 3168, Size 10.4MB
- Image 2: Resolution 4752 × 3168, Size 9.5MB
- Image 3: Resolution 2647 × 1772, Size 5.2MB

## Output resolutions (widths)
- srcset: 320px, 640px, 960px, 1280px, 1920px
- placeholder: 32px

## index.js

```js
import './assets/1.jpg'
import './assets/2.jpg'
import './assets/3.jpg'
```

## package.json

```JSON
{
  "name": "advanced-image-loader-benchmark",
  "scripts": {
    "build:AIL": "time NODE_ENV=AIL webpack",
    "build:RL": "time NODE_ENV=RL webpack",
    "build:RIL": "time NODE_ENV=RIL webpack",
    "start": "npm run build:AIL && npm run build:RL && npm run build:RIL"
  },
  "dependencies": {
    "gm": "^1.23.0",
    "jimp": "^0.2.27",
    "resize-image-loader": "^1.0.2",
    "responsive-loader": "^0.7.0",
    "webpack": "^2.3.2"
  }
}

```

## webpack.config.js

```js
const path = require('path');

module.exports = {
  entry: './index.js',
  module: {
    rules: [{
      test: {
        and: [
          () => process.env.NODE_ENV === 'RL',
          /\.jpg$/i,
        ]
      },
      loader: 'responsive-loader',
      options: {
        name: '[name]-[width].',
        sizes: [320, 640, 960, 1280, 1920],
        quality: 90,
        placeholder: true,
        placeholderSize: 32
      }
    },
    {
      test: {
        and: [
          () => process.env.NODE_ENV === 'AIL',
          /\.jpg$/i,
        ]
      },
      loader: 'advanced-image-loader',
      options: {
        name: '[name]-[width]',
        width: 1280,
        srcset: [320, 640, 960, 1280, 1920],
        quality: 90,
        placeholder: 32
      }
    },
    {
      test: {
        and: [
          () => process.env.NODE_ENV === 'RIL',
          /\.jpg$/i,
        ]
      },
      loader: 'resize-image-loader',
      options: {
        sizes: [320, 640, 960, 1280, 1920],
        placeholder: 32
      }
    },
  ]
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'build', process.env.NODE_ENV)
  }
};
```
