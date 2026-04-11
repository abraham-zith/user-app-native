import { useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '../service/utils/permissions';
import Config from "react-native-config";


const GOOGLE_MAPS_APIKEY = Config.GOOGLE_API_KEY;

interface LocationType {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}



export const useLocation = () => {
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<LocationType | null>(null);


    const getCurrentLocation = (): Promise<Geolocation.GeoPosition> => {
        return new Promise(async (resolve, reject) => {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) return reject('Permission denied');

            setLoading(true);
            Geolocation.getCurrentPosition(
                (pos) => {
                    setLoading(false);
                    resolve(pos);
                },
                (err) => {
                    setLoading(false);
                    reject(err);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        });
    };

    const getAddressFromCoords = async (lat: number, lng: number) => {

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_APIKEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === "OK") {
                const result = data.results[0];
                const components = result.address_components;

                const find = (type: string) =>
                    components.find((c: any) => c.types.includes(type))?.long_name || null;

                const formattedAddress = result.formatted_address;

                const structured = {
                    area:
                        find("sublocality") ||
                        find("neighborhood") ||
                        find("sublocality_level_2") ||
                        find("sublocality_level_1"),

                    district:
                        find("administrative_area_level_2") ||
                        find("administrative_area_level_3") ||
                        find("locality") ||
                        find("sublocality") ||
                        null,

                    city:
                        find("locality") ||
                        find("administrative_area_level_2") || // sometimes city is stored here
                        null,

                    state: find("administrative_area_level_1"),

                    pincode: find("postal_code"),
                };

                return {
                    formatted: formattedAddress, // string
                    ...structured,               // structured fields
                };

                // if (data.status === 'OK') {
                //     const address = data.results[0].formatted_address;
                //     return address;
            } else {

            }
        } catch (error) {

        }
    };

    return { getCurrentLocation, getAddressFromCoords, loading };
};