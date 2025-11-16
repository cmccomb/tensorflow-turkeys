let stream = null;

function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

const geometryHelpers = window.TurkeyGeometry;
if (!geometryHelpers) {
    throw new Error('TurkeyGeometry helpers are required but not available.');
}

const {computeFingerRadius, extractPolygonPoints} = geometryHelpers;

let videoWidth, videoHeight, rafID, ctx, canvas, ANCHOR_POINTS,
    fingerLookupIndices = {
        thumb: [0, 1, 2, 3, 4],
        indexFinger: [0, 5, 6, 7, 8],
        middleFinger: [0, 9, 10, 11, 12],
        ringFinger: [0, 13, 14, 15, 16],
        pinky: [0, 17, 18, 19, 20]
    };  // for rendering each finger as a polyline

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 500;
const mobile = isMobile();
// Don't render the point cloud on mobile in order to maximize performance and
// to avoid crowding limited screen space.

const state = {
    backend: 'webgl'
};

const FINGER_COLORS = {
    indexFinger: 'brown',
    middleFinger: 'red',
    ringFinger: 'darkorange',
    pinky: 'goldenrod',
    thumb: 'saddlebrown'
};


function drawPoint(y, x, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawKeypoints(keypoints) {
    const keypointsArray = keypoints;

    for (let i = 0; i < keypointsArray.length; i++) {
        const y = keypointsArray[i][0];
        const x = keypointsArray[i][1];
        drawPoint(x - 2, y - 2, 3);
    }

    const fingers = Object.keys(fingerLookupIndices);
    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i];
        const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
        drawPath(points, false);
    }
}

function drawPath(points, closePath) {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        region.lineTo(point[0], point[1]);
    }

    if (closePath) {
        region.closePath();
    }
    ctx.stroke(region);
}

function showError(message) {
    const info = document.getElementById('info');
    if (!info) {
        console.error(message);
        return;
    }
    info.textContent = message;
    info.classList.remove('d-none');
}

function stopCameraStream() {
    if (!stream) {
        return;
    }
    stream.getTracks().forEach(track => track.stop());
    stream = null;
}

let model;

async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.getElementById('video');
    stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            width: mobile ? undefined : VIDEO_WIDTH,
            height: mobile ? undefined : VIDEO_HEIGHT
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadVideo() {
    const video = await setupCamera();
    $("#spinner").html("");
    video.play();
    return video;
}

async function main() {
    await tf.setBackend(state.backend);
    model = await handpose.load();
    let video;

    try {
        video = await loadVideo();
    } catch (e) {
        showError(e.message);
        throw e;
    }

    // setupDatGui();

    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;

    canvas = document.getElementById('output');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;

    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // These anchor points allow the hand pointcloud to resize according to its
    // position in the input.
    ANCHOR_POINTS = [
        [0, 0, 0], [0, -VIDEO_HEIGHT, 0], [-VIDEO_WIDTH, 0, 0],
        [-VIDEO_WIDTH, -VIDEO_HEIGHT, 0]
    ];


    landmarksRealTime(video);
}

const landmarksRealTime = async (video) => {
    async function frameLandmarks() {
        canvas.width = videoWidth;
        const predictions = await model.estimateHands(video);
        if (predictions.length > 0) {
            const result = predictions[0].landmarks;
            clipImage(result);
        }

        ctx.drawImage(
            video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width,
            canvas.height);

        if (predictions.length > 0) {
            const result = predictions[0].landmarks;
            drawHand(result);
        }

        rafID = requestAnimationFrame(frameLandmarks);
    }

    frameLandmarks();
};


let btnCapture = document.getElementById('btn-capture');
btnCapture.addEventListener('click', captureSnapshot);

function captureSnapshot() {
    let newImage2 = new Image();
    newImage2.src = canvas.toDataURL('image/png');
    lc.saveShape(LC.createShape('Image', {x: 10, y: 10, image: newImage2}));
    stopCameraStream();
}


navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

main();


function clipImage(keypoints) {
    const radius = computeFingerRadius(keypoints);
    ctx.beginPath();
    clipPolygon(keypoints, [0, 1, 2, 5, 9, 13, 17, 0], radius);
    clipPolygon(keypoints, fingerLookupIndices.indexFinger, radius);
    clipPolygon(keypoints, fingerLookupIndices.middleFinger, radius);
    clipPolygon(keypoints, fingerLookupIndices.ringFinger, radius);
    clipPolygon(keypoints, fingerLookupIndices.pinky, radius);
    clipPolygon(keypoints, [2, 3], radius);
    clipPolygon(keypoints, [3, 4], radius);
    ctx.clip();
}

function drawHand(keypoints) {
    const radius = computeFingerRadius(keypoints);
    ctx.strokeStyle = 'rgba(0,0,0,0.0)';

    fillSegment(keypoints, fingerLookupIndices.indexFinger, FINGER_COLORS.indexFinger, radius);
    fillSegment(keypoints, fingerLookupIndices.middleFinger, FINGER_COLORS.middleFinger, radius);
    fillSegment(keypoints, fingerLookupIndices.ringFinger, FINGER_COLORS.ringFinger, radius);
    fillSegment(keypoints, fingerLookupIndices.pinky, FINGER_COLORS.pinky, radius);
    fillSegment(keypoints, [2, 3], FINGER_COLORS.thumb, radius);
    fillSegment(keypoints, [3, 4], FINGER_COLORS.thumb, radius);

    ctx.beginPath();
    ctx.fillStyle = FINGER_COLORS.thumb;
    clipPolygon(keypoints, [0, 1, 2, 5, 9, 13, 17, 0], radius);
    ctx.fill();
}

function fillSegment(keypoints, indices, color, radius) {
    ctx.beginPath();
    ctx.fillStyle = color;
    clipPolygon(keypoints, indices, radius);
    ctx.fill();
}

function clipPolygon(keypoints, idxs, radius) {
    const points = extractPolygonPoints(keypoints, idxs);
    const offset = new Offset();
    const polygons = offset.data(points).margin(radius);
    const polygon = polygons[0] || points;
    if (!polygon || polygon.length === 0) {
        return;
    }
    ctx.moveTo(polygon[0][0], polygon[0][1]);
    for (let i = 1; i < polygon.length; i++) {
        ctx.lineTo(polygon[i][0], polygon[i][1]);
    }
    ctx.stroke();
}
