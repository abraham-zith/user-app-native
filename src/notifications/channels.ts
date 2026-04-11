import notifee, { AndroidImportance } from '@notifee/react-native';

export const NotificationChannels = {
    TRIP_UPDATES: 'trip_updates',
    PAYMENTS: 'payments',
    GENERAL: 'general',
};

export const createNotificationChannels = async () => {
    await Promise.all([
        notifee.createChannel({
            id: NotificationChannels.TRIP_UPDATES,
            name: 'Trip Updates',
            importance: AndroidImportance.HIGH,
        }),
        notifee.createChannel({
            id: NotificationChannels.PAYMENTS,
            name: 'Payments',
            importance: AndroidImportance.HIGH,
        }),
        notifee.createChannel({
            id: NotificationChannels.GENERAL,
            name: 'General',
            importance: AndroidImportance.DEFAULT,
        }),
    ]);
};

// ✅ Get channel based on notification type
export const getChannelForType = (type: string): string => {
    const channelMap: Record<string, string> = {
        TRIP_UPDATE: NotificationChannels.TRIP_UPDATES,
        BOOKING_CONFIRMED: NotificationChannels.TRIP_UPDATES,
        BOOKING_CANCELLED: NotificationChannels.TRIP_UPDATES,
        DRIVER_ASSIGNED: NotificationChannels.TRIP_UPDATES,
        RIDE_STARTED: NotificationChannels.TRIP_UPDATES,
        RIDE_COMPLETED: NotificationChannels.TRIP_UPDATES,
        PAYMENT_SUCCESS: NotificationChannels.PAYMENTS,
        PAYMENT_FAILED: NotificationChannels.PAYMENTS,
    };
    return channelMap[type] || NotificationChannels.GENERAL;
};