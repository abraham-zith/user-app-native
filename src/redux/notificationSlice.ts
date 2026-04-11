import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: number; // timestamp
    type: string;
    read: boolean;
    data?: any;
}

interface NotificationState {
    notifications: Notification[];
}

const initialState: NotificationState = {
    notifications: [],
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<any>) => {
            const remoteMessage = action.payload;
            const newNotification: Notification = {
                id: remoteMessage.messageId || Date.now().toString(),
                title: remoteMessage.notification?.title || 'No Title',
                message: remoteMessage.notification?.body || 'No Message',
                time: Date.now(),
                type: remoteMessage.data?.type || 'info',
                read: false,
                data: remoteMessage.data,
            };
            // Add to the beginning of the list
            state.notifications.unshift(newNotification);
            
            // Limit to last 50 notifications
            if (state.notifications.length > 50) {
                state.notifications = state.notifications.slice(0, 50);
            }
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => {
                n.read = true;
            });
        },
        clearAll: (state) => {
            state.notifications = [];
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
    },
});

export const { addNotification, markAsRead, markAllAsRead, clearAll, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
