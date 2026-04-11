import * as Keychain from "react-native-keychain";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";

const RECENT_LOCATIONS_KEY = '@recent_locations';

const ACCESS_KEY = "ACCESS_TOKEN";
const REFRESH_KEY = "REFRESH_TOKEN";

let currentSocketId: string | null = null;

export const storage = {
    // Save Access Token
    async setAccessToken(token: string) {
        await Keychain.setGenericPassword(ACCESS_KEY, token, {
            service: ACCESS_KEY,
        });
    },

    // Retrieve Access Token
    async getAccessToken() {
        const creds = await Keychain.getGenericPassword({ service: ACCESS_KEY });
        return creds ? creds.password : null;
    },

    // Delete Access Token
    async removeAccessToken() {
        await Keychain.resetGenericPassword({ service: ACCESS_KEY });
    },

    // Save Refresh Token
    async setRefreshToken(token: string) {
        await Keychain.setGenericPassword(REFRESH_KEY, token, {
            service: REFRESH_KEY,
        });
    },

    // Get Refresh Token
    async getRefreshToken() {
        const creds = await Keychain.getGenericPassword({ service: REFRESH_KEY });
        return creds ? creds.password : null;
    },

    // Delete Refresh Token
    async removeRefreshToken() {
        await Keychain.resetGenericPassword({ service: REFRESH_KEY });
    },

    // Clear all tokens
    async clearAll() {
        await Keychain.resetGenericPassword({ service: ACCESS_KEY });
        await Keychain.resetGenericPassword({ service: REFRESH_KEY });
    },

    // In-memory Socket ID
    setSocketId(id: string | null) {
        currentSocketId = id;
    },
    getSocketId() {
        return currentSocketId;
    }
};


export interface SavedLocation {
    id: string;
    name: string;
    showname?: string;
    address: string;
    lat: number;
    lng: number;
    icon?: string;
}


export const saveToRecents = async (location: SavedLocation) => {
    try {
        const existingRecents = await AsyncStorage.getItem(RECENT_LOCATIONS_KEY);
        let recents = existingRecents ? JSON.parse(existingRecents) : [];

        // Remove if it already exists (to move it to the top)
        recents = recents.filter((item: SavedLocation) => item.address !== location.address);

        // Add to the beginning of the array
        recents.unshift(location);

        // Keep only the 5 most recent
        const limitedRecents = recents.slice(0, 5);

        await AsyncStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(limitedRecents));
    } catch (e) {
        Alert.alert('Something Went Wrong!!!', 'Try Again Later');
        // console.error("Error saving recents", e);
    }
};
