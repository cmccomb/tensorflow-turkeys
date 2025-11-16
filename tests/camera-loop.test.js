const geometry = require('../handpose/geometry.js');

describe('camera loop controls', () => {
  const loadModule = () => {
    jest.resetModules();
    global.window = { TurkeyGeometry: geometry };
    global.document = {
      getElementById: jest.fn(() => null),
    };
    global.navigator = {
      userAgent: 'node',
      mediaDevices: null,
      getUserMedia: jest.fn(),
    };
    global.requestAnimationFrame = jest.fn();
    global.cancelAnimationFrame = jest.fn();
    return require('../handpose/main.js');
  };

  it('safely loads even when TensorFlow globals are missing', () => {
    expect(() => loadModule()).not.toThrow();
  });

  it('cancels pending animation frames when stopping the camera stream', () => {
    const handposeMain = loadModule();
    const fakeTrack = { stop: jest.fn() };
    handposeMain.__setStreamForTesting({
      getTracks: () => [fakeTrack],
    });
    handposeMain.__setAnimationLoopStateForTesting({ rafId: 42, isLoopActive: true });

    handposeMain.stopCameraStream();

    expect(global.cancelAnimationFrame).toHaveBeenCalledWith(42);
    expect(fakeTrack.stop).toHaveBeenCalledTimes(1);
    expect(handposeMain.__getAnimationLoopStateForTesting()).toEqual({
      rafID: null,
      isAnimationLoopActive: false,
    });
  });
});
