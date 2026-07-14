// Socket Events - Trip Lifecycle Management

export enum TripSocketEvent {
    //Trips
    NEW_TRIP_REQUEST = 'NEW_TRIP_REQUEST',
    TRIP_REQUESTED = 'TRIP_REQUESTED',
    TRIP_ACCEPTED = 'TRIP_ACCEPTED',
    TRIP_STARTED = 'TRIP_STARTED',
    TRIP_COMPLETED = 'TRIP_COMPLETED',
    TRIP_CANCELLED = 'TRIP_CANCELLED',
    TRIP_MID_CANCELLED = 'TRIP_MID_CANCELLED',
    TRIP_UPDATED = 'TRIP_UPDATED',
    TRIP_REMOVED = 'TRIP_REMOVED',
    TRIP_STATUS_CHANGED = 'TRIP_STATUS_CHANGED',
    DESTINATION_REACHED = 'DESTINATION_REACHED',

    //Driver
    DRIVER_LOCATION = 'DRIVER_LOCATION',
    DRIVER_AVAILABLE = 'DRIVER_AVAILABLE',
    DRIVER_UNAVAILABLE = 'DRIVER_UNAVAILABLE',
}

export const SOCKET_EVENTS = {
    // ==================== GENERAL ====================
    CONNECT: "connect",
    DISCONNECT: "disconnect",

    // ==================== ROOM MANAGEMENT ====================
    JOIN_RIDE: "joinRide",
    LEAVE_RIDE: "leaveRide",
    JOIN_USER_ROOM: "JOIN_USER_ROOM",
    JOIN_DRIVER_ROOM: "JOIN_DRIVER_ROOM",

    // ==================== TRIP LIFECYCLE ====================
    // User creates trip and broadcasts to nearby drivers
    TRIP_REQUESTED: TripSocketEvent.NEW_TRIP_REQUEST,

    // Driver accepts trip
    TRIP_ACCEPTED: TripSocketEvent.TRIP_ACCEPTED,

    // Driver is on the way to pickup
    TRIP_ARRIVING: 'TRIP_ARRIVING', // If backend provides this, otherwise map to TRIP_ACCEPTED/STARTED

    // Trip started - driver and user are in vehicle
    TRIP_LIVE: TripSocketEvent.TRIP_STARTED,

    DESTINATION_REACHED: TripSocketEvent.DESTINATION_REACHED,
    // Trip completed
    TRIP_COMPLETED: TripSocketEvent.TRIP_COMPLETED,

    // Trip cancelled by user or driver
    TRIP_CANCELLED: TripSocketEvent.TRIP_CANCELLED,

    // Generic trip status update
    TRIP_STATUS_UPDATED: TripSocketEvent.TRIP_STATUS_CHANGED,

    // Driver location updates during trip
    DRIVER_LOCATION_UPDATED: TripSocketEvent.DRIVER_LOCATION,

    // ==================== DRIVER UPDATES ====================
    DRIVER_ACCEPTED: TripSocketEvent.TRIP_ACCEPTED,
    DRIVER_LOCATION: TripSocketEvent.DRIVER_LOCATION,

    // ==================== USER UPDATES ====================
    USER_LOCATION_UPDATE: "user_location_update",

    // ==================== NOTIFICATIONS ====================
    NOTIFICATION: "notification",
    ERROR: "error",
} as const;

// Trip Status Enum
export enum TripStatusSocket {
    REQUESTED = "REQUESTED",
    ACCEPTED = "ACCEPTED",
    ARRIVING = "ARRIVING",
    LIVE = "LIVE",
    DESTINATION_REACHED = "DESTINATION_REACHED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    MID_CANCELLED = "MID_CANCELLED",
}

// Socket Payload Types
export interface JoinRidePayload {
    rideId: string;
    actorId: string;
    role: "USER" | "DRIVER";
}

export interface TripStatusUpdatePayload {
    tripId: string;
    status: TripStatusSocket;
    driverId?: string;
    timestamp: number;
    data?: any; // Additional data like OTP, driver info, etc.
}

export interface DriverLocationPayload {
    tripId: string;
    driverId: string;
    latitude: number;
    longitude: number;
    timestamp: number;
}

export interface TripAcceptedPayload {
    tripId: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    driverRating: number;
    driverProfilePic: string;
    driverOTP: string;
    carModel: string;
    carPlate: string;
    estimatedArrival: number; // in minutes
}

export interface TripRequestedPayload {
    tripId: string;
    userId: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropAddress: string;
    dropLat: number;
    dropLng: number;
    estimatedFare: number;
    rideType: string;
    timestamp: number;
}

export interface TripCompletedPayload {
    tripId: string;
    driverId: string;
    actualFare: number;
    actualDuration: number;
    actualDistance: number;
    timestamp: number;
}

export interface TripCancelledPayload {
    tripId: string;
    cancelledBy: "DRIVER" | "CUSTOMER";
    reason: string;
    timestamp: number;
}