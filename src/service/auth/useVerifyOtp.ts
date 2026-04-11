
import { useState } from 'react';
import { Alert } from 'react-native';
import { useVerifyOtpMutation } from '../userApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import { showConfirmDialog } from '../utils/showConfirmDialog';
import { storage } from '../utils/storage';
import { SignUpScreen_Nav, TabNavigation_Nav } from '../../Navigations/navigations';
import { getFcmToken } from '../../notifications';
import { OnboardingStatus } from '../../enums/user.enum';

interface VerifyOtpParams {
    phone_number: string;
    otp: string;
    device_id: string;
    role?: string;
    fcm_token?: string;
    allow_new_device?: boolean;
    isRetry?: boolean;
}

export const useVerifyOtp = (navigation: any) => {
    const dispatch = useDispatch();
    const [verifyOtp] = useVerifyOtpMutation();
    const [loading, setLoading] = useState(false);

    const handleVerifyOtp = async ({
        phone_number,
        otp,
        device_id,
        role = 'customer',
        allow_new_device = false,
        isRetry = false,
    }: VerifyOtpParams) => {
        if (!isRetry) setLoading(true);
        try {
            const fcm_token = await getFcmToken()

            const response = await verifyOtp({
                phone_number,
                role,
                otp,
                device_id,
                allow_new_device,
                fcm_token,
            }).unwrap();

            const { verified, isNewUser, accessToken, refreshToken, userData } = response.data;

            if (!verified) {
                Alert.alert('Error', 'OTP verification failed');
                return;
            }

            // Save tokens and user
            await storage.setAccessToken(accessToken);
            await storage.setRefreshToken(refreshToken);
            dispatch(setUser(userData));

            // Navigate based on onboarding status
            const status = userData?.onboarding_status;

            if (status === OnboardingStatus.COMPLETED || status === OnboardingStatus.PROFILE_COMPLETED) {
                // PROFILE_COMPLETED + successful OTP verification = COMPLETED
                navigation.replace(TabNavigation_Nav);
            } else if (status === OnboardingStatus.PHONE_VERIFIED || status === OnboardingStatus.PENDING) {
                navigation.replace(SignUpScreen_Nav);
            } else {
                // Fallback for safety
                navigation.replace(isNewUser ? SignUpScreen_Nav : TabNavigation_Nav);
            }

        } catch (error: any) {
            const err = error?.data?.data || error?.data?.error || error;
            const fcm_token = await getFcmToken() || "";

            if (err?.code === 'DEVICE_CONFLICT') {
                const confirmed = await showConfirmDialog(
                    'You are logged in on another device. Log out from that device?'
                );

                if (confirmed) {
                    await handleVerifyOtp({
                        phone_number,
                        otp,
                        device_id,
                        role,
                        fcm_token,
                        allow_new_device: true,
                        isRetry: true,  // ✅ skip loading reset
                    });
                }
                return;
            }

            if (err?.code === 'OTP_EXPIRED') {
                Alert.alert('Expired', 'OTP has expired. Please request a new one.');
                return;
            }

            if (err?.code === 'INVALID_OTP') {
                Alert.alert('Invalid', 'Incorrect OTP. Please try again.');
                return;
            }

            Alert.alert('Error', err?.message || 'Verification failed');
        } finally {
            if (!isRetry) setLoading(false); // ✅ only stop on initial call
        }
    };

    return { handleVerifyOtp, loading };
};