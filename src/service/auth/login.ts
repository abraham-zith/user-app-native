import { storage } from '../utils/storage';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import { getDeviceId } from '../utils/device';
import { useState } from 'react';
import { Alert } from 'react-native';
import { showConfirmDialog } from '../utils/showConfirmDialog';
import { OTPScreen_Nav } from '../../Navigations/navigations';
import { useRequestOtpMutation } from '../authApi';

export const useLogin = (navigation: any) => {
    const dispatch = useDispatch();
    const [requestOtp] = useRequestOtpMutation();
    const [loading, setLoading] = useState(false);

    // ─── Save tokens and user to storage + redux ───────────────────────────
    // Called after successful OTP verification from useVerifyOtp hook
    const LoginUser = async (
        accessToken: string,
        refreshToken: string,
        userData: any
    ) => {
        try {
            await storage.setAccessToken(accessToken);
            await storage.setRefreshToken(refreshToken);
            dispatch(setUser(userData));
        } catch (error) {
            Alert.alert('Login Failed!!!', 'Try Again Later');
            // console.error('LoginUser Error:', error);
        }
    };

    // ─── Request OTP ───────────────────────────────────────────────────────
    const handleRequestOtp = async (
        phone_number: string,
        allow_new_device = false,  // ✅ flag for retry
        isRetry = false            // ✅ prevent double setLoading
    ) => {
        if (!isRetry) setLoading(true);
        try {
            const device_id = await getDeviceId();

            const response = await requestOtp({
                phone_number,
                role: 'customer',          // ✅ consistent role
                device_id,
                allow_new_device,
            }).unwrap();


            // ✅ Flat params — no double nesting
            navigation.navigate(OTPScreen_Nav, {
                OTPdata: response.data,
                userData: { phone_number }, // ✅ only phone_number needed here
                device_id,
            });

            // ✅ Save phone to redux for OTPScreen header display
            dispatch(setUser({ phone_number }));

        } catch (error: any) {
            const err = error?.data?.data || error?.data?.error || error;


            if (err?.code === 'DEVICE_CONFLICT') {
                const confirmed = await showConfirmDialog(
                    'Account is active on another device. Log out from that device?'
                );


                if (confirmed) {
                    // ✅ Retry with allow_new_device: true, skip setLoading
                    await handleRequestOtp(phone_number, true, true);
                }
                return;
            }

            if (err?.code === 'TOO_MANY_ATTEMPTS') {
                Alert.alert('Blocked', 'Too many attempts. Please try again later.');
                return;
            }

            Alert.alert('Error', err?.message || 'Failed to send OTP');
        } finally {
            if (!isRetry) setLoading(false); // ✅ only stop loading on initial call
        }
    };

    return { LoginUser, handleRequestOtp, loading };
};