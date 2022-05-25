import { BrushParameters } from "./core/painting/brush-parameters";
import { NativePointerEvent } from "./core/painting/NativePointerEvent";
import express from "express";
import { AddressInfo } from "net";
import { Server, Socket } from "socket.io";

interface ServerToClientEvents {
  stroke: (data: {
    points: NativePointerEvent[];
    brushParams: BrushParameters;
  }) => void;
  downloadCanvas: (data: { image: Blob }) => void;
}

interface ClientToServerEvents {
  stroke: (data: {
    points: NativePointerEvent[];
    brushParams: BrushParameters;
  }) => void;
  updateCanvas: (data: { image: Blob }) => void;
  downloadCanvas: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
}

const app = express();

// Webサーバーを起動
const server = app.listen(process.env.PORT || 3000);

// サーバーが起動したときに呼び出される
const listen = () => {
  if (!server) {
    return;
  }
  const address: AddressInfo = server.address() as AddressInfo;
  const host = address.address;
  const port = address.port;
  console.log(`http://${host}:${port}`);
};

// Socket.IO の設定
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: ["http://localhost:8080"],
    methods: ["GET", "POST"],
  },
});

let canvasImage: Blob;

// クライアントに接続されたときの処理を行う
io.sockets.on(
  "connection",
  (
    socket: Socket<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >
  ) => {
    console.log(`socket.id: ${socket.id}`);

    //クライアントから受信したstrokeイベントを処理する
    socket.on("stroke", (data) => {
      console.log(`points length: ${data.points.length}`);
      if (data.points.length > 0) {
        console.log("point.pointerId:", data.points[0]);
      }
      console.log("brushParams", data.brushParams);

      //ブロードキャストでクライアント全員に向けて送信する(サーバーを除く)
      socket.broadcast.emit("stroke", data);
    });

    // キャンバスの更新
    socket.on("updateCanvas", (data: { image: Blob }) => {
      console.log("updateCanvas", data.image);
      canvasImage = data.image;
    });

    // キャンバスのダウンロード
    socket.on("downloadCanvas", () => {
      console.log("downloadCanvas");

      socket.emit("downloadCanvas", { image: canvasImage });
    });

    //コネクションが切れた時
    socket.on("disconnect", function () {
      console.log(`socket.id:${socket.id} が切断しました。`);
    });
  }
);
