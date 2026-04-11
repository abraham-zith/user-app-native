import { createContext, useContext } from "react";
import { ISocketContext } from "./socket.types";

export const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used inside SocketProvider");
    }
    return context;
};