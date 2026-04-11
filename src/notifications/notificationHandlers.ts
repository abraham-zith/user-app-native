import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import { logout } from '../redux/userSlice';
import { storage } from '../service/utils/storage';
import { navigationRef, safeReset } from '../Navigations/navigationRef';
import { Auth_Nav, BookedTripScreen_Nav, WelcomeScreen_Nav } from '../Navigations/navigations';
import { NotificationType } from './notificationTypes';
import { getChannelForType, createNotificationChannels } from './channels';
import { addNotification } from '../redux/notificationSlice';

const NotificationHandler: React.FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    // ─── Force Logout ──────────────────────────────────────────────────────
    const handleForceLogout = async () => {
        await storage.removeAccessToken();
        await storage.removeRefreshToken();
        dispatch(logout());

        await safeReset(Auth_Nav, WelcomeScreen_Nav);

        // if (navigationRef.current?.isReady()) {
        //     navigationRef.current.reset({
        //         index: 0,
        //         routes: [{ name: 'WelcomeScreen' }],
        //     });
        // }
    };

    // ─── Route Notification ────────────────────────────────────────────────
    const handleNotificationRoute = (data: any) => {
        if (!data) return;

        const { type, tripId, bookingId } = data;

        switch (type) {
            case NotificationType.TRIP_UPDATE:
            case NotificationType.BOOKING_CONFIRM:
            case NotificationType.DRIVER_ASSIGNED:
            case NotificationType.RIDE_STARTED:
            case NotificationType.RIDE_COMPLETED:
                if (tripId) {
                    navigation.navigate(BookedTripScreen_Nav, { trip_id: tripId });
                }
                break;

            default:
                break;
        }
    };

    // ─── Display Notifee Banner ────────────────────────────────────────────
    const displayBanner = async (remoteMessage: any) => {
        const type = remoteMessage.data?.type || '';
        const channelId = getChannelForType(type);

        await notifee.displayNotification({
            title: remoteMessage.notification?.title,
            body: remoteMessage.notification?.body,
            data: remoteMessage.data,
            android: {
                channelId,
                pressAction: { id: 'default' },
            },
        });
    };

    useEffect(() => {
        // ✅ Create channels on mount
        createNotificationChannels();

        // ─── Foreground FCM ────────────────────────────────────────────────
        const unsubscribeFcm = messaging().onMessage(async (remoteMessage) => {

            dispatch(addNotification(remoteMessage));

            if (remoteMessage.data?.type === NotificationType.FORCE_LOGOUT) {
                Alert.alert(
                    'Session Ended',
                    'Your account was accessed from another device.',
                    [{ text: 'OK', onPress: handleForceLogout }],
                    { cancelable: false }
                );
                return;
            }

            await displayBanner(remoteMessage);
        });

        // ─── Notifee Foreground Tap ────────────────────────────────────────
        const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
            const { notification, pressAction } = detail;

            if (type === EventType.PRESS) {
                handleNotificationRoute(notification?.data);
            }

            if (!notification?.id) return;

            if (
                type === EventType.ACTION_PRESS &&
                pressAction?.id === 'copy_code'
            ) {
                const promoCode = notification?.data?.promoCode;
                if (promoCode) {
                    Clipboard.setString(String(promoCode));
                    Alert.alert('Success', 'Promo code copied!');
                }
                notifee.cancelNotification(notification.id);
            }
        });

        // ─── Background Tap ────────────────────────────────────────────────
        messaging().onNotificationOpenedApp(async (remoteMessage) => {

            dispatch(addNotification(remoteMessage));

            if (remoteMessage.data?.type === NotificationType.FORCE_LOGOUT) {
                await handleForceLogout();
                return;
            }

            handleNotificationRoute(remoteMessage.data);
        });

        // ─── Quit State Tap ────────────────────────────────────────────────
        messaging().getInitialNotification().then(async (remoteMessage) => {
            if (!remoteMessage) return;

            dispatch(addNotification(remoteMessage));

            if (remoteMessage.data?.type === NotificationType.FORCE_LOGOUT) {
                await handleForceLogout();
                return;
            }

            handleNotificationRoute(remoteMessage.data);
        });

        return () => {
            unsubscribeFcm();
            unsubscribeNotifee();
        };
    }, []);

    return null;
};

export default NotificationHandler;