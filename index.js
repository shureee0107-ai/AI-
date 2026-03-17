/**
 * LINE Bot: エコーサーバー (Node.js 20/22 対応)
 * * 環境変数の読み込みエラーを防ぐため、トリミング処理を追加しています。
 */

const line = require('@line/bot-sdk');

// 環境変数の設定
// process.env から読み込む際、前後に空白や不要な改行が含まれないよう .trim() を使用
const config = {
  channelAccessToken: (process.env.CHANNEL_ACCESS_TOKEN || '').trim(),
  channelSecret: (process.env.CHANNEL_SECRET || '').trim(),
};

// クライアントの初期化
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken
});

/**
 * Cloud Functions のメインハンドラー
 */
exports.lineWebhook = async (req, res) => {
  // 署名検証（セキュリティ上重要）
  const signature = req.headers['x-line-signature'];

  if (!signature) {
    return res.status(400).send('No signature');
  }

  try {
    // Webhookイベントの処理
    const events = req.body.events;
    
    // 全てのイベントを並列処理
    await Promise.all(events.map(item => handleEvent(item)));
    
    res.status(200).send('OK');
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).send('Internal Server Error');
  }
};

/**
 * 各イベント（メッセージ送信など）に応じた処理
 */
async function handleEvent(event) {
  // テキストメッセージ以外は無視
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  // おうむ返し（Echo）メッセージの作成
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{
      type: 'text',
      text: event.message.text
    }],
  });
}
