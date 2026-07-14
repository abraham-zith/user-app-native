import React, { useCallback, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { socket } from "./socket";
import { ISocketContext } from "./socket.types";
import {
    SOCKET_EVENTS,
    JoinRidePayload,
    TripSocketEvent,
} from "./socket.events";
import { Alert } from "react-native";
import { storage } from "../service/utils/storage";
import { useDispatch } from "react-redux";
import { tripApi } from "../service/tripApi";
import { setActiveTrip } from "../redux/tripSlice";

interface Props {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [socketId, setSocketId] = useState<string | null>(null);

    // ✅ Multi-trip room tracking with metadata for re-joining
    const [joinedRooms, setJoinedRooms] = useState<Map<string, JoinRidePayload>>(new Map());
    const [persistedUserId, setPersistedUserId] = useState<string | null>(null);
    const [persistedDriverId, setPersistedDriverId] = useState<string | null>(null);
    const dispatch = useDispatch();

    // ==================== CONNECTION SETUP ====================
    useEffect(() => {
        const initConnection = async () => {
            const token = await storage.getAccessToken();
            if (token) {
                socket.auth = { token };
            }
            if (!socket.connected) {
                socket.connect();
            }
        };
        initConnection();

        const onConnect = async () => {
            setIsConnected(true);
            setSocketId(socket.id || null);

            // Fetch active trip to synchronize state
            try {
                const response = await dispatch(tripApi.endpoints.getActiveTrip.initiate(undefined, { forceRefetch: true }) as any);
                if (response?.data?.data) {
                    dispatch(setActiveTrip(response.data.data));
                }
            } catch (err) {
                console.log("Failed to sync active trip on connect", err);
            }
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        const onError = (error: any) => {
            Alert.alert('Socket Error!!!', 'Try Again Later');
            // console.error("❌ Socket Error:", error);
        };

        socket.on(SOCKET_EVENTS.CONNECT, onConnect);
        socket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);
        socket.on(SOCKET_EVENTS.ERROR, onError);


        return () => {
            socket.off(SOCKET_EVENTS.CONNECT, onConnect);
            socket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
            socket.off(SOCKET_EVENTS.ERROR, onError);
            socket.disconnect();
        };
    }, []);

    // ✅ AUTO-RESTORE ROOMS ON RECONNECT
    useEffect(() => {
        if (!isConnected) return;



        if (persistedUserId) {
            socket.emit(SOCKET_EVENTS.JOIN_USER_ROOM, persistedUserId);
        }
        if (persistedDriverId) {
            socket.emit(SOCKET_EVENTS.JOIN_DRIVER_ROOM, persistedDriverId);
        }
        if (joinedRooms.size > 0) {
            joinedRooms.forEach((payload, _rideId) => {
                socket.emit(SOCKET_EVENTS.JOIN_RIDE, payload);
            });
        }
    }, [isConnected]); // Run whenever isConnected transitions from false to true

    // ==================== ROOM MANAGEMENT ====================

    const joinTripRoom = useCallback(
        (rideId: string, actorId: string, role: "USER" | "DRIVER") => {
            if (!socket.connected) {
                socket.connect();
            }

            const payload: any = {
                rideId,
                // tripId: rideId, // Fallback
                // trip_id: rideId, // Fallback
                actorId,
                // actor_id: actorId, // Fallback
                role
            };
            socket.emit(SOCKET_EVENTS.JOIN_RIDE, payload);

            // Greedily try other common names to ensure room membership
            // socket.emit("join_ride", payload);
            // socket.emit("join_trip", payload);
            // socket.emit("join", { room: rideId });
            // socket.emit("join", { room: `trip_${rideId}` });
            // socket.emit("join", { room: `ride_${rideId}` });



            // Track joined rooms with metadata for re-joining
            setJoinedRooms((prev) => {
                const newMap = new Map(prev);
                newMap.set(rideId, payload);
                return newMap;
            });
        },
        []
    );

    const joinUserRoom = useCallback((userId: string) => {
        if (!socket.connected) socket.connect();
        socket.emit(SOCKET_EVENTS.JOIN_USER_ROOM, userId);

        setPersistedUserId(userId);
    }, []);

    const joinDriverRoom = useCallback((driverId: string) => {
        if (!socket.connected) socket.connect();
        socket.emit(SOCKET_EVENTS.JOIN_DRIVER_ROOM, driverId);

        setPersistedDriverId(driverId);
    }, []);

    const leaveTripRoom = useCallback((tripId: string) => {
        socket.emit(SOCKET_EVENTS.LEAVE_RIDE, { tripId });


        // Remove from tracked rooms
        setJoinedRooms((prev) => {
            const newMap = new Map(prev);
            newMap.delete(tripId);
            return newMap;
        });
    }, []);

    const isInTripRoom = useCallback(
        (tripId: string) => {
            return joinedRooms.has(tripId);
        },
        [joinedRooms]
    );

    // ==================== GENERIC EVENT LISTENERS ====================

    const subscribe = useCallback(
        (eventName: string, callback: (data: any) => void) => {
            socket.on(eventName, callback);
            return () => {
                socket.off(eventName, callback);
            };
        },
        []
    );

    const unsubscribe = useCallback((eventName: string, callback?: (data: any) => void) => {
        if (callback) {
            socket.off(eventName, callback);
        } else {
            socket.off(eventName);
        }
    }, []);

    const emit = useCallback((eventName: string, data: any) => {
        if (socket.connected) {
            socket.emit(eventName, data);
        }
    }, []);

    // ==================== TRIP EVENT HANDLERS ====================

    const onTripRequested = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripData = {
                ...data,
                trip_id: data.tripId || data.trip_id,
            };
            callback(tripData);
        };
        socket.on(SOCKET_EVENTS.TRIP_REQUESTED, handler);
        return () => socket.off(SOCKET_EVENTS.TRIP_REQUESTED, handler);
    }, []);

    const onTripAccepted = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripId = data.tripId || data.trip_id;
            callback({ ...data, trip_id: tripId });
        };
        const events = [
            SOCKET_EVENTS.TRIP_ACCEPTED,
            'TRIP_ACCEPTED',
            'trip_accepted',
            'DRIVER_ASSIGNED',
            'driver_assigned',
            'RIDE_ACCEPTED',
            'ride_accepted',
        ];

        events.forEach((event) => socket.on(event, handler));
        return () => events.forEach((event) => socket.off(event, handler));
    }, []);

    const onTripArriving = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripId = data.tripId || data.trip_id;
            callback({ ...data, trip_id: tripId });
        };
        socket.on(SOCKET_EVENTS.TRIP_ARRIVING, handler);
        return () => socket.off(SOCKET_EVENTS.TRIP_ARRIVING, handler);
    }, []);

    const onTripLive = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripId = data.tripId || data.trip_id;
            callback({ ...data, trip_id: tripId });
        };
        socket.on(SOCKET_EVENTS.TRIP_LIVE, handler);
        return () => socket.off(SOCKET_EVENTS.TRIP_LIVE, handler);
    }, []);

    const onDestinationReached = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripId = data.tripId || data.trip_id;
            callback({ ...data, trip_id: tripId });
        };
        socket.on(SOCKET_EVENTS.DESTINATION_REACHED, handler);
        return () => socket.off(SOCKET_EVENTS.DESTINATION_REACHED, handler);
    }, []);

    const onTripCompleted = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripId = data.tripId || data.trip_id;
            callback({ ...data, trip_id: tripId });
        };
        socket.on(SOCKET_EVENTS.TRIP_COMPLETED, handler);
        return () => socket.off(SOCKET_EVENTS.TRIP_COMPLETED, handler);
    }, []);

    const onTripCancelled = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripId = data.tripId || data.trip_id;
            callback({ ...data, trip_id: tripId });
        };
        socket.on(SOCKET_EVENTS.TRIP_CANCELLED, handler);
        return () => socket.off(SOCKET_EVENTS.TRIP_CANCELLED, handler);
    }, []);

    const onRideReassigning = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripId = data.tripId || data.trip_id;
            callback({ ...data, trip_id: tripId });
        };
        socket.on('RIDE_REASSIGNING', handler);
        return () => socket.off('RIDE_REASSIGNING', handler);
    }, []);

    const onTripMidCancelled = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripId = data.tripId || data.trip_id;
            callback({ ...data, trip_id: tripId });
        };
        socket.on(TripSocketEvent.TRIP_MID_CANCELLED, handler);
        return () => socket.off(TripSocketEvent.TRIP_MID_CANCELLED, handler);
    }, []);

    const onTripStatusUpdated = useCallback((callback: (data: any) => void) => {
        const handler = (data: any) => {
            const tripId = data.tripId || data.trip_id;
            callback({ ...data, trip_id: tripId });
        };
        socket.on(SOCKET_EVENTS.TRIP_STATUS_UPDATED, handler);
        return () => socket.off(SOCKET_EVENTS.TRIP_STATUS_UPDATED, handler);
    }, []);

    const onTripStatusChanged = useCallback((callback: (data: any) => void) => {
        const handler = async (data: any) => {
            const tripId = data.tripId || data.trip_id || data.rideId || data.trip?.trip_id;

            if (tripId) {
                try {
                    const response = await dispatch(tripApi.endpoints.getActiveTrip.initiate(undefined, { forceRefetch: true }) as any);
                    if (response?.data?.data) {
                        dispatch(setActiveTrip(response.data.data));
                        callback(response.data.data);
                        return;
                    }
                } catch (err) {
                    console.log("Failed to sync active trip on status change", err);
                }
            }

            callback({ ...data, trip_id: tripId });
        };

        const events = [
            SOCKET_EVENTS.TRIP_STATUS_UPDATED,
            TripSocketEvent.TRIP_STATUS_CHANGED,
            TripSocketEvent.TRIP_UPDATED,
            SOCKET_EVENTS.TRIP_ACCEPTED,
            SOCKET_EVENTS.TRIP_ARRIVING,
            SOCKET_EVENTS.TRIP_LIVE,
            SOCKET_EVENTS.TRIP_COMPLETED,
            SOCKET_EVENTS.TRIP_CANCELLED,
            "trip_updated",
            "DRIVER_ASSIGNED",
            "driver_assigned",
            "trip_accepted",
            "ride_accepted",
        ];

        events.forEach((event) => socket.on(event, handler));
        return () => events.forEach((event) => socket.off(event, handler));
    }, []);

    const onDriverLocationUpdated = useCallback((callback: (data: any) => void) => {
        const handler = (...args: any[]) => {

            const data = args[0]; // Primary data

            // Handle both object and positional arguments
            const locationData = {
                latitude: data?.latitude || data?.lat || (typeof args[1] === 'number' ? args[1] : null),
                longitude: data?.longitude || data?.lng || (typeof args[2] === 'number' ? args[2] : null),
                heading: data?.heading || data?.bearing || 0,
                eta: data?.eta || data?.duration || 0,
                trip_id: data?.trip_id || data?.tripId || data?.rideId || (typeof data === 'string' ? data : null),
            };

            if (locationData.latitude && locationData.longitude) {
                callback(locationData);
            } else {

            }
        };

        const events = [
            SOCKET_EVENTS.DRIVER_LOCATION_UPDATED,
            SOCKET_EVENTS.DRIVER_LOCATION,
            "DRIVER_LOCATION",
            "driver_location",
            "location_update",
            "locationUpdate",
            "updateLocation",
            "updateDriverLocation",
            "location_updates",
            "driverLocationUpdate"
        ];

        events.forEach((event) => {
            socket.on(event, handler);
        });

        return () => {
            events.forEach((event) => {
                socket.off(event, handler);
            });
        };
    }, []);

    // ==================== CONTEXT VALUE ====================

    const value: ISocketContext = {
        socket,
        isConnected,
        socketId,
        joinTripRoom,
        joinUserRoom,
        joinDriverRoom,
        leaveTripRoom,
        isInTripRoom,
        subscribe,
        unsubscribe,
        emit,
        onTripRequested,
        onTripAccepted,
        onTripArriving,
        onTripLive,
        onDestinationReached,
        onTripCompleted,
        onTripCancelled,
        onRideReassigning,
        onTripMidCancelled,
        onTripStatusUpdated,
        onTripStatusChanged,
        onDriverLocationUpdated,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;