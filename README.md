

# WebRTC Video Chat App

This is a simple WebRTC video chat application built with Electron and PubNub. It allows two peers to connect directly via WebRTC to stream video between each other.

## Overview

The app consists of two main components:

- `index.html` - The web UI loaded into the Electron window. Displays local and remote video streams.

- `main.js` - The Electron main process file. Sets up the app window and WebRTC connection.

Signaling for exchanging WebRTC messages is done via PubNub. The app publishes SDP offers, ICE candidates to a PubNub channel which the peer subscribes to.

## Usage

To run the app:

1. Clone this repo
2. Run `npm install` to install dependencies 
3. Add your PubNub publish and subscribe keys in `main.js`
4. Run `npm start` to start the app
5. Open two instances of the app to connect as peers
6. Click "Start Call" button to initiate connection
7. WebRTC media streams will connect directly between the peers

## Dependencies

- Electron
- WebRTC
- PubNub JavaScript SDK

## Notes

- This is just a minimal example to demonstrate WebRTC video chat with Electron. Error handling and UI polish needs improvement for a production app.

- The PubNub keys need to be unique for each peer instance. Can also use PubNub functions for key generation.

Let me know if any part needs more explanation!
