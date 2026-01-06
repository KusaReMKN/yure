# ゆれ

スマートフォンなどに搭載されている加速度センサの値をグラフにプロットしてみんなで眺める

## これはなに

どこかにあるデバイスのリアルタイムな加速度センサの値を Web ブラウザから眺められます。

ただそれだけです。

## つかいかた

サーバを立てるために Node.js が必要です。
デフォルトでは 8080 ポートでリスンします。

```console
$ npm i
$ node app.js
```

サーバは平文の HTTP や WebSocket で通信を行います。
しかし、ブラウザ上でセンサを扱うには安全なコンテキストが必要です（HTTPS がほとんど必須です）。

## ライセンス

MIT

## 宣伝

Android 用のアプリケーションが開発されているようです: [m-tsuru/yuredroid]

[m-tsuru/yuredroid]: https://github.com/m-tsuru/yuredroid
