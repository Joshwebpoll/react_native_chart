import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("token");
      console.log(token, "tgsisjs");
      if (token) {
        // Dynamic import to avoid SSR issues
        import("socket.io-client").then(({ io }) => {
          const newSocket = io("https://buddy-chat-backend-ii8g.onrender.com", {
            auth: { token },
          });

          newSocket.on("connect", () => setIsConnected(true));
          newSocket.on("disconnect", () => setIsConnected(false));

          setSocket(newSocket);

          return () => {
            newSocket.disconnect();
          };
        });
      }
    };
    init();
  }, []);

  const emit = useCallback(
    (event, data) => {
      socket?.emit(event, data);
    },
    [socket]
  );

  const on = useCallback(
    (event, callback) => {
      if (!socket) return () => {};

      socket.on(event, callback);
      return () => socket.off(event, callback);
    },
    [socket]
  );

  return { isConnected, emit, on, socket };
};
