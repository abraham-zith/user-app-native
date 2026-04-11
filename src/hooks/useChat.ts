import { useEffect } from "react";
import { useSocket } from "../Socket/SocketContext";

export const useChat = (rideId: string, userId: string) => {
    const { socket } = useSocket();

    useEffect(() => {
        socket.emit("joinChat", { rideId, userId });

        return () => {
            socket.off("receiveChatMessage");
            socket.off("chatHistory");          // ✅ clean up
            socket.off("typingUpdate");
            socket.off("messageDelivered");
            socket.off("messageDeliveredToUser");
            socket.off("messageSeenUpdate");
        };
    }, []);

    const sendMessage = (text: string) => {
        const payload = {
            messageId: Date.now().toString(),
            rideId,
            senderId: userId,
            text,
            timestamp: Date.now(),
        };

        socket.emit("sendChatMessage", payload);
        return payload;
    };

    const sendImage = (imageUrl: string) => {
        const payload = {
            messageId: Date.now().toString(),
            rideId,
            senderId: userId,
            image: imageUrl,
            timestamp: Date.now(),
        };
        socket.emit("sendChatMessage", payload);
        return payload;
    };

    const sendLocation = (latitude: number, longitude: number) => {
        const payload = {
            messageId: Date.now().toString(),
            rideId,
            senderId: userId,
            location: { latitude, longitude },
            timestamp: Date.now(),
        };
        socket.emit("sendChatMessage", payload);
        return payload;
    };


    const sendTyping = (isTyping: boolean) => {
        socket.emit("typing", { rideId, userId, isTyping });
    };

    const sendSeen = (messageId: string) => {
        socket.emit("messageSeen", { rideId, messageId, seenBy: userId });
    };

    const onMessage = (cb: (msg: any) => void) =>
        socket.on("receiveChatMessage", cb);

    const onTyping = (cb: (data: any) => void) =>
        socket.on("typingUpdate", cb);

    const onDelivered = (cb: (data: any) => void) =>
        socket.on("messageDelivered", cb);

    const onDeliveredToUser = (cb: (data: any) => void) =>
        socket.on("messageDeliveredToUser", cb);

    const onSeen = (cb: (data: any) => void) =>
        socket.on("messageSeenUpdate", cb);

    const onHistory = (cb: (msgs: any[]) => void) =>
        socket.on("chatHistory", cb);

    return {
        sendMessage,
        sendImage,
        sendLocation,
        sendTyping,
        sendSeen,
        onMessage,
        onTyping,
        onDelivered,
        onDeliveredToUser,
        onSeen,
        onHistory,
    };
};