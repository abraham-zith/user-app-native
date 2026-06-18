import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { requestLocationPermission } from '../../service/utils/permissions';
import Geolocation from 'react-native-geolocation-service';
import { useAppTheme } from '../../hooks/useAppTheme';
import { darkMapStyle } from '../../constant/colors';
import { useOptimization } from '../../context/OptimizationContext';


interface LocationProps {
    pickup?: { lat: number, lng: number }
    dropLocation?: { lat: number, lng: number }
}


interface LocationType {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}
export default function MapViewComponent({ pickup, dropLocation }: LocationProps) {
    const { colors: appColors, isDark } = useAppTheme();
    const { shouldThrottle } = useOptimization();
    const [location, setLocation] = useState<LocationType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Initial Region (Default to Chennai)
    const initialRegion = {
        latitude: pickup?.lat || 13.0822,
        longitude: pickup?.lng || 80.2755,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    const handleGetLocation = async () => {
        const hasPermission = await requestLocationPermission();

        if (hasPermission) {
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({
                        latitude,
                        longitude,
                        latitudeDelta: 0.015, // Zoom in closer when location found
                        longitudeDelta: 0.0121,
                    });
                    setLoading(false);
                },
                (error) => {

                    Alert.alert("Error", "Could not get your location.");
                    setLoading(false);
                },
                { enableHighAccuracy: !shouldThrottle, timeout: 15000, maximumAge: 10000 }
            );
        } else {
            Alert.alert("Permission Denied", "Location access is required.");
            setLoading(false);
        }
    };

    // Run this when the component mounts
    useEffect(() => {
        let isMounted = true;

        const getLocation = async () => {
            const hasPermission = await requestLocationPermission();
            if (hasPermission && isMounted) {
                handleGetLocation(); // This triggers Geolocation.getCurrentPosition
            }
        };

        getLocation();

        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: appColors.background }]}>
                <ActivityIndicator size="large" color={appColors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                customMapStyle={isDark ? darkMapStyle : undefined}
                // 'region' moves the map when 'location' state changes
                region={location || initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsTraffic={!shouldThrottle}
                rotateEnabled={!shouldThrottle}
                scrollEnabled={true}
                zoomEnabled={true}
            >
                {location && (
                    <Marker
                        coordinate={location}
                        title="Your Location"
                        description="You are here"
                    />
                )}
            </MapView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchContainer: {
        position: 'absolute',
        width: '90%',
        backgroundColor: 'transparent',
        top: 50, // Adjust based on status bar height
        alignSelf: 'center',
        zIndex: 1, // Ensures the search bar stays on top of the map
    },
    searchBar: {
        height: 50,
        color: '#5d5d5d',
        fontSize: 16,
        borderRadius: 10,
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
    },
    resultsList: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginTop: 5,
    },
});