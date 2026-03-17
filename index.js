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
    if (event.type !== 'message' || event.message.type !== 'text') {
      return Promise.resolve(null);
    }
    // ここで返信
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `メッセージを受け取りました: ${event.message.text}`
    });
  }))
  .then(result => res.json(result))
  .catch(err => {
    console.error('Error details:', err); // 詳細なエラーを出す
    res.status(500).end();
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
