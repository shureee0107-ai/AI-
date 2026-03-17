const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: (process.env.LINE_CHANNEL_ACCESS_TOKEN || '').trim(),
  channelSecret: (process.env.CHANNEL_SECRET || '').trim(),
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

exports.helloHttp = async (req, res) => {
  try {
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body:', JSON.stringify(req.body));

    const events = req.body?.events;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(200).send('OK');
    }

    for (const event of events) {
      try {
        if (event.type !== 'message') continue;
        if (event.message?.type !== 'text') continue;
        if (!event.replyToken) continue;

        const userText = event.message.text;

        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: `あなたは「${userText}」と言いましたね！`,
            },
          ],
        });

        console.log('Reply success');
      } catch (eventError) {
        console.error(
          'Reply failed:',
          eventError?.response?.status,
          eventError?.response?.data || eventError.message || eventError
        );
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error(
      'Function error:',
      error?.response?.status,
      error?.response?.data || error.message || error
    );
    return res.status(500).send('Internal Server Error');
  }
};
