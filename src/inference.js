const tfjs = require('@tensorflow/tfjs-node');

function loadModel() {
    const modelUrl = "file://models/model.json";
    return tfjs.loadLayersModel(modelUrl);
}

module.exports = { loadModel };