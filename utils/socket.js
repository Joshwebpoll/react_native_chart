// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useCallback, useEffect, useState } from "react";

import { useCallback, useState } from "react";

// export const useSocket = () => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     let newSocket;

//     const init = async () => {
//       const token = await AsyncStorage.getItem("token");
//       console.log(token);

//       if (token) {
//         const { io } = await import("socket.io-client");

//         newSocket = io("https://buddy-chat-backend-ii8g.onrender.com", {
//           auth: { token },
//         });

//         newSocket.on("connect", () => setIsConnected(true));
//         newSocket.on("disconnect", () => setIsConnected(false));

//         setSocket(newSocket);
//       }
//     };

//     init();

//     // Cleanup function
//     return () => {
//       if (newSocket) {
//         newSocket.disconnect();
//       }
//     };
//   }, []);

//   const emit = useCallback(
//     (event, data) => {
//       socket?.emit(event, data);
//     },
//     [socket]
//   );

//   const on = useCallback(
//     (event, callback) => {
//       if (!socket) return () => {};

//       socket.on(event, callback);
//       return () => socket.off(event, callback);
//     },
//     [socket]
//   );

//   return { isConnected, emit, on, socket };
// };
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef } from "react";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const connect = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    console.log(token, "jsks");
    if (!token || socketRef.current) return;

    const { io } = await import("socket.io-client");

    const socket = io("https://buddy-chat-backend-ii8g.onrender.com", {
      auth: { token },
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event, callback) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on(event, callback);
    return () => socketRef.current.off(event, callback);
  }, []);

  return {
    connect,
    disconnect,
    isConnected,
    emit,
    on,
    socket: socketRef.current,
  };
};
