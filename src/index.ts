import { BrushParameters } from "./core/painting/brush-parameters";
import { NativePointerEvent } from "./core/painting/NativePointerEvent";

let express = require('express');
let app = express();

// Webサーバーを起動
let server = app.listen(process.env.PORT || 3000);

// サーバーが起動したときに呼び出される
var listen = () => {
  var host = server.address().adress;
  var port = server.address().port;
  console.log(`http://${host}:${port}`);
}

let io = require('socket.io')(server, {
  cors: {
    origins: ['http://localhost:8080', 'http://vue-painter.s3-website-ap-northeast-1.amazonaws.com/'],
    methods: ['GET', 'POST']
  }
});

// クライアントに接続されたときの処理を行う
io.sockets.on('connection',
  (socket: any) => {

    console.log('socket.id: ' + socket.id);

    //クライアントから受信したstrokeイベントを処理する
    socket.on('stroke',

      (points: NativePointerEvent[], brushParams: BrushParameters) => {
        console.log(`points length: ${points.length}`)
        if (points.length > 0) {
          console.log('point.pointerId:', points[0])
        }
        console.log('brushParams', brushParams);

        //ブロードキャストでクライアント全員に向けて送信する(サーバーを除く)
        socket.broadcast.emit('stroke', points, brushParams);
      }
    );

    //コネクションが切れた時
    socket.on('disconnect', function(){
      console.log(`socket.id:${socket.id} が切断しました。`);
    });
  }
);
