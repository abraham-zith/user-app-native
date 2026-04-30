import { useEffect, useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useUpdateFcmTokenMutation } from '../service/userApi';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useGetAvailableCouponsQuery, useSubscribeToCouponTopicMutation, useUnsubscribeCouponMutation } from '../service/couponApi';

export const useNotifications = (isAuthenticated: boolean, userId: string) => {

    const [updateToken] = useUpdateFcmTokenMutation();
    const [fcmTokenStr, setFcmTokenStr] = useState<string | null>(null);
    const { data: availableCoupons } = useGetAvailableCouponsQuery(undefined, { skip: !userId });
    const [subscribeToCoupon] = useSubscribeToCouponTopicMutation();
    const [unsubscribeCoupon] = useUnsubscribeCouponMutation();

    const getDeviceToken = async () => {
        try {
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            }
            const token = await messaging().getToken();
            if (token && userId) {
                setFcmTokenStr(token);
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
            setFcmTokenStr(token);
            updateToken({ fcmToken: token, id: userId });
        });
    }, [isAuthenticated, userId]);

    // Auto-subscribe to all available coupons once token and coupons are ready
    useEffect(() => {
        const couponsArray = Array.isArray(availableCoupons) 
            ? availableCoupons 
            : (availableCoupons?.data || availableCoupons?.coupons || []);
            
        if (Array.isArray(couponsArray) && couponsArray.length && fcmTokenStr && userId) {
            couponsArray.forEach((coupon: any) => {
                if (coupon?.code) {
                    const isLimitReached = coupon.per_user_limit && coupon.user_usage_count >= coupon.per_user_limit;
                    if (isLimitReached) {
                        unsubscribeCoupon({ userId, couponCode: coupon.code, fcmToken: fcmTokenStr });
                    } else {
                        subscribeToCoupon({ userId, couponCode: coupon.code, fcmToken: fcmTokenStr });
                    }
                }
            });
        }
    }, [availableCoupons, fcmTokenStr, userId]);
};