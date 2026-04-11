import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, Image, Alert, Animated, Easing, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, AnimatedRegion } from 'react-native-maps';
import { useAppTheme } from '../../hooks/useAppTheme';
import { darkMapStyle } from '../../constant/colors';
import { useSocket } from '../../Socket/SocketContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapViewDirections from 'react-native-maps-directions';
import Config from 'react-native-config';
import { hS, mS, vS } from '../../lib/responsive';
import Pulse from '../../Components/Pulse';
import { useUpdateTripChangesMutation, useUpdateTripMutation } from '../../service/userApi';
import { ChangeBy, ChangeType, TripStatus } from '../../enums/trip.enum';
import { RideCompletedScreen_Nav, TabNavigation_Nav } from '../../Navigations/navigations';
import { useDispatch } from 'react-redux';
import { updateTripInArray } from '../../redux/tripSlice';

const GOOGLE_P_API_KEY = Config.GOOGLE_API_KEY;

export type TripPhase = 'TO_PICKUP' | 'TO_DESTINATION' | 'COMPLETED' | 'DESTINATION_REACHED';
interface props {
    trip?: any;
    status?: TripStatus;
    onFindETA?: (eta: number) => void;
    onTripPhase?: (tripPhase: TripPhase) => void;
    driver?: any;
    liveDriverLocation?: any;
}

// –––––––––––––––––––––––––––––––––––––––––
// 🛠 HELPERS
// –––––––––––––––––––––––––––––––––––––––––
const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const rad = Math.PI / 180;
    const lat1 = startLat * rad;
    const lat2 = endLat * rad;
    const lon1 = startLng * rad;
    const lon2 = endLng * rad;
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
};

const calculateDistance = (p1: any, p2: any) => {
    const R = 6371e3; // meters
    const φ1 = p1.latitude * Math.PI / 180;
    const φ2 = p2.latitude * Math.PI / 180;
    const Δφ = (p2.latitude - p1.latitude) * Math.PI / 180;
    const Δλ = (p2.longitude - p1.longitude) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const snapToRoute = (point: any, polyline: any[]) => {
    if (!polyline || polyline.length < 2) return { point, distance: Infinity };
    let minDistance = Infinity;
    let nearestPoint = point;

    // Check last 20 points for better performance
    const relevantPoints = polyline.slice(-20);

    for (let i = 0; i < relevantPoints.length - 1; i++) {
        const p1 = relevantPoints[i];
        const p2 = relevantPoints[i + 1];

        // Project point onto line segment
        const dx = p2.longitude - p1.longitude;
        const dy = p2.latitude - p1.latitude;
        const t = Math.max(0, Math.min(1,
            ((point.longitude - p1.longitude) * dx + (point.latitude - p1.latitude) * dy) /
            (dx * dx + dy * dy)
        ));

        const projected = {
            latitude: p1.latitude + t * dy,
            longitude: p1.longitude + t * dx
        };

        const dist = calculateDistance(point, projected);
        if (dist < minDistance) {
            minDistance = dist;
            nearestPoint = projected;
        }
    }

    return { point: nearestPoint, distance: minDistance };
};

const normalizeAngle = (angle: number) => {
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
};

const getShortestAngleDiff = (from: number, to: number) => {
    let diff = to - from;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
};

// –––––––––––––––––––––––––––––––––––––––––
// 🎨 STYLES
// –––––––––––––––––––––––––––––––––––––––––
const styles = StyleSheet.create({
    container: { ...StyleSheet.absoluteFillObject },
    map: { ...StyleSheet.absoluteFillObject },
    pickupDot: {
        width: 16, height: 16, borderRadius: 8, backgroundColor: '#10B981',
        borderWidth: 3, borderColor: 'white', elevation: 5
    },
    dropDot: {
        width: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444',
        borderWidth: 3, borderColor: 'white', elevation: 5
    },
    statusBadge: {
        position: 'absolute', top: 50, alignSelf: 'center', backgroundColor: 'white',
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, elevation: 5,
        flexDirection: 'column', alignItems: 'center', borderColor: '#F3F4F6', borderWidth: 1
    },
    etaContainer: { flexDirection: 'row', alignItems: 'center' },
    arrivalBadgeText: { fontSize: 13, fontWeight: '800', color: '#111827', textTransform: 'uppercase' },
    rideIdText: { fontSize: 9, color: '#9CA3AF', fontWeight: '500', marginTop: 2 }
});

// –––––––––––––––––––––––––––––––––––––––––
// 🚀 SMOOTH CAR COMPONENT
// –––––––––––––––––––––––––––––––––––––––––
// const SmoothCar = React.memo(React.forwardRef(({ initialPos, carImage }: any, ref) => {
//     const coordinate = useRef({
//         latitude: initialPos.latitude,
//         longitude: initialPos.longitude,
//     }).current;

//     const animatedLatitude = useRef(new Animated.Value(initialPos.latitude)).current;
//     const animatedLongitude = useRef(new Animated.Value(initialPos.longitude)).current;
//     const animatedRotation = useRef(new Animated.Value(normalizeAngle(initialPos.heading || 0))).current;
//     const currentHeading = useRef(normalizeAngle(initialPos.heading || 0));
//     const markerRef = useRef<any>(null);

//     // Create animated coordinate object
//     const animatedCoordinate = {
//         latitude: animatedLatitude,
//         longitude: animatedLongitude,
//     };

//     React.useImperativeHandle(ref, () => ({
//         animateTo: (newLat: number, newLng: number, newHeading: number) => {
//             // Use the native animateMarkerToCoordinate for smoothest movement
//             if (markerRef.current?.animateMarkerToCoordinate) {
//                 markerRef.current.animateMarkerToCoordinate(
//                     { latitude: newLat, longitude: newLng },
//                     1000
//                 );
//             }

//             // Also animate the Animated.Values for coordinate
//             Animated.parallel([
//                 Animated.timing(animatedLatitude, {
//                     toValue: newLat,
//                     duration: 1000,
//                     useNativeDriver: false,
//                     easing: Easing.out(Easing.ease),
//                 }),
//                 Animated.timing(animatedLongitude, {
//                     toValue: newLng,
//                     duration: 1000,
//                     useNativeDriver: false,
//                     easing: Easing.out(Easing.ease),
//                 }),
//             ]).start();

//             // Smooth heading animation with shortest path
//             const normalizedNewHeading = normalizeAngle(newHeading);
//             const angleDiff = getShortestAngleDiff(currentHeading.current, normalizedNewHeading);
//             const targetHeading = currentHeading.current + angleDiff;

//             Animated.timing(animatedRotation, {
//                 toValue: targetHeading,
//                 duration: 800,
//                 useNativeDriver: false,
//                 easing: Easing.out(Easing.cubic),
//             }).start(() => {
//                 currentHeading.current = normalizeAngle(targetHeading);
//             });
//         }
//     }));

//     return (
//         <Marker.Animated
//             ref={markerRef}
//             coordinate={animatedCoordinate}
//             rotation={animatedRotation}
//             anchor={{ x: 0.5, y: 0.5 }}
//             flat={true}
//             tracksViewChanges={false}
//         >
//             <Image
//                 source={require('../../assets/png/car.png')}
//                 style={{ width: 44, height: 44 }}
//                 resizeMode="contain"
//             />
//         </Marker.Animated>
//     );
// }));
// –––––––––––––––––––––––––––––––––––––––––
// 🚀 SMOOTH CAR COMPONENT
// –––––––––––––––––––––––––––––––––––––––––
const SmoothCar = React.memo(React.forwardRef(({ initialPos, carImage }: any, ref) => {
    const animatedLatitude = useRef(new Animated.Value(initialPos.latitude)).current;
    const animatedLongitude = useRef(new Animated.Value(initialPos.longitude)).current;
    const animatedRotation = useRef(new Animated.Value(normalizeAngle(initialPos.heading || 0))).current;
    const currentHeading = useRef(normalizeAngle(initialPos.heading || 0));
    const markerRef = useRef<any>(null);

    // Create animated coordinate object
    const animatedCoordinate = {
        latitude: animatedLatitude,
        longitude: animatedLongitude,
    };

    React.useImperativeHandle(ref, () => ({
        animateTo: (newLat: number, newLng: number, newHeading: number) => {
            // Use the native animateMarkerToCoordinate for smoothest movement
            if (markerRef.current?.animateMarkerToCoordinate) {
                markerRef.current.animateMarkerToCoordinate(
                    { latitude: newLat, longitude: newLng },
                    1000
                );
            }

            // Also animate the Animated.Values for coordinate
            Animated.parallel([
                Animated.timing(animatedLatitude, {
                    toValue: newLat,
                    duration: 1000,
                    useNativeDriver: false,
                    easing: Easing.linear,
                }),
                Animated.timing(animatedLongitude, {
                    toValue: newLng,
                    duration: 1000,
                    useNativeDriver: false,
                    easing: Easing.linear,
                }),
            ]).start();

            // Smooth heading animation with shortest path
            const normalizedNewHeading = normalizeAngle(newHeading);
            const angleDiff = getShortestAngleDiff(currentHeading.current, normalizedNewHeading);
            const targetHeading = currentHeading.current + angleDiff;

            Animated.timing(animatedRotation, {
                toValue: targetHeading,
                duration: 1000,
                useNativeDriver: false,
                easing: Easing.linear,
            }).start(() => {
                currentHeading.current = normalizeAngle(targetHeading);
            });
        }
    }));

    return (
        <Marker.Animated
            ref={markerRef}
            coordinate={animatedCoordinate}
            rotation={animatedRotation}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            tracksViewChanges={false}
        >
            <Image
                source={require('../../assets/png/car.png')}
                style={{ width: 44, height: 44 }}
                resizeMode="contain"
            />
        </Marker.Animated>
    );
}));

export const UserAppUI = ({ trip, status, onFindETA, onTripPhase, driver, liveDriverLocation }: props) => {
    const { colors: appColors, isDark } = useAppTheme();
    const route = useRoute();
    const navigation = useNavigation<any>();
    const tripDetails = route.params as any;
    const tripData = trip || tripDetails || {};
    const RIDE_ID = tripData.trip_code;

    const [eta, setEta] = useState<number>(2);
    const [driverPos, setDriverPos] = useState({
        latitude: parseFloat(driver?.current_lat || driver?.driverLat || tripData.pickup_lat) || 12.9716,
        longitude: parseFloat(driver?.current_lng || driver?.driverLng || tripData.pickup_lng) || 77.5946,
        heading: parseFloat(driver?.current_heading || driver?.heading) || 0
    });

    const hasReceivedLiveUpdate = useRef(false);
    const previousPosRef = useRef({ latitude: driverPos.latitude, longitude: driverPos.longitude });
    const smoothedHeadingRef = useRef(driverPos.heading);
    const lastUpdateTsRef = useRef(Date.now());
    const lastMapUpdateRef = useRef(Date.now());
    const mapRef = useRef<MapView>(null);
    const carRef = useRef<any>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
    const [fullRouteCoordinates, setFullRouteCoordinates] = useState<any[]>([]);
    const [dynamicRouteOrigin, setDynamicRouteOrigin] = useState(driverPos);
    const hasInitialFit = useRef(false);
    const [showCancelButton, setShowCancelButton] = useState(false);

    const currentStatusValue = status || tripData.trip_status;
    const isArriving = currentStatusValue === TripStatus.ARRIVING || currentStatusValue === TripStatus.ACCEPTED || currentStatusValue === TripStatus.ARRIVED;
    const isLive = currentStatusValue === TripStatus.LIVE || currentStatusValue === TripStatus.COMPLETED;
    const routeDestination = (currentStatusValue === TripStatus.ARRIVED || currentStatusValue === TripStatus.LIVE || currentStatusValue === TripStatus.COMPLETED)
        ? { latitude: parseFloat(tripData.drop_lat), longitude: parseFloat(tripData.drop_lng) }
        : { latitude: parseFloat(tripData.pickup_lat), longitude: parseFloat(tripData.pickup_lng) };

    useEffect(() => {
        if (currentStatusValue === TripStatus.CANCELLED || currentStatusValue === TripStatus.MID_CANCELLED) {
            Alert.alert("Ride Cancelled", "Your ride has been cancelled by the driver or system.");
            setShowCancelButton(true);
        } else {
            setShowCancelButton(false);
        }
    }, [currentStatusValue]);

    useEffect(() => {
        if (driver && !hasReceivedLiveUpdate.current) {
            const newLat = parseFloat(driver.current_lat || driver.driverLat);
            const newLng = parseFloat(driver.current_lng || driver.driverLng);
            if (newLat && newLng) {
                setDriverPos({ latitude: newLat, longitude: newLng, heading: 0 });
                setDynamicRouteOrigin({ latitude: newLat, longitude: newLng, heading: 0 });
                previousPosRef.current = { latitude: newLat, longitude: newLng };
            }
        }
    }, [driver]);

    useEffect(() => {
        if (RIDE_ID) {
            hasReceivedLiveUpdate.current = false;
            hasInitialFit.current = false;
            setRouteCoordinates([]);
            setFullRouteCoordinates([]);
        }
    }, [RIDE_ID]);

    // useEffect(() => {
    //     if (!liveDriverLocation || !RIDE_ID) return;
    //     const incomingTripId = liveDriverLocation.trip_id || liveDriverLocation.tripId;
    //     if (incomingTripId?.toString() !== tripData.trip_id?.toString()) return;

    //     hasReceivedLiveUpdate.current = true;
    //     const rawLat = parseFloat(liveDriverLocation.latitude || liveDriverLocation.lat);
    //     const rawLng = parseFloat(liveDriverLocation.longitude || liveDriverLocation.lng);
    //     const backendHeading = parseFloat(liveDriverLocation.heading || liveDriverLocation.bearing) || 0;
    //     const newEta = liveDriverLocation.eta;

    //     if (!rawLat || !rawLng) return;
    //     if (newEta) { setEta(newEta); onFindETA?.(newEta); }

    //     const rawPoint = { latitude: rawLat, longitude: rawLng };

    //     // Calculate distance moved since last update
    //     const distMoved = calculateDistance(previousPosRef.current, rawPoint);

    //     // Skip micro-movements to reduce jitter
    //     if (distMoved < 2) return;

    //     // Smart path snapping - only snap if close to known route
    //     let activeLat = rawLat;
    //     let activeLng = rawLng;

    //     if (fullRouteCoordinates.length > 10) {
    //         const { point: snapped, distance } = snapToRoute(rawPoint, fullRouteCoordinates);
    //         // Only snap if very close to route (within 15 meters)
    //         if (distance < 15) {
    //             activeLat = snapped.latitude;
    //             activeLng = snapped.longitude;
    //         }
    //     }

    //     // Calculate heading from movement direction
    //     let newHeading = smoothedHeadingRef.current;

    //     if (distMoved > 5) {
    //         // Calculate heading from actual movement
    //         const calculatedHeading = calculateBearing(
    //             previousPosRef.current.latitude,
    //             previousPosRef.current.longitude,
    //             activeLat,
    //             activeLng
    //         );

    //         // Smoothly blend with backend heading if available
    //         if (backendHeading !== 0) {
    //             const headingDiff = getShortestAngleDiff(calculatedHeading, backendHeading);
    //             newHeading = normalizeAngle(calculatedHeading + headingDiff * 0.3);
    //         } else {
    //             newHeading = calculatedHeading;
    //         }

    //         // Apply smoothing to prevent jerky rotation
    //         const smoothFactor = 0.4;
    //         const diff = getShortestAngleDiff(smoothedHeadingRef.current, newHeading);
    //         smoothedHeadingRef.current = normalizeAngle(smoothedHeadingRef.current + diff * smoothFactor);
    //     } else if (backendHeading !== 0) {
    //         // Use backend heading for small movements
    //         const diff = getShortestAngleDiff(smoothedHeadingRef.current, backendHeading);
    //         smoothedHeadingRef.current = normalizeAngle(smoothedHeadingRef.current + diff * 0.2);
    //     }

    //     previousPosRef.current = { latitude: activeLat, longitude: activeLng };

    //     // Animate car smoothly
    //     carRef.current?.animateTo(activeLat, activeLng, smoothedHeadingRef.current);

    //     // Update state at controlled intervals
    //     const now = Date.now();
    //     if (now - lastUpdateTsRef.current > 800) {
    //         setDriverPos({
    //             latitude: activeLat,
    //             longitude: activeLng,
    //             heading: smoothedHeadingRef.current
    //         });

    //         // Add to traveled path
    //         setRouteCoordinates(prev => {
    //             const newPath = [...prev, { latitude: activeLat, longitude: activeLng }];
    //             // Keep only last 100 points to avoid memory issues
    //             return newPath.slice(-100);
    //         });

    //         setDynamicRouteOrigin({
    //             latitude: activeLat,
    //             longitude: activeLng,
    //             heading: smoothedHeadingRef.current
    //         });

    //         lastUpdateTsRef.current = now;
    //     }

    //     // Camera follow - smooth and less frequent
    //     if (now - lastMapUpdateRef.current > 2000) {
    //         mapRef.current?.animateCamera({
    //             center: { latitude: activeLat, longitude: activeLng },
    //             heading: smoothedHeadingRef.current,
    //             pitch: 0,
    //         }, { duration: 1500 });

    //         lastMapUpdateRef.current = now;
    //     }

    // }, [liveDriverLocation, RIDE_ID, fullRouteCoordinates]);


    useEffect(() => {
        if (!liveDriverLocation || !RIDE_ID) return;
        const incomingTripId = liveDriverLocation.trip_id || liveDriverLocation.tripId;
        if (incomingTripId?.toString() !== tripData.trip_id?.toString()) return;

        hasReceivedLiveUpdate.current = true;
        const rawLat = parseFloat(liveDriverLocation.latitude || liveDriverLocation.lat);
        const rawLng = parseFloat(liveDriverLocation.longitude || liveDriverLocation.lng);
        const backendHeading = parseFloat(liveDriverLocation.heading || liveDriverLocation.bearing) || 0;
        const newEta = liveDriverLocation.eta;

        if (!rawLat || !rawLng) return;
        if (newEta) { setEta(newEta); onFindETA?.(newEta); }

        const rawPoint = { latitude: rawLat, longitude: rawLng };

        // Calculate distance moved since last update
        const distMoved = calculateDistance(previousPosRef.current, rawPoint);

        // Skip micro-movements to reduce jitter
        if (distMoved < 2) return;

        // Smart path snapping - only snap if close to known route
        let activeLat = rawLat;
        let activeLng = rawLng;

        if (fullRouteCoordinates.length > 10) {
            const { point: snapped, distance } = snapToRoute(rawPoint, fullRouteCoordinates);
            // Only snap if very close to route (within 15 meters)
            if (distance < 15) {
                activeLat = snapped.latitude;
                activeLng = snapped.longitude;
            }
        }

        // IMPROVED HEADING CALCULATION
        let finalHeading = smoothedHeadingRef.current;

        // Priority 1: If significant movement, calculate heading from movement vector
        if (distMoved > 8) {
            const movementHeading = calculateBearing(
                previousPosRef.current.latitude,
                previousPosRef.current.longitude,
                activeLat,
                activeLng
            );

            // Use movement heading directly for significant movements
            finalHeading = movementHeading;

        } else if (distMoved > 3 && backendHeading !== 0) {
            // Priority 2: For moderate movement, blend movement with backend heading
            const movementHeading = calculateBearing(
                previousPosRef.current.latitude,
                previousPosRef.current.longitude,
                activeLat,
                activeLng
            );

            // 70% movement, 30% backend
            const movementDiff = getShortestAngleDiff(smoothedHeadingRef.current, movementHeading);
            const backendDiff = getShortestAngleDiff(smoothedHeadingRef.current, backendHeading);
            const blendedDiff = movementDiff * 0.7 + backendDiff * 0.3;
            finalHeading = normalizeAngle(smoothedHeadingRef.current + blendedDiff);

        } else if (backendHeading !== 0) {
            // Priority 3: For small movements, use backend heading with smoothing
            const diff = getShortestAngleDiff(smoothedHeadingRef.current, backendHeading);
            finalHeading = normalizeAngle(smoothedHeadingRef.current + diff * 0.5);
        }
        // If no backend heading and small movement, keep current heading

        // Apply gentle smoothing only for very small changes
        const headingChange = Math.abs(getShortestAngleDiff(smoothedHeadingRef.current, finalHeading));
        if (headingChange < 15) {
            // Small change - smooth it
            const diff = getShortestAngleDiff(smoothedHeadingRef.current, finalHeading);
            smoothedHeadingRef.current = normalizeAngle(smoothedHeadingRef.current + diff * 0.6);
        } else {
            // Large change - use it directly (turning)
            smoothedHeadingRef.current = finalHeading;
        }

        previousPosRef.current = { latitude: activeLat, longitude: activeLng };

        // Animate car smoothly
        carRef.current?.animateTo(activeLat, activeLng, smoothedHeadingRef.current);

        // Update state at controlled intervals
        const now = Date.now();
        if (now - lastUpdateTsRef.current > 800) {
            setDriverPos({
                latitude: activeLat,
                longitude: activeLng,
                heading: smoothedHeadingRef.current
            });

            // Add to traveled path
            setRouteCoordinates(prev => {
                const newPath = [...prev, { latitude: activeLat, longitude: activeLng }];
                // Keep only last 100 points to avoid memory issues
                return newPath.slice(-100);
            });

            setDynamicRouteOrigin({
                latitude: activeLat,
                longitude: activeLng,
                heading: smoothedHeadingRef.current
            });

            lastUpdateTsRef.current = now;
        }

        // Camera follow - smooth and less frequent
        if (now - lastMapUpdateRef.current > 2500) {
            mapRef.current?.animateCamera({
                center: { latitude: activeLat, longitude: activeLng },
                pitch: 0,
            }, { duration: 1500 });

            lastMapUpdateRef.current = now;
        }

    }, [liveDriverLocation, RIDE_ID, fullRouteCoordinates]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: parseFloat(tripData.driver_lat || tripData.pickup_lat) || 12.9716,
                    longitude: parseFloat(tripData.driver_lng || tripData.pickup_lng) || 77.5946,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                }}
                rotateEnabled={true}
                pitchEnabled={false}
                scrollEnabled={true}
                zoomEnabled={true}
                customMapStyle={isDark ? darkMapStyle : undefined}
            >
                {useMemo(() => (
                    routeDestination?.latitude && (
                        <MapViewDirections
                            origin={dynamicRouteOrigin}
                            destination={routeDestination}
                            apikey={GOOGLE_P_API_KEY || ""}
                            strokeWidth={4}
                            strokeColor="#2563EB"
                            precision="high"
                            optimizeWaypoints={true}
                            onReady={(res) => {
                                // Store full route for snapping
                                setFullRouteCoordinates(res.coordinates);

                                // Fit to coordinates only once on initial load
                                if (!isLive && !hasInitialFit.current) {
                                    mapRef.current?.fitToCoordinates(res.coordinates, {
                                        edgePadding: { top: 100, right: 80, bottom: 450, left: 80 },
                                        animated: true
                                    });
                                    hasInitialFit.current = true;
                                }
                            }}
                        />
                    )
                ), [RIDE_ID, routeDestination.latitude, routeDestination.longitude, dynamicRouteOrigin])}

                {/* Traveled path with gradient effect */}
                {routeCoordinates.length > 1 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#94A3B8"
                        strokeWidth={3}
                        lineCap="round"
                        lineJoin="round"
                        lineDashPattern={[1, 0]}
                    />
                )}

                {useMemo(() => (
                    <>
                        {(isArriving || isLive) && tripData.pickup_lat && (
                            <Marker
                                coordinate={{
                                    latitude: parseFloat(tripData.pickup_lat),
                                    longitude: parseFloat(tripData.pickup_lng)
                                }}
                                title="Pickup"
                                tracksViewChanges={false}
                            >
                                <View style={styles.pickupDot} />
                            </Marker>
                        )}
                        {isLive && tripData.drop_lat && (
                            <Marker
                                coordinate={{
                                    latitude: parseFloat(tripData.drop_lat),
                                    longitude: parseFloat(tripData.drop_lng)
                                }}
                                title="Destination"
                                tracksViewChanges={false}
                            >
                                <View style={styles.dropDot} />
                            </Marker>
                        )}
                    </>
                ), [RIDE_ID, isLive, isArriving])}

                <SmoothCar
                    ref={carRef}
                    initialPos={driverPos}
                    carImage={require('../../assets/png/car.png')}
                />
            </MapView>

            <View style={[styles.statusBadge, { backgroundColor: appColors.background, borderColor: appColors.border }]}>
                <View style={styles.etaContainer}>
                    {eta <= 1 && <Pulse />}
                    <Text style={[styles.arrivalBadgeText, { color: appColors.text }, eta <= 1 ? { color: '#10B981' } : null]}>
                        {currentStatusValue === TripStatus.ACCEPTED ? (
                            tripData.booking_type === 'SCHEDULED' ? (
                                tripData.scheduled_start_time ? (
                                    `START AT ${new Date(tripData.scheduled_start_time).toLocaleString([], {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                                    }).toUpperCase()}`
                                ) : "ACCEPTED"
                            ) : "CALCULATING..."
                        ) : (
                            currentStatusValue === TripStatus.LIVE ? "LIVE" :
                                eta <= 0 ? "DRIVER ARRIVED" : eta <= 1 ? "ARRIVING NOW" : `ARRIVING IN ${eta} MINS`
                        )}
                    </Text>
                </View>
                <Text style={[styles.rideIdText, { color: appColors.lightTextColor }]}>ID: {RIDE_ID}</Text>
            </View>

            {showCancelButton && (
                <View style={[extraStyles.cancelOverlay, { backgroundColor: appColors.background }]}>
                    <TouchableOpacity
                        style={[extraStyles.homeButton, { backgroundColor: appColors.primary }]}
                        onPress={() => navigation.reset({
                            index: 0,
                            routes: [{ name: TabNavigation_Nav }],
                        })}
                    >
                        <Text style={[extraStyles.homeButtonText, { color: isDark ? '#000' : '#fff' }]}>Return to Home</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default UserAppUI;

const extraStyles = StyleSheet.create({
    cancelOverlay: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        elevation: 10,
        alignItems: 'center',
    },
    homeButton: {
        backgroundColor: '#111',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    homeButtonText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 15,
    },
});
