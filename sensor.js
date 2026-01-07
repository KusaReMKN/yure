'use strict';

/** ゆれ識別子（33 bit）を生成する */
function
generateYureId()
{
	const r8 = _ => Math.random() * 8 | 0;
	return [...Array(11)].map(_ => 'YUREyure'[r8()]).join('');
}

// ゆれ識別子を設定する
const yureId = localStorage.getItem('yureId') || generateYureId();
localStorage.setItem('yureId', yureId);
outYureId.value = yureId;

/** 通信用 WebSocket */
const ws = new WebSocket('./');

/** 加速度データバッファ */
const buf = [ ];

/** センサイベントハンドラ */
function
devMotionHandler(e)
{
	buf.push({
		yureId,
		...e.acceleration,
		t: Date.now(),
		userAgent: 'web client',
	});
	if (buf.length === 30) {
		ws.send(JSON.stringify(buf));
		buf.length = 0;
	}
}

// フォームを送信しようとしたら WebSocket でサーバにメッセージを送る
form.addEventListener('submit', async e => {
	// form の送信を行わない
	e.preventDefault();

	// ゆれをシェアしようとしている？
	if (e.submitter === btnStart) {
		// iOS の Safari は正気かどうかを確かめてくる
		if (DeviceMotionEvent?.requestPermission) {
			const p = await DeviceMotionEvent.requestPermission();
			if (p !== 'granted')
				return;
		}

		// センサの監視をはじめる
		window.addEventListener('devicemotion', devMotionHandler);
		btnStart.disabled = true;
		btnStop.disabled = false;
	}

	// ゆれをシェアしまいとしている？
	if (e.submitter === btnStop) {
		window.removeEventListener('devicemotion', devMotionHandler);
		btnStart.disabled = false
		btnStop.disabled = true;
	}
});
