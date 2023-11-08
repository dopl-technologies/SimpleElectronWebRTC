//This file is the preload script. It exposes the Node.js API to the renderer process.
//The code uses the contextBridge module to expose a specific set of Node.js APIs to the renderer process. 
//This is a more secure approach, as it allows you to restrict the permissions of the renderer process.
//For example, you could use the contextBridge module to expose only the ipcRenderer module to the renderer process. 
//This would prevent the renderer process from accessing any other Node.js modules.

const {
  contextBridge,
  ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "ipcRenderer", {
      send: (channel, data) => {
          // whitelist channels
          let validChannels = ["toMain"];
          if (validChannels.includes(channel)) {
              ipcRenderer.send(channel, data);
          }
      },
      on: (channel, func) => {
          let validChannels = ["fromMain"];
          if (validChannels.includes(channel)) {
              // Deliberately strip event as it includes `sender` 
              ipcRenderer.on(channel, (event, ...args) => func(...args));
          }
      }
  }
);