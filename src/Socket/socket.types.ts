// export interface ISocketContext {
//     socket: any;
//     isConnected: boolean;
//     socketId: string | null;
//     joinRideRoom: (rideId: string, role: string) => void;
//     leaveRideRoom: (rideId: string) => void;
//     subscribe: (eventName: string, callback: (data: any) => void) => any;
// }

// export interface RideJoinPayload {
//     rideId: string;
//     userId: string;
// }

// export interface ChatMessage {
//     id: string;
//     sender: 'me' | 'other';
//     time: string;
//     text?: string;
//     image?: string;
//     location?: { latitude: number; longitude: number };
//     status?: 'pending' | 'sent' | 'delivered' | 'seen';
// }

import { TripStatusSocket } from "./socket.events";

export interface DriverInfo {
    driverId: string;
    driverName: string;
    driverPhone: string;
    driverRating: number;
    driverProfilePic: string;
    driverOTP: string;
    carModel: string;
    carPlate: string;
    estimatedArrival: number;
    currentLat?: number;
    currentLng?: number;
}

export interface TripSocketState {
    tripId: string | null;
    status: TripStatusSocket | null;
    driverId: string | null;
    driverInfo: DriverInfo | null;
    lastUpdate: string | null;
    listeners: Record<string, any>;
}

export interface ISocketContext {
    // ============ CONNECTION INFO ============
    socket: any;
    isConnected: boolean;
    socketId: string | null;

    // ============ ROOM MANAGEMENT ============
    joinTripRoom: (rideId: string, actorId: string, role: "USER" | "DRIVER") => void;
    joinUserRoom: (userId: string) => void;
    joinDriverRoom: (driverId: string) => void;
    leaveTripRoom: (tripId: string) => void;
    isInTripRoom: (tripId: string) => boolean; // ✅ New helper

    // ============ GENERIC EVENT LISTENERS ============
    subscribe: (eventName: string, callback: (data: any) => void) => () => void;
    unsubscribe: (eventName: string, callback?: (data: any) => void) => void;
    emit: (eventName: string, data: any) => void;

    // ============ TRIP-SPECIFIC EVENT HANDLERS ============
    onTripRequested: (callback: (data: any) => void) => () => void;
    onTripAccepted: (callback: (data: any) => void) => () => void;
    onTripArriving: (callback: (data: any) => void) => () => void;
    onTripLive: (callback: (data: any) => void) => () => void;
    onDestinationReached: (callback: (data: any) => void) => () => void;
    onTripCompleted: (callback: (data: any) => void) => () => void;
    onTripCancelled: (callback: (data: any) => void) => () => void;
    onTripMidCancelled: (callback: (data: any) => void) => () => void;
    onTripStatusUpdated: (callback: (data: any) => void) => () => void;
    onTripStatusChanged: (callback: (data: any) => void) => () => void;
    onDriverLocationUpdated: (callback: (data: any) => void) => () => void;
}

export interface RideJoinPayload {
    rideId: string;
    userId: string;
}

export interface ChatMessage {
    id: string;
    sender: "me" | "other";
    time: string;
    text?: string;
    image?: string;
    location?: { latitude: number; longitude: number };
    status?: "pending" | "sent" | "delivered" | "seen";
}