const { app, BrowserWindow, ipcMain } = require('electron');
const PubNub = require('pubnub');
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('wrtc');

const publishKey = 'pub-c-d8e5e5ee-1234-47e1-8986-4fb7f1a7e6f1';
const subscribeKey = 'sub-c-cd13ae42-d352-4daf-927e-cead3be9595d';

const pubnub = new PubNub({
  publishKey,
  subscribeKey,
});

let mainWindow;
let localStream;
let peerConnection;

app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  mainWindow.loadFile('index.html'); // Replace 'index.html' with your HTML file

  // Obtain and set the localStream
  const videoElement = document.getElementById('local-video');
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      videoElement.srcObject = stream;
      localStream = stream;
    })
    .catch(error => {
      console.error('Error getting local media:', error);
    });
});

ipcMain.on('start-call', async () => {
  createPeerConnection();
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
  }

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
        // Display the remote stream
        const remoteVideoElement = document.getElementById('remote-video');
        remoteVideoElement.srcObject = message.message.remoteStream;
      } else if (message.message.textMessage) {
        // Handle text chat messages
        const chatDiv = document.getElementById('chat-div');
        const messageElement = document.createElement('p');
        messageElement.textContent = message.message.textMessage;
        chatDiv.appendChild(messageElement);
      }
    }
  });

  pubnub.subscribe({ channels: ['webrtc'] });
}

app.on('window-all-closed', () => {
  if (peerConnection) {
    peerConnection.close();
  }
  pubnub.unsubscribeAll();
  app.quit();
});

const audioToggle = document.getElementById('audio-toggle');
audioToggle.addEventListener('click', () => {
  const audioTracks = localStream.getAudioTracks();
  audioTracks.forEach(track => {
    track.enabled = !track.enabled;
  });
});

const videoToggle = document.getElementById('video-toggle');
videoToggle.addEventListener('click', () => {
  const videoTracks = localStream.getVideoTracks();
  videoTracks.forEach(track => {
    track.enabled = !track.enabled;
  });
});

// RTCDataChannel for text chat
const dataChannel = peerConnection.createDataChannel('chat');
dataChannel.onopen = event => {
  console.log('Data channel opened');
};

dataChannel.onmessage = event => {
  const chatDiv = document.getElementById('chat-div');
  const messageElement = document.createElement('p');
  messageElement.textContent = event.data;
  chatDiv.appendChild(messageElement);
};


const sendButton = document.getElementById('send-button');
const chatInput = document.getElementById('chat-input');

sendButton.addEventListener('click', () => {
  dataChannel.send(chatInput.value);
  chatInput.value = '';
});
