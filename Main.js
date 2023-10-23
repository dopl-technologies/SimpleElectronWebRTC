const { app, BrowserWindow, ipcMain } = require('electron');
const { pubnub, createPeerConnection } = require('./pubnub'); // Import the PubNub-related code from pubnub.js

let mainWindow;
let localStream;
let peerConnection;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

ipcMain.on('start-call', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    mainWindow.webContents.send('local-video', stream);

    localStream = stream;

    createPeerConnection();
  } catch (err) {
    console.error('Error accessing camera and microphone:', err);
    mainWindow.webContents.send('error', 'Failed to access camera and microphone.');
  }
});


