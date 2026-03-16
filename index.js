const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const app = express();
const client = new line.Client(config);

app.post('/callback', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(event => {
    if (event.type !== 'message' || event.message.type !== 'text') return Promise.resolve(null);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `あなたの送ったメッセージ: ${event.message.text}`
    });
  }))
  .then(result => res.json(result))
  .catch(err => { console.error(err); res.status(500).end(); });
});

app.listen(process.env.PORT || 8080);
