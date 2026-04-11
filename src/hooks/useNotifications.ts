import { useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useUpdateFcmTokenMutation } from '../service/userApi';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';



export const useNotifications = (isAuthenticated: boolean, userId: string) => {

    const [updateToken] = useUpdateFcmTokenMutation();

    const getDeviceToken = async () => {
        try {
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            }
            const token = await messaging().getToken();
            if (token && userId) {
                await updateToken({ fcmToken: token, id: userId }).unwrap();
            }
        } catch (error) {
            Alert.alert('Network Error!!!', 'Try Again Later');
            // console.error('FCM Token Sync Error:', error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || !userId) return;
        getDeviceToken();

        return messaging().onTokenRefresh(token => {
            updateToken({ fcmToken: token, id: userId });
        });
    }, [isAuthenticated, userId]);
};