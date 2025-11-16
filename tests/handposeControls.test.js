const mockGeometry = {
  computeFingerRadius: jest.fn(),
  extractPolygonPoints: jest.fn(() => [])
};

function createDomStubs() {
  global.window = {
    __turkeyDisableAutostart: true,
    TurkeyGeometry: mockGeometry
  };
  global.document = {
    getElementById: jest.fn(() => null)
  };
  global.navigator = {};
}

describe('Turkey handpose controls', () => {
  beforeEach(() => {
    jest.resetModules();
    createDomStubs();
    global.cancelAnimationFrame = jest.fn();
  });

  it('stops the webcam stream and animation loop when requested', () => {
    const mockTrack = {stop: jest.fn()};
    const mockStream = {getTracks: jest.fn(() => [mockTrack])};

    const handposeModule = require('../handpose/main.js');
    handposeModule.__setStream(mockStream);
    handposeModule.__setRafID(42);

    handposeModule.stopTurkeyExperience();

    expect(mockStream.getTracks).toHaveBeenCalledTimes(1);
    expect(mockTrack.stop).toHaveBeenCalledTimes(1);
    expect(global.cancelAnimationFrame).toHaveBeenCalledWith(42);
  });
});
