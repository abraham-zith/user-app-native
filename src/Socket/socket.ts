import { io, Socket } from "socket.io-client";
import Config from "react-native-config";

// export const SOCKET_URL = "http://192.168.29.104:1234";
export const SOCKET_URL = Config.DEV_BACKEND_URL || "http://10.0.2.2:1234";
// export const SOCKET_URL = 'https://noncruciformly-unsupplicated-rosalinda.ngrok-free.dev';

// export const SOCKET_URL = "http://10.0.2.2:1234";

export const socket: Socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
}); 