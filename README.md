# TensorFlow Turkey

Modern hand turkeys for the 21st century.

The app combines TensorFlow.js handpose detection with Literally Canvas so you can trace your hand in augmented reality and save it alongside your doodles.

## Getting started

1. Install the JavaScript dependencies (only required for running tests):

   ```bash
   npm install
   ```

2. Serve the repository with your favorite static file server. A quick option is [`http-server`](https://www.npmjs.com/package/http-server):

   ```bash
   npx http-server -c-1 .
   ```

3. Open `http://localhost:8080` in a modern browser (Chrome, Edge, Safari, or Firefox) and allow camera access when prompted.

## Features

- **Live hand tracking** powered by `@tensorflow-models/handpose`.
- **Camera safety** – the stream stops as soon as you capture your turkey to avoid leaving your webcam on.
- **Accessible error feedback** thanks to a dedicated status banner.
- **Modular geometry helpers** with automated Jest tests for regression coverage.

## Testing

Geometry utilities that power the drawing pipeline are covered with Jest. Run the suite via:

```bash
npm test
```

## Credits

- [TensorFlow.js handpose model](https://github.com/tensorflow/tfjs-models/tree/master/handpose)
- [Polygon Offset](https://github.com/w8r/polygon-offset)
- [Literally Canvas](http://literallycanvas.com/)
- [How To Capture Image From Camera Using JavaScript](https://html5.tutorials24x7.com/blog/how-to-capture-image-from-camera)
