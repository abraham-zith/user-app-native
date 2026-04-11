// // Socket Configuration & Setup Reference
// // This file demonstrates complete socket setup

// import { io, Socket } from "socket.io-client";
// import Config from "react-native-config";

// // ==================== SOCKET INITIALIZATION ====================

// export const SOCKET_URL = Config.DEV_BACKEND_URL || "http://10.0.2.2:1234";
// // For production: "https://your-api-domain.com"
// // For Android emulator: "http://10.0.2.2:1234"

// export const socket: Socket = io(SOCKET_URL, {
//     transports: ["websocket"],
//     autoConnect: false, // Manual connection control
//     reconnection: true,
//     reconnectionAttempts: 10,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     randomizationFactor: 0.5,
// });

// // ==================== CONNECTION LIFECYCLE ====================

// /**
//  * Socket Connection Events
//  */
// socket.on("connect", () => {
//     console.log("🔗 Socket Connected:", socket.id);
//     // Ready to emit events
// });

// socket.on("disconnect", () => {
//     console.log("❌ Socket Disconnected");
//     // Stop emitting events
// });

// socket.on("connect_error", (error: any) => {
//     console.error("❌ Connection Error:", error.message);
// });

// socket.on("error", (error: any) => {
//     console.error("❌ Socket Error:", error);
// });

// // ==================== TRIP ROOM MANAGEMENT ====================

// /**
//  * Join a specific trip room
//  * Called from TripScreen when user views a trip
//  */
// export function joinTripRoom(tripId: string, userId: string, role: "USER" | "DRIVER") {
//     if (!socket.connected) {
//         socket.connect();
//     }

//     socket.emit("joinRide", {
//         tripId: tripId,
//         userId: userId,
//         role: role, // "USER" or "DRIVER"
//     });

//     console.log(`📡 Joined Trip Room: ${tripId} as ${role}`);
// }

// /**
//  * Leave a specific trip room
//  * Called when trip completes or user navigates away
//  */
// export function leaveTripRoom(tripId: string) {
//     socket.emit("leaveRide", { tripId });
//     console.log(`📡 Left Trip Room: ${tripId}`);
// }

// // ==================== TRIP LIFECYCLE EVENTS ====================

// /**
//  * EVENT 1: TRIP_REQUESTED
//  * Fired when user creates a new trip
//  * Broadcasted to all nearby drivers
//  */
// export function listenTripRequested(
//     callback: (data: {
//         tripId: string;
//         userId: string;
//         pickupLat: number;
//         pickupLng: number;
//         dropLat: number;
//         dropLng: number;
//         estimatedFare: number;
//     }) => void
// ) {
//     socket.on("trip_requested", callback);
//     return () => socket.off("trip_requested", callback);
// }

// /**
//  * EVENT 2: TRIP_ACCEPTED
//  * Fired when a driver accepts the trip
//  * Sent to user's trip room
//  */
// export function listenTripAccepted(
//     callback: (data: {
//         tripId: string;
//         driverId: string;
//         driverName: string;
//         driverPhone: string;
//         driverRating: number;
//         driverProfilePic: string;
//         driverOTP: string;
//         carModel: string;
//         carPlate: string;
//         estimatedArrival: number; // in minutes
//     }) => void
// ) {
//     socket.on("TRIP_ACCEPTED", callback);
//     return () => socket.off("TRIP_ACCEPTED", callback);
// }

// /**
//  * EVENT 3: TRIP_ARRIVING
//  * Fired when driver is near pickup location
//  * Sent to user's trip room
//  */
// export function listenTripArriving(
//     callback: (data: {
//         tripId: string;
//         driverId: string;
//         driverLat: number;
//         driverLng: number;
//         estimatedArrival: number; // seconds remaining
//     }) => void
// ) {
//     socket.on("trip_arriving", callback);
//     return () => socket.off("trip_arriving", callback);
// }

// /**
//  * EVENT 4: TRIP_LIVE
//  * Fired when trip starts (user picked up, heading to destination)
//  * Sent to user's trip room
//  */
// export function listenTripLive(
//     callback: (data: {
//         tripId: string;
//         driverId: string;
//         startTime: number;
//         status: "LIVE";
//     }) => void
// ) {
//     socket.on("trip_live", callback);
//     return () => socket.off("trip_live", callback);
// }

// /**
//  * EVENT 5: TRIP_COMPLETED
//  * Fired when trip destination is reached
//  * Sent to user's trip room
//  */
// export function listenTripCompleted(
//     callback: (data: {
//         tripId: string;
//         driverId: string;
//         actualFare: number;
//         actualDuration: number; // in minutes
//         actualDistance: number; // in km
//         endTime: number;
//     }) => void
// ) {
//     socket.on("trip_completed", callback);
//     return () => socket.off("trip_completed", callback);
// }

// /**
//  * EVENT 6: TRIP_CANCELLED
//  * Fired when trip is cancelled
//  * Sent to both user and driver rooms
//  */
// export function listenTripCancelled(
//     callback: (data: {
//         tripId: string;
//         cancelledBy: "DRIVER" | "USER";
//         reason: string;
//         cancelledAt: number;
//     }) => void
// ) {
//     socket.on("trip_cancelled", callback);
//     return () => socket.off("trip_cancelled", callback);
// }

// // ==================== DRIVER LOCATION UPDATES ====================

// /**
//  * Real-time driver location updates
//  * Sent frequently while driver is en route
//  */
// export function listenDriverLocation(
//     callback: (data: {
//         tripId: string;
//         driverId: string;
//         latitude: number;
//         longitude: number;
//         timestamp: number;
//     }) => void
// ) {
//     socket.on("driver_location_updated", callback);
//     return () => socket.off("driver_location_updated", callback);
// }

// /**
//  * Emit driver's current location (for driver app)
//  */
// export function emitDriverLocation(tripId: string, lat: number, lng: number) {
//     socket.emit("driver_location", {
//         tripId,
//         latitude: lat,
//         longitude: lng,
//         timestamp: Date.now(),
//     });
// }

// // ==================== CUSTOMER ACTIONS ====================

// /**
//  * Emit: Trip completion by customer
//  */
// export function emitTripCompleted(tripId: string, fare: number) {
//     socket.emit("trip_completed", {
//         tripId,
//         actualFare: fare,
//         completedAt: Date.now(),
//     });
// }

// /**
//  * Emit: Trip cancellation
//  */
// export function emitTripCancelled(tripId: string, reason: string) {
//     socket.emit("trip_cancelled", {
//         tripId,
//         cancelledBy: "USER",
//         reason,
//         cancelledAt: Date.now(),
//     });
// }

// /**
//  * Emit: Driver rating and feedback
//  */
// export function emitDriverRating(
//     tripId: string,
//     driverId: string,
//     rating: number,
//     feedback: string
// ) {
//     socket.emit("driverRating", {
//         tripId,
//         driverId,
//         rating,
//         feedback,
//         ratedAt: Date.now(),
//     });
// }

// /**
//  * Emit: Emergency alert
//  */
// export function emitEmergency(tripId: string) {
//     socket.emit("emergency", {
//         tripId,
//         triggeredAt: Date.now(),
//     });
// }

// /**
//  * Emit: Location share
//  */
// export function emitShareLocation(
//     tripId: string,
//     userLat: number,
//     userLng: number
// ) {
//     socket.emit("shareLocation", {
//         tripId,
//         userLat,
//         userLng,
//         sharedAt: Date.now(),
//     });
// }

// // ==================== GENERIC EVENT LISTENERS ====================

// /**
//  * Listen for any error events
//  */
// export function listenErrors(callback: (error: any) => void) {
//     socket.on("error", callback);
//     return () => socket.off("error", callback);
// }

// /**
//  * Listen for notifications
//  */
// export function listenNotifications(
//     callback: (data: {
//         type: string;
//         message: string;
//         data: any;
//     }) => void
// ) {
//     socket.on("notification", callback);
//     return () => socket.off("notification", callback);
// }

// // ==================== HELPER FUNCTIONS ====================

// /**
//  * Connect to socket manually
//  */
// export function connectSocket() {
//     if (!socket.connected) {
//         socket.connect();
//         console.log("✅ Attempting to connect socket...");
//     }
// }

// /**
//  * Disconnect from socket
//  */
// export function disconnectSocket() {
//     if (socket.connected) {
//         socket.disconnect();
//         console.log("❌ Socket disconnected");
//     }
// }

// /**
//  * Check if socket is connected
//  */
// export function isSocketConnected(): boolean {
//     return socket.connected;
// }

// /**
//  * Get socket ID
//  */
// export function getSocketId(): string | null {
//     return socket.id || null;
// }

// /**
//  * Emit generic event
//  */
// export function emitEvent(eventName: string, data: any) {
//     if (socket.connected) {
//         socket.emit(eventName, data);
//         console.log(`📤 Emitted ${eventName}:`, data);
//     } else {
//         console.warn(`⚠️ Socket not connected. Cannot emit ${eventName}`);
//     }
// }

// /**
//  * Listen for generic event
//  */
// export function onEvent(eventName: string, callback: (data: any) => void) {
//     socket.on(eventName, callback);
//     return () => socket.off(eventName, callback);
// }

// // ==================== DEBUG UTILITIES ====================

// /**
//  * Log all socket events (for development)
//  */
// export function enableDebugLogging() {
//     socket.onAny((eventName, ...args) => {
//         console.log(`📡 [${new Date().toLocaleTimeString()}] Event: ${eventName}`, args);
//     });
// }

// /**
//  * Get socket status for debugging
//  */
// export function getSocketStatus() {
//     return {
//         connected: socket.connected,
//         id: socket.id,
//         url: socket.io.uri,
//         transport: socket.io.engine?.transport?.name,
//     };
// }

// // ==================== USAGE EXAMPLE ====================

// /**
//  * EXAMPLE: How to use in a component
//  * 
//  * const [unsubscribers, setUnsubscribers] = useState<(() => void)[]>([]);
//  * 
//  * useEffect(() => {
//  *     connectSocket();
//  *     joinTripRoom(tripId, userId, "USER");
//  * 
//  *     const unsub1 = listenTripAccepted((data) => {
//  *         console.log('Driver found:', data);
//  *         setDriver(data);
//  *     });
//  * 
//  *     const unsub2 = listenTripArriving((data) => {
//  *         console.log('Driver arriving:', data);
//  *         setEta(data.estimatedArrival);
//  *     });
//  * 
//  *     const unsub3 = listenTripCompleted((data) => {
//  *         console.log('Trip completed:', data);
//  *     });
//  * 
//  *     setUnsubscribers([unsub1, unsub2, unsub3]);
//  * 
//  *     return () => {
//  *         unsubscribers.forEach(unsub => unsub());
//  *         leaveTripRoom(tripId);
//  *     };
//  * }, [tripId]);
//  */

// export default socket;


