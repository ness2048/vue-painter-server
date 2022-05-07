var express = require('express');
var app = express();

// Webサーバーを起動
var server = app.listen(process.env.PORT || 3000, listen);

// サーバーが起動したときに呼び出される
function listen(){
  var host = server.address().adress;
  var port = server.address().port;
  console.log(`http://${host}:${port}`);
}

var io = require('socket.io')(server, {
  cors: {
    origins: ["http://localhost:8080"],
    methods: ["GET", "POST"]
  }
});

// クライアントに接続されたときの処理を行う
io.sockets.on('connection',
  function(socket){

    console.log("socket.id: " + socket.id);

    //クライアント側のstrokeイベントを受け取る
    socket.on('stroke',

      function(strokes){
        console.log(`Stroke length: ${strokes.length}`)
        if (strokes.length > 0) {
          console.log('stroke.pointerId:', strokes[0])
        }
        // strokes.forEach(stroke => {
        //   console.log(`stroke: ${stroke.x}, ${stroke.y}`)
        // });

        //ブロードキャストで全員に向けて送信する
        socket.broadcast.emit('stroke', strokes);
      }
    );

    //コネクションが切れた時
    socket.on('disconnect', function(){
      console.log(`socket.id:${socket.id} が切断しました。`);
    });
  }
);
