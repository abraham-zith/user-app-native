import { getMessaging, getToken, requestPermission, onTokenRefresh, AuthorizationStatus } from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { store } from '../redux/store';

// ─── Request Permission ───────────────────────────────────────────────────────
export const requestNotificationPermission = async (): Promise<boolean> => {
    try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (result !== PermissionsAndroid.RESULTS.GRANTED) {

                return false;
            }
        }

        const messaging = getMessaging();
        const authStatus = await requestPermission(messaging);
        const enabled =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;


        return enabled;

    } catch (err) {
        Alert.alert('FCM Token Error!!!', 'Try Again Later');
        // console.error('[FCM] Permission request failed:', err);
        return false;
    }
};

// ─── Get FCM Token ────────────────────────────────────────────────────────────
export const getFcmToken = async (): Promise<string | null> => {
    try {
        const messaging = getMessaging();
        const token = await getToken(messaging);

        return token;
    } catch (err) {
        Alert.alert('FCM Token Error!!!', 'Try Again Later');
        // console.error('[FCM] Get token failed:', err);
        return null;
    }
};

// ─── Sync FCM Token with Backend ──────────────────────────────────────────────
export const syncFcmToken = async (
    userId: string,
    updateFcmToken: (payload: any) => Promise<any>
): Promise<void> => {
    try {
        const token = await getFcmToken();


        if (!token || !userId) return;

        await updateFcmToken({ fcmToken: token, id: userId });

    } catch (err) {
        Alert.alert('FCM Sync Error!!!', 'Try Again Later');
        // console.error('[FCM] Token sync failed:', err);
    }
};

// ─── Listen for Token Refresh ─────────────────────────────────────────────────
export const onFcmTokenRefresh = (
    userId: string,
    updateFcmToken: (payload: any) => Promise<any>
) => {
    const messaging = getMessaging();
    return onTokenRefresh(messaging, async (newToken) => {

        if (userId) {
            await updateFcmToken({ fcmToken: newToken, id: userId });
        }
    });
};