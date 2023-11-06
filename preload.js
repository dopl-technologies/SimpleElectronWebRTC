//This file is the preload script. It exposes the Node.js API to the renderer process.
//The code uses the contextBridge module to expose a specific set of Node.js APIs to the renderer process. 
//This is a more secure approach, as it allows you to restrict the permissions of the renderer process.
//For example, you could use the contextBridge module to expose only the ipcRenderer module to the renderer process. 
//This would prevent the renderer process from accessing any other Node.js modules.

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('nodeApi', {
  require: require
});

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for the nodeApi object to be defined
  await window.nodeApi.ready;

  // Require the Node.js require() function
  const require = window.nodeApi.require;
});

