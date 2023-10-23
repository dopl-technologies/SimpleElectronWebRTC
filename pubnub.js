const PubNub = require('pubnub');
const { v4: uuidv4 } = require('uuid');

const publishKey = 'pub-c-d8e5e5ee-1234-47e1-8986-4fb7f1a7e6f1';
const subscribeKey = 'sub-c-cd13ae42-d352-4daf-927e-cead3be9595d';

const uuid = uuidv4();

const pubnub = new PubNub({
  publishKey,
  subscribeKey,
  uuid,
});

module.exports = {
  pubnub,
  createPeerConnection,
};
