import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import PolylineDecoder from '@mapbox/polyline';
import Config from 'react-native-config';

const GOOGLE_MAPS_APIKEY = Config.GOOGLE_API_KEY;

interface LocationProps {
    pickup?: { lat: number, lng: number };
    dropLocation?: { lat: number, lng: number };
}

const RouteMap = ({ pickup, dropLocation }: LocationProps) => {
    // 1. Reference to the map for "fitToCoordinates"
    const mapRef = useRef<MapView>(null);

    const [coords, setCoords] = useState<{ latitude: number, longitude: number }[]>([]);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(true);

    const initialRegion = {
        latitude: Number(pickup?.lat) || 9.54801540,
        longitude: Number(pickup?.lng) || 78.60085770,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
    }
    const pickuplocation = pickup ? {
        latitude: Number(pickup.lat),
        longitude: Number(pickup.lng),
    } : null;

    const dropupLocation = dropLocation ? {
        latitude: Number(dropLocation.lat),
        longitude: Number(dropLocation.lng),
    } : null;


    const getRoute = async () => {
        if (coords.length > 0) return;
        if (!pickup?.lat || !dropLocation?.lat) return;

        try {
            setLoading(true);
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.lat},${pickup.lng}&destination=${dropLocation.lat},${dropLocation.lng}&key=${GOOGLE_MAPS_APIKEY}`;

            const response = await fetch(url);
            const json = await response.json();


            if (json.status === 'OK' && json.routes.length > 0) {
                const encodedPoints = json.routes[0].overview_polyline.points;
                const decodedPoints = PolylineDecoder.decode(encodedPoints);
                const routeCoords = decodedPoints.map(point => ({
                    latitude: point[0],
                    longitude: point[1],
                }));
                if (routeCoords.length > 0) {
                    setCoords(routeCoords);
                    setTimeout(() => {
                        mapRef.current?.fitToCoordinates(routeCoords, {
                            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                            animated: true,
                        });
                    }, 500);
                }
                setDistance(json.routes[0].legs[0].distance.text);
                setDuration(json.routes[0].legs[0].duration.text);
            } else {
            }
        } catch (error) {
            Alert.alert('Network Error!!!', 'Try Again Later');
            // console.error("Network Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRoute();
    }, [pickup?.lat, pickup?.lng, dropLocation?.lat, dropLocation?.lng]); // 3. Re-run if locations change

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={{ marginTop: 10 }}>Calculating Route...</Text>
            </View>
        );
    }

    return (

        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE} // Better performance on Android
                style={styles.map}
                initialRegion={{
                    latitude: pickup?.lat || 9.54801540,
                    longitude: pickup?.lng || 78.60085770,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                }}
            >
                {coords.length > 0 && (
                    <>
                        <Marker
                            coordinate={coords[0]}
                            title="Pickup"
                            description=''
                            tracksViewChanges={false}
                        />
                        <Marker
                            coordinate={coords[coords.length - 1]}
                            title="Drop-off"
                            tracksViewChanges={false}
                        />
                        <Polyline
                            coordinates={coords}
                            strokeWidth={4}
                            strokeColor="#2563EB"
                            lineJoin="round"
                            tappable={false} // Performance optimization
                        />
                    </>
                )}

            </MapView>

            <View style={styles.detailsBox}>
                <View style={styles.infoCol}>
                    <Text style={styles.label}>DISTANCE</Text>
                    <Text style={styles.value}>{distance}</Text>
                </View>
                <View style={[styles.infoCol, { borderLeftWidth: 1, borderColor: '#E2E8F0' }]}>
                    <Text style={styles.label}>TIME</Text>
                    <Text style={styles.value}>{duration}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: "100%", height: "100%" },
    loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'white' },
    pickupDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 3, borderColor: 'white' },
    dropDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#EF4444', borderWidth: 3, borderColor: 'white' },
    detailsBox: {
        position: "absolute",
        bottom: 30,
        backgroundColor: "white",
        flexDirection: 'row',
        padding: 20,
        borderRadius: 20,
        width: '90%',
        alignSelf: "center",
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    infoCol: { flex: 1, alignItems: 'center' },
    label: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 4 },
    value: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
});


export default RouteMap;