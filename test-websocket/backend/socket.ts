import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server | null = null;

const initializeSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("message", (message: string) => {
      // 廣播訊息給所有連接的客戶端，除了發送者
      socket.broadcast.emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};

const getSocket = (): Server => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};

export default { initializeSocket, getSocket };
