const { app, BrowserWindow, ipcMain } = require('electron');
const PubNub = require('pubnub');

const publishKey = 'pub-c-d8e5e5ee-1234-47e1-8986-4fb7f1a7e6f1'; 
const subscribeKey = 'sub-c-cd13ae42-d352-4daf-927e-cead3be9595d';

const pubnub = new PubNub({
  publishKey,
  subscribeKey,
});
const { pubnub, createPeerConnection } = require('./pubnub'); // Import the PubNub-related code from pubnub.js

let mainWindow;
let localStream;
@@ -41,40 +33,4 @@ ipcMain.on('start-call', async () => {
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


