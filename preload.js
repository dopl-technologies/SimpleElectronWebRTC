//This file is the preload script. It exposes the Node.js API to the renderer process.

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  require: require,
});
