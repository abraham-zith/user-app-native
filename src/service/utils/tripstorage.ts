// lib/tripStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_TRIP_KEY = 'active_trip_id';

export const saveActiveTrip = async (tripId: string) => {
    await AsyncStorage.setItem(ACTIVE_TRIP_KEY, tripId);
};

export const clearActiveTrip = async () => {
    await AsyncStorage.removeItem(ACTIVE_TRIP_KEY);
};

export const getActiveTripId = async () => {
    return await AsyncStorage.getItem(ACTIVE_TRIP_KEY);
};