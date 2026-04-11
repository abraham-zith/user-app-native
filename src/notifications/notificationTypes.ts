export enum NotificationType {
    FORCE_LOGOUT = 'FORCE_LOGOUT',
    TRIP_UPDATE = 'TRIP_UPDATE',
    BOOKING_CONFIRM = 'BOOKING_CONFIRMED',
    BOOKING_CANCEL = 'BOOKING_CANCELLED',
    DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
    RIDE_STARTED = 'RIDE_STARTED',
    RIDE_COMPLETED = 'RIDE_COMPLETED',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    PROMO_CODE = 'PROMO_CODE',
}

export interface NotificationData {
    type: NotificationType | string;
    tripId?: string;
    bookingId?: string;
    promoCode?: string;
    [key: string]: any;
}