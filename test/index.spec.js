const sharp = require('sharp');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const snapshot = require('snap-shot');
const path = require('path');

const advancedImageLoader = require('../');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

function requireImage(resource, options = {}) {
  const [resourcePath, resourceQuery] = resource.split('?');

  return new Promise((resolve, reject) => {
    const emitFileSpy = sinon.spy();
    const asyncCallback = (err, result) => {
      // wait until sharp process are completed
      while (sharp.counters().process !== 0);
      if (err) {
        reject(err);
      } else {
        resolve({ result, emitFileSpy });
      }
    };

    const context = {
      async: () => asyncCallback,
      resourcePath: path.resolve(__dirname, resourcePath),
      query: options,
      resourceQuery: resourceQuery ? `?${resourceQuery}` : '',
      emitFile: emitFileSpy
    };

    advancedImageLoader.call(context);
  });
}


describe('advanced-image-loader', () => {
  it('should used the default configuration', () => requireImage('./assets/test.png')
      .then(({ result, emitFileSpy }) => {
        emitFileSpy.should.have.been.calledWith('test-1600@95.jpg', sinon.match.instanceOf(Buffer));
        snapshot(result);
      }));

  describe('width', () => {
    it('width should be configurable using loader options', () => requireImage('./assets/test.png', { width: 400 })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-400@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('width should be configurable using resourceQuery options', () => requireImage('./assets/test.png?width=400')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-400@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('width should priotitize resourceQuery over loader options', () => requireImage('./assets/test.png?width=400', { width: 800 })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-400@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('width should accept alias value "original"', () => requireImage('./assets/test.png?width=original')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-1600@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('width should not enlarge original image', () => requireImage('./assets/test.png?width=3200')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-1600@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    [
      ['./assets/test.png', { width: 'invalid' }],
      ['./assets/test.png', { width: '200w' }],
      ['./assets/test.png', { width: null }],
      ['./assets/test.png', { width: 0 }],
      ['./assets/test.png', { width: -10 }],
      ['./assets/test.png', { width: undefined }],
      ['./assets/test.png', { width: { invalid: 200 } }],
      ['./assets/test.png?width=invalid'],
      ['./assets/test.png?width=0'],
      ['./assets/test.png?width=-10'],
      ['./assets/test.png?width=200w']
    ]
    .forEach((testCase) => {
      it(`width should be validated ${JSON.stringify(testCase)}`, () => requireImage.apply(this, testCase)
          .catch((error) => {
            snapshot(error.message);
            throw error;
          })
          .should.be.rejected);
    });
  });

  describe('srcset', () => {
    it('srcset should be configurable using loader options', () => requireImage('./assets/test.png', { srcset: [400, 600, 800] })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(4);
          emitFileSpy.should.have.been.calledWith('test-400@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-600@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-800@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-1600@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('srcset should be configurable using resourceQuery options', () => requireImage('./assets/test.png?srcset[]=400&srcset[]=600&srcset[]=800')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(4);
          emitFileSpy.should.have.been.calledWith('test-400@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-600@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-800@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-1600@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('srcset should priotitize resourceQuery over loader options', () => requireImage('./assets/test.png?srcset[]=400&srcset[]=600&srcset[]=800', { srcset: [100, 200, 300] })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(4);
          emitFileSpy.should.have.been.calledWith('test-400@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-600@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-800@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-1600@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('srcset should not cause the same file to be emitted twice', () => requireImage('./assets/test.png?width=400&srcset[]=400&srcset[]=600&srcset[]=800')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(3);
          emitFileSpy.should.have.been.calledWith('test-400@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-600@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-800@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('srcset values bigger that the image width should be ignored', () => requireImage('./assets/test.png?srcset[]=800&srcset[]=1600&srcset[]=3200')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(2);
          emitFileSpy.should.have.been.calledWith('test-800@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-1600@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('srcset should accept alias value "original"', () => requireImage('./assets/test.png?srcset[]=200&srcset[]=original')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.been.calledWith('test-200@95.jpg', sinon.match.instanceOf(Buffer));
          emitFileSpy.should.have.been.calledWith('test-1600@95.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    [
      ['./assets/test.png', { srcset: 'invalid' }],
      ['./assets/test.png', { srcset: [100, 200, 'invalid'] }],
      ['./assets/test.png', { srcset: [100, 200, 0] }],
      ['./assets/test.png', { srcset: [100, 200, -10] }],
      ['./assets/test.png', { srcset: null }],
      ['./assets/test.png', { srcset: { 100: 100, 200: 200 } }],
      ['./assets/test.png?srcset=invalid'],
      ['./assets/test.png?srcset=200w'],
      ['./assets/test.png?srcset[]=200&srcset[]=0'],
      ['./assets/test.png?srcset[]=200&srcset[]=-10'],
      ['./assets/test.png?srcset[]=200&srcset[]=invalid'],
      ['./assets/test.png?srcset[]=2AA00&srcset[]=300'],
    ]
    .forEach((testCase) => {
      it(`srcset should be validated ${JSON.stringify(testCase)}`, () => requireImage.apply(this, testCase)
          .catch((error) => {
            snapshot(error.message);
            throw error;
          })
          .should.be.rejected);
    });
  });

  describe('placeholder', () => {
    it('placeholder should be configurable using loader options', () => requireImage('./assets/test.png', { placeholder: 32 })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          snapshot(result);
        }));

    it('placeholder should be configurable using resourceQuery options', () => requireImage('./assets/test.png?placeholder=32')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          snapshot(result);
        }));

    it('placeholder should priotitize resourceQuery over loader options', () => requireImage('./assets/test.png?placeholder=32', { placeholder: 64 })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          snapshot(result);
        }));

    [
      ['./assets/test.png', { placeholder: 'invalid' }],
      ['./assets/test.png', { placeholder: '200w' }],
      ['./assets/test.png', { placeholder: null }],
      ['./assets/test.png', { placeholder: -10 }],
      ['./assets/test.png', { placeholder: 400 }],
      ['./assets/test.png', { placeholder: { invalid: 200 } }],
      ['./assets/test.png?placeholder=invalid'],
      ['./assets/test.png?placeholder=-10'],
      ['./assets/test.png?placeholder=200w'],
      ['./assets/test.png?placeholder=400']
    ]
    .forEach((testCase) => {
      it(`placeholder should be validated ${JSON.stringify(testCase)}`, () => requireImage.apply(this, testCase)
          .catch((error) => {
            snapshot(error.message);
            throw error;
          })
          .should.be.rejected);
    });
  });

  describe('quality', () => {
    it('quality should be configurable using loader options', () => requireImage('./assets/test.png', { quality: 80 })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-1600@80.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('quality should be configurable using resourceQuery options', () => requireImage('./assets/test.png?quality=80')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-1600@80.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('quality should priotitize resourceQuery over loader options', () => requireImage('./assets/test.png?quality=40', { quality: 80 })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-1600@40.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    [
      ['./assets/test.png', { quality: 'invalid' }],
      ['./assets/test.png', { quality: '200w' }],
      ['./assets/test.png', { quality: null }],
      ['./assets/test.png', { quality: undefined }],
      ['./assets/test.png', { quality: 0 }],
      ['./assets/test.png', { quality: -10 }],
      ['./assets/test.png', { quality: 200 }],
      ['./assets/test.png', { quality: { invalid: 200 } }],
      ['./assets/test.png?quality=invalid'],
      ['./assets/test.png?quality=-10'],
      ['./assets/test.png?quality=0'],
      ['./assets/test.png?quality=200w'],
      ['./assets/test.png?quality=200']
    ]
    .forEach((testCase) => {
      it(`quality should be validated ${JSON.stringify(testCase)}`, () => requireImage.apply(this, testCase)
          .catch((error) => {
            snapshot(error.message);
            throw error;
          })
          .should.be.rejected);
    });
  });

  describe('format', () => {
    it('format should be configurable using loader options', () => requireImage('./assets/test.png', { format: 'webp' })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-1600@95.webp', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('format should be configurable using resourceQuery options', () => requireImage('./assets/test.png?format=webp')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-1600@95.webp', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('format should priotitize resourceQuery over loader options', () => requireImage('./assets/test.png?format=png', { format: 'webp' })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('test-1600@95.png', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    [
      ['./assets/test.png', { format: 'invalid' }],
      ['./assets/test.png', { format: null }],
      ['./assets/test.png', { format: undefined }],
      ['./assets/test.png', { format: 400 }],
      ['./assets/test.png', { format: { invalid: 200 } }],
      ['./assets/test.png?format=invalid'],
      ['./assets/test.png?format=400']
    ]
    .forEach((testCase) => {
      it(`format should be validated ${JSON.stringify(testCase)}`, () => requireImage.apply(this, testCase)
          .catch((error) => {
            snapshot(error.message);
            throw error;
          })
          .should.be.rejected);
    });
  });

  describe('name', () => {
    it('name should be configurable using loader options', () => requireImage('./assets/test.png', { name: 'image' })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('image.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('name should be configurable using resourceQuery options', () => requireImage('./assets/test.png?name=image')
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('image.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('name should priotitize resourceQuery over loader options', () => requireImage('./assets/test.png?name=otherimage', { name: 'image' })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('otherimage.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        }));

    it('name can be a function', () => {
      const nameFunction = (data) => {
        // ignore buffer and make path relative in the snapshot
        snapshot(Object.assign(data, {
          buffer: 'buffer',
          resourcePath: path.relative(__dirname, data.resourcePath)
        }));
        return 'image';
      };

      return requireImage('./assets/test.png', { name: nameFunction })
        .then(({ result, emitFileSpy }) => {
          emitFileSpy.should.have.callCount(1);
          emitFileSpy.should.have.been.calledWith('image.jpg', sinon.match.instanceOf(Buffer));
          snapshot(result);
        });
    });

    [
      ['./assets/test.png', { name: null }],
      ['./assets/test.png', { name: undefined }],
      ['./assets/test.png', { name: 400 }],
      ['./assets/test.png', { name: { invalid: 200 } }],
      ['./assets/test.png?name=']
    ]
    .forEach((testCase) => {
      it(`name should be validated ${JSON.stringify(testCase)}`, () => requireImage.apply(this, testCase)
          .catch((error) => {
            snapshot(error.message);
            throw error;
          })
          .should.be.rejected);
    });
  });
});
