import { useState, useCallback } from 'react';
import PolylineDecoder from '@mapbox/polyline';
import { Alert } from 'react-native';

interface Location {
    lat: number;
    lng: number;
}

interface RouteCoordinate {
    latitude: number;
    longitude: number;
}

export const useDirections = (googleApiKey: string) => {
    const [coords, setCoords] = useState<RouteCoordinate[]>([]);
    const [distance, setDistance] = useState<string>('');
    const [duration, setDuration] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const calculateRoute = useCallback(async (pickup: Location, dropLocation: Location) => {
        if (!pickup?.lat || !dropLocation?.lat) return null;

        setLoading(true);
        try {
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.lat},${pickup.lng}&destination=${dropLocation.lat},${dropLocation.lng}&key=${googleApiKey}`;

            const response = await fetch(url);
            const json = await response.json();

            if (json.status === 'OK' && json.routes.length > 0) {
                const encodedPoints = json.routes[0].overview_polyline.points;
                const decodedPoints = PolylineDecoder.decode(encodedPoints);

                const routeCoords = decodedPoints.map(point => ({
                    latitude: point[0],
                    longitude: point[1],
                }));

                setCoords(routeCoords);
                const distanceText = json.routes[0].legs[0].distance.text;
                const durationText = json.routes[0].legs[0].duration.text;
                setDistance(distanceText);
                setDuration(durationText);

                return { routeCoords, distanceText, durationText }; // Return for external use
            }
        } catch (error) {
            Alert.alert('Network Error!!!', 'Try Again Later');
            // console.error("Route Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    }, [googleApiKey]);

    return {
        coords,
        distance,
        duration,
        loading,
        calculateRoute,
        setCoords
    };
};