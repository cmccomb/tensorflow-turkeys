(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TurkeyGeometry = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function assertValidKeypoints(keypoints) {
    if (!Array.isArray(keypoints) || keypoints.length === 0) {
      throw new Error('Expected a non-empty array of keypoints.');
    }
  }

  function computeFingerRadius(keypoints) {
    assertValidKeypoints(keypoints);
    const first = keypoints[5];
    const second = keypoints[9];
    if (!Array.isArray(first) || !Array.isArray(second)) {
      throw new Error('Keypoints are missing the expected thumb/index anchors.');
    }
    const dx = first[0] - second[0];
    const dy = first[1] - second[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance * 0.5;
  }

  function extractPolygonPoints(keypoints, indices) {
    assertValidKeypoints(keypoints);
    if (!Array.isArray(indices) || indices.length === 0) {
      throw new Error('Expected a non-empty list of indices.');
    }

    return indices.map((index) => {
      const keypoint = keypoints[index];
      if (!Array.isArray(keypoint)) {
        throw new Error(`Missing keypoint for index ${index}.`);
      }
      return [keypoint[0], keypoint[1]];
    });
  }

  return {
    computeFingerRadius,
    extractPolygonPoints,
  };
});
