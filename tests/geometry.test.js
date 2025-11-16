const geometry = require('../handpose/geometry.js');

describe('Turkey geometry helpers', () => {
  describe('computeFingerRadius', () => {
    it('computes half the distance between anchors', () => {
      const keypoints = Array.from({ length: 21 }, (_, index) => [index, index]);
      keypoints[5] = [0, 0];
      keypoints[9] = [6, 8];
      expect(geometry.computeFingerRadius(keypoints)).toBeCloseTo(5);
    });

    it('throws when anchors are missing', () => {
      expect(() => geometry.computeFingerRadius([])).toThrow(/non-empty/);
    });
  });

  describe('extractPolygonPoints', () => {
    it('extracts points in the requested order', () => {
      const keypoints = [[1, 2], [3, 4], [5, 6], [7, 8]];
      expect(geometry.extractPolygonPoints(keypoints, [3, 1])).toEqual([
        [7, 8],
        [3, 4],
      ]);
    });

    it('validates the provided indices', () => {
      const keypoints = [[1, 1]];
      expect(() => geometry.extractPolygonPoints(keypoints, [])).toThrow(/non-empty/);
    });
  });
});
