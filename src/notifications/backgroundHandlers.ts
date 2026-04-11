import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { storage } from '../service/utils/storage';
import { NotificationType } from './notificationTypes';

// ✅ Must be called in index.js — outside any component
export const registerBackgroundHandlers = () => {

    // ─── FCM Background/Quit Handler ────────────────────────────────────────
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        // ✅ Silently clear tokens for force logout
        // Redux not available here — only storage
        if (remoteMessage.data?.type === NotificationType.FORCE_LOGOUT) {
            await storage.removeAccessToken();
            await storage.removeRefreshToken();
        }
    });

    // ─── Notifee Background Event ────────────────────────────────────────────
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        const { notification, pressAction } = detail;

        if (
            type === EventType.ACTION_PRESS &&
            pressAction?.id === 'copy_code'
        ) {
            const promoCode = notification?.data?.promoCode;
            if (promoCode) {
                Clipboard.setString(String(promoCode));
            }
            if (notification?.id) {
                await notifee.cancelNotification(notification.id);
            }
        }
    });
};