const { app, BrowserWindow, ipcMain } = require('electron');
const PubNub = require('pubnub');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library
const path = require('path');
const DataCommunicator = require('./dataCommunicator.js');

const publishKey = 'pub-c-d8e5e5ee-1234-47e1-8986-4fb7f1a7e6f1';
const subscribeKey = 'sub-c-cd13ae42-d352-4daf-927e-cead3be9595d';

const pubnub = new PubNub({
  publishKey,
  subscribeKey,
  uuid: uuidv4(), // Generate a UUID using uuidv4
});

const dataCommunicatorPort = process.env.PORT || 3000;
const dataCommunicator = new DataCommunicator(dataCommunicatorPort)
dataCommunicator.start();

let mainWindow;
let localStream;
let peerConnection;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false ,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
  });
});

ipcMain.on('on-ice-candidate', (candidate) => {
  console.log("Handling ice candidate event")
  if (candidate) {
    pubnub.publish({
      channel: 'webrtc',
      message: { iceCandidate: candidate },
    });
  }
} )

ipcMain.on('create-peer-connection', () => {
  console.log("Creating peer connection")
  pubnub.addListener({
    message: async message => {
      console.log("Received message from signal server")
      ipcMain.send('on-signal-server-message', message.message)
    },
  });
})

ipcMain.on('publish-answer', (answer) => {
  console.log("Publishing webrtc answer")
  try {
    pubnub.publish({
      channel: 'webrtc',
      message: { sdp: answer },
    });
  } catch (err) {
    console.error('Error publishing answer:', err);
  }
})

// ipcMain.on('start-call', async () => {
//   try {
//     // Request permission to access the camera
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

//     // Check the localStream object to make sure that it is not null
//     if (localStream === null) {
//       // Display a message to the user
//       mainWindow.webContents.send('error', 'Failed to access camera and microphone.');
//       return;
//     }

//     mainWindow.webContents.send('local-video', stream);

//     localStream = stream;

//     createPeerConnection();
//   } catch (err) {
//     console.error('Error accessing camera and microphone:', err);

//     // Display a message to the user
//     mainWindow.webContents.send('error', 'Failed to access camera and microphone.');
//   }
// });

// function createPeerConnection() {
//   peerConnection = new RTCPeerConnection();

//   localStream.getTracks().forEach(track => {
//     peerConnection.addTrack(track, localStream);
//   });

//   peerConnection.onicecandidate = event => {
//     if (event.candidate) {
//       pubnub.publish({
//         channel: 'webrtc',
//         message: { iceCandidate: event.candidate },
//       });
//     }
//   };
// }

// pubnub.addListener({
//   message: async message => {
//     if (message.message.sdp) {
//       try {
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(message.message.sdp));
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);

//         pubnub.publish({
//           channel: 'webrtc',
//           message: { sdp: answer },
//         });
//       } catch (err) {
//         console.error('Error setting or creating session description:', err);
//       }
//     } else if (message.message.iceCandidate) {
//       if (peerConnection) {
//         try {
//           await peerConnection.addIceCandidate(new RTCIceCandidate(message.message.iceCandidate));
//         } catch (err) {
//           console.error('Error adding ICE candidate:', err);
//         }
//       }
//     } else if (message.message.remoteStream) {
//       mainWindow.webContents.send('remote-video', message.message.remoteStream);
//     }
//   },
// });

pubnub.subscribe({ channels: ['webrtc'] });
