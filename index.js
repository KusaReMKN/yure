'use strict';

/** ゆれの幅 */
const yureWidth = 800;
/** ゆれの高さ */
const yureHeight = 200;

/** 時間の縮小率 */
const tDiv = 50;
/** ゆれの拡大率 */
const xMul = 100;
/** X 方向のゆれの位置 */
const xOff = 50;
/** Y 方向のゆれの位置 */
const yOff = 0;
/** Z 方向のゆれの位置 */
const zOff = -50;

/** 通信用の WebSocket */
const ws = new WebSocket('./');

/** 全ゆれ記憶バッファ */
const yures = { };

/** 表示を更新する */
async function
update(yureId)
{
	const cv = new OffscreenCanvas(yureWidth, yureHeight);
	const ctx = cv.getContext('2d');
	ctx.setTransform(-1, 0, 0, -1, yureWidth, yureHeight / 2);

	// 横線の描画
	ctx.strokeStyle = 'rgba(0,0,0,.25)';
	ctx.beginPath();
	ctx.moveTo(0, xOff);
	ctx.lineTo(yureWidth, xOff);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, yOff);
	ctx.lineTo(yureWidth, yOff);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, zOff);
	ctx.lineTo(yureWidth, zOff);
	ctx.stroke();

	// 縦線の描画
	for (let i = 0; i < yureWidth; i += 1000 / tDiv) {
		ctx.beginPath();
		ctx.moveTo(i, -yureHeight);
		ctx.lineTo(i, +yureHeight);
		ctx.stroke();
	}

	const now = performance.timeOrigin + performance.now();
	ctx.strokeStyle = 'red';
	ctx.beginPath();
	yures[yureId].forEach(e => {
		ctx.lineTo((now - e.t) / tDiv, e.x * xMul + xOff);
	});
	ctx.stroke();

	ctx.strokeStyle = 'green';
	ctx.beginPath();
	yures[yureId].forEach(e => {
		ctx.lineTo((now - e.t) / tDiv, e.y * xMul + yOff);
	});
	ctx.stroke();

	ctx.strokeStyle = 'blue';
	ctx.beginPath();
	yures[yureId].forEach(e => {
		ctx.lineTo((now - e.t) / tDiv, e.z * xMul + zOff);
	});
	ctx.stroke();

	const blob = await cv.convertToBlob();
	const url = URL.createObjectURL(blob);
	const imgYureId = document.getElementById(`img${yureId}`);
	await new Promise(res => {
		imgYureId?.addEventListener('load', _ => {
			URL.revokeObjectURL(url);
			res();
		}, { once: true });
		imgYureId?.setAttribute('src', url);
	});
}

async function
forcedUpdate()
{
	const keys = Object.keys(yures);
	await Promise.allSettled(keys.map(async yureId => {
		await update(yureId);
		if (Date.now() - yures[yureId][0].t > yureWidth * tDiv) {
			delete yures[yureId];
			document.getElementById(yureId)?.remove();
		}
	}));
	requestAnimationFrame(forcedUpdate);
}

ws.addEventListener('message', e => {
	const buf = JSON.parse(e.data);

	// 知らないゆれ識別子が来たら登録する
	const yureId = buf[0].yureId;
	if (!yures[yureId]) {
		yures[yureId] = [ ];

		// 表示領域の準備
		const h3 = document.createElement('h3');
		h3.style.display = 'inline';
		h3.textContent = yureId;	
		const img = document.createElement('img');
		img.setAttribute('id', `img${yureId}`);
		const div = document.createElement('div');
		div.append(h3);
		if (buf[0].userAgent) {
			const span = document.createElement('span');
			span.textContent = ` (${buf[0].userAgent})`;
			div.append(span);
		}
		const section = document.createElement('section');
		section.setAttribute('id', yureId);
		section.append(div, img);
		main.append(section);
	}

	// 加速度を記憶する（長過ぎたら切り詰める）
	yures[yureId].unshift(...buf.toReversed());
	yures[yureId].length = 3000;
});
requestAnimationFrame(forcedUpdate);
