import { ActivityIndicator, Alert, Image, StyleSheet, View } from "react-native";
import MapView, { AnimatedRegion, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import PolylineDecoder from '@mapbox/polyline';
import { Text } from "../../../Components";
import { useEffect, useRef, useState } from "react";
import Config from "react-native-config";
import { hS, vS, mS } from '../../../lib/responsive'; // Ensure this path is correct


const GOOGLE_MAPS_APIKEY = Config.GOOGLE_API_KEY;

type RideStatus = 'IDLE' | 'REQUESTED' | 'ACCEPTED' | 'ARRIVING' | 'ARRIVED' | 'LIVE' | 'COMPLETED';

interface LocationProps {
    status: RideStatus;
    pickup?: { address: string, lat: number, lng: number };
    dropLocation?: { address: string, lat: number, lng: number };
    driver?: any;
    nearbyDrivers?: any[];
}

export default function MapLocationPolyline({ status, pickup, dropLocation, driver, nearbyDrivers }: LocationProps) {
    const mapRef = useRef<MapView>(null);

    const [coords, setCoords] = useState<{ latitude: number, longitude: number }[]>([]);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(true);


    const [animatedDriver] = useState(new AnimatedRegion({
        latitude: driver?.lat || 0,
        longitude: driver?.lng || 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
    }));

    const initialRegion = {
        latitude: Number(pickup?.lat || 9.54801540),
        longitude: Number(pickup?.lng || 78.60085770),
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
    };

    // 2. Marker Coordinates (Only if data exists)
    const pickuplocation = pickup ? {
        latitude: Number(pickup.lat),
        longitude: Number(pickup.lng),
    } : null;

    const dropupLocation = dropLocation ? {
        latitude: Number(dropLocation.lat),
        longitude: Number(dropLocation.lng),
    } : null;

    useEffect(() => {
        if (driver) {
            const newLat = Number(driver.lat || driver.latitude);
            const newLng = Number(driver.lng || driver.longitude);

            if (!isNaN(newLat) && !isNaN(newLng)) {
                // console.log("🚗 Animating driver to:", { newLat, newLng });
                animatedDriver.timing({
                    toValue: {
                        latitude: newLat,
                        longitude: newLng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    },
                    duration: 1000,
                    useNativeDriver: false,
                } as any).start();
            }
        }
    }, [driver?.lat, driver?.lng, driver?.latitude, driver?.longitude]);

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
                            edgePadding: {
                                top: vS(80),
                                right: hS(50),
                                bottom: vS(50),
                                left: hS(50)
                            },
                            animated: true,
                        });
                    }, 500);
                }
                setDistance(json.routes[0].legs[0].distance.text);
                setDuration(json.routes[0].legs[0].duration.text);
                // const fromDetails = await fetchGeocodeDetails(pickup.lat, pickup.lng);
                // const toDetails = await fetchGeocodeDetails(dropLocation.lat, dropLocation.lng);
            } else {
            }
        } catch (error) {
            // console.error("Network Error:", error);
            Alert.alert('Something Went Wrong!!!', 'Try Again Later');
        } finally {
            setLoading(false);
        }
    };

    const fetchGeocodeDetails = async (lat: number, lng: number) => {
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_APIKEY}`;
        const response = await fetch(geoUrl);
        const data = await response.json();

        let area = "";
        let district = "";

        if (data.results.length > 0) {
            const components = data.results[0].address_components;

            components.forEach((component: any) => {
                if (component.types.includes("sublocality_level_1")) {
                    area = component.long_name;
                }
                if (component.types.includes("administrative_area_level_2")) {
                    district = component.long_name;
                }
            });
        }

        return { area, district };
    };

    useEffect(() => {
        if (distance && duration) {

        }
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
        <View style={[styles.container]}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={initialRegion}
                showsUserLocation={status === 'IDLE'}
                showsMyLocationButton={status === 'IDLE'}
            >

                {coords.length > 0 && (
                    <>
                        <Marker
                            style={styles.pickupDot}
                            coordinate={coords[0]}
                            title="Pickup"
                            description={pickup?.address}
                            tracksViewChanges={false}

                        />
                        <Marker
                            style={styles.dropDot}
                            coordinate={coords[coords.length - 1]}
                            title="Drop-off"
                            description={dropLocation?.address}
                            tracksViewChanges={false}
                        />
                        <Polyline
                            coordinates={coords}
                            strokeWidth={mS(4)}
                            strokeColor="#2563EB"
                            lineJoin="round"
                            tappable={false} // Performance optimization
                        />
                    </>
                )}
                {(status === 'LIVE' || status === 'ACCEPTED' || status === 'ARRIVING' || status === 'ARRIVED') && driver && (
                    <Marker.Animated
                        coordinate={animatedDriver as any}
                        flat
                        anchor={{ x: 0.5, y: 0.5 }}
                        rotation={driver.heading || 0}
                    >
                        <Image
                            source={require('../../../assets/png/car.png')}
                            style={styles.carImage}
                        />
                    </Marker.Animated>
                )}

                {(status === 'IDLE' || status === 'REQUESTED') && nearbyDrivers?.map((item) => (
                    <Marker
                        key={item.id}
                        coordinate={{
                            latitude: item.lat,
                            longitude: item.lng,
                        }}
                        anchor={{ x: 0.5, y: 0.5 }}
                        flat
                        tracksViewChanges={false}
                    >
                        <Image
                            source={require('../../../assets/png/car.png')}
                            style={{ width: 30, height: 30, resizeMode: 'contain' }}
                        />
                    </Marker>
                ))}
                {/* {drivers.map((driver: any) => (
                    <Marker
                        key={driver.id} // Crucial for performance
                        coordinate={{ latitude: driver.lat, longitude: driver.lng }}
                    >
                        <Image
                            source={require('../../../assets/png/car.png')}
                            style={{
                                width: 40,
                                height: 40,
                                // transform: [{ rotate: `${rotation}deg` }], // Backup for some versions
                                resizeMode: 'contain',
                            }}
                        />
                    </Marker>
                ))} */}
            </MapView>
            {status !== 'IDLE' && !loading && distance !== "" && (
                <View style={styles.detailsBox}>
                    <View style={styles.infoCol}>
                        <Text style={styles.label}>DISTANCE</Text>
                        <Text style={styles.value}>{distance}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoCol}>
                        <Text style={styles.label}>TIME</Text>
                        <Text style={styles.value}>{duration}</Text>
                    </View>
                </View>
            )}

            {loading && (
                <View style={styles.mapLoader}>
                    <ActivityIndicator color="#2563EB" />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: {
        flex: 1
    },
    map: {
        flex: 1
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'white'
    },
    loadingText: {
        marginTop: vS(10),
        fontSize: mS(14),
        color: '#64748B'
    },
    // Markers
    pickupDot: {
        width: hS(16),
        height: hS(16),
        borderRadius: hS(8),
        backgroundColor: '#22C55E',
        borderWidth: mS(3),
        borderColor: 'white',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    dropDot: {
        width: hS(16),
        height: hS(16),
        borderRadius: hS(8),
        backgroundColor: '#EF4444',
        borderWidth: mS(3),
        borderColor: 'white',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    // Floating Info Box
    detailsBox: {
        position: "absolute",
        top: vS(50), // Responsive top margin
        backgroundColor: "white",
        flexDirection: 'row',
        paddingVertical: vS(10),
        paddingHorizontal: hS(10),
        borderRadius: mS(18),
        width: '90%',
        alignSelf: "center",
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: vS(4) },
        shadowRadius: mS(10),
    },
    infoCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    divider: {
        width: 1,
        height: '70%',
        backgroundColor: '#E2E8F0',
        alignSelf: 'center'
    },
    label: {
        fontSize: mS(8),
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: vS(2),
        letterSpacing: 0.5
    },
    value: {
        fontSize: mS(14),
        fontWeight: '700',
        color: '#1E293B'
    },
    mapLoader: {
        position: 'absolute',
        top: vS(100),
        alignSelf: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        elevation: 5
    },
    carImage: { width: mS(40), height: mS(40), resizeMode: 'contain' },
});