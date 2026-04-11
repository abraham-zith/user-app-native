import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export const requestNotificationPermission = async (): Promise<boolean> => {
    try {
        // ✅ Android 13+ requires explicit permission
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {

                return false;
            }
        }

        // ✅ iOS permission
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
        } else {
        }

        return enabled;
    } catch (err) {

        return false;
    }
};