const { app, BrowserWindow, ipcMain } = require('electron');
const PubNub = require('pubnub');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library

const publishKey = 'pub-c-d8e5e5ee-1234-47e1-8986-4fb7f1a7e6f1';
const subscribeKey = 'sub-c-cd13ae42-d352-4daf-927e-cead3be9595d';

const pubnub = new PubNub({
  publishKey,
  subscribeKey,
  uuid: uuidv4(), // Generate a UUID using uuidv4
});

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

function createPeerConnection() {
  peerConnection = new RTCPeerConnection();

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      pubnub.publish({
        channel: 'webrtc',
        message: { iceCandidate: event.candidate },
      });
    }
  };

  pubnub.addListener({
    message: async message => {
      if (message.message.sdp) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.message.sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        pubnub.publish({
          channel: 'webrtc',
          message: { sdp: answer },
        });
      } else if (message.message.iceCandidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.message.iceCandidate));
      } else if (message.message.remoteStream) {
        mainWindow.webContents.send('remote-video', message.message.remoteStream);
      }
    },
  });

  pubnub.subscribe({ channels: ['webrtc'] });
}
