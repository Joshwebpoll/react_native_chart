// store/socketStore.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { create } from "zustand";
import { ToastManager } from "../../components/toast";
const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  error: null,
  //https://expo.dev/accounts/joshpoll/projects/buddy_chart/builds/24c58660-322c-4600-96a2-cd15c6877804
  initSocket: async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.warn("No token found");
        return;
      }

      const socket = io("https://buddy-chat-backend-ii8g.onrender.com", {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        ToastManager.success("You are now online");
        set({ isConnected: true, error: null });
      });

      socket.on("disconnect", (reason) => {
        // console.log("Socket disconnected:", reason);
        set({ isConnected: false });
      });

      socket.on("connect_error", (err) => {
        // ToastManager.error("Socket connection error:", err.message);

        set({ error: err.message, isConnected: false });
      });

      set({ socket });
    } catch (err) {
      //console.error("Socket init error:", err.message);
      set({ error: err.message });
    }
  },

  emit: (event, data) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn("Cannot emit, socket not connected");
    }
  },

  on: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.off(event, callback);
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  reconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.connect();
    }
  },
}));
export default useSocketStore;
