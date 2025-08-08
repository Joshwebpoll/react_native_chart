// services/socketService.js

import { io } from "socket.io-client";

let socket = null;

const SERVER_URL = "https://buddy-chat-backend-ii8g.onrender.com"; // replace with your backend URL

const SocketService = {
  connect: (token) => {
    if (socket && socket.connected) return socket;

    socket = io(SERVER_URL, {
      transports: ["websocket"],
      auth: {
        token: `Bearer ${token}`,
      },
      autoConnect: true,
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("❗ Socket connection error:", err.message);
    });

    return socket;
  },

  getSocket: () => socket,

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log("🔌 Socket manually disconnected");
    }
  },
};

export default SocketService;
