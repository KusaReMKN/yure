const fs = require('fs');

const express = require('express');
const app = express();

const expressWs = require('express-ws')(app);

const port = 8080;

app.use(express.static('./'));

app.ws('/', ws => {
	/* エラー発生時 */
	ws.on('error', e => {
		console.error(e);
	});

	/* メッセージ受信時 */
	ws.on('message', e => {
		// メッセージはバイト列として送られてくる
		// デコードして文字列にする
		const msg = e.toString('utf-8');

		// 全てのクライアントに放送する
		expressWs.getWss().clients.forEach(client => {
			client.send(msg);
		});
	});
});

app.listen(port);
