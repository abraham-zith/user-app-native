import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from "@react-navigation/native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { Car } from '../../assets/svg';
import { Styles } from '../../lib/styles';
import colors from '../../constant/colors';
import fonts from '../../constant/fonts';
import { RootState } from '../../redux/store';
import Button from '../../Components/Button';
import { OTPInput } from '../../Components';
import { useLogin } from '../../service/auth/login';
import { hS, vS, mS } from '../../lib/responsive';
import { useVerifyOtp } from '../../service/auth/useVerifyOtp';
import { useRequestOtpMutation } from '../../service/authApi'; // ✅ for resend
import { useAppTheme } from '../../hooks/useAppTheme';

const primaryColor = '#102747';
const accentColor = '#D4D4D4';
const textColor = '#333333';
const lightTextColor = '#666666';
const backgroundColor = colors.background || '#F5F5F5';

const OTPScreen: React.FC<any> = ({ navigation }) => {
    const { colors: appColors, isDark } = useAppTheme();
    const route = useRoute<any>();

    // ✅ Fix: correct destructuring from route.params
    const { OTPdata, userData, device_id } = route.params;

    const { LoginUser } = useLogin(navigation);
    const { handleVerifyOtp, loading, error } = useVerifyOtp(navigation);
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const user = useSelector((state: RootState) => state?.userSlice.user);

    const [otp, setOtp] = useState<string>('');
    const [resendTimer, setResendTimer] = useState<number>(59);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [lockoutTime, setLockoutTime] = useState<number>(0);

    // ✅ For resend OTP
    const [requestOtp, { isLoading: resending }] = useRequestOtpMutation();

    // Countdown timer
    useEffect(() => {
        if (resendTimer === 0) {
            setCanResend(true);
            return;
        }
        const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendTimer]);

    // Lockout timer logic
    useEffect(() => {
        if (error?.includes('locked for 5 minutes')) {
            setLockoutTime(300);
        }
    }, [error]);

    useEffect(() => {
        if (lockoutTime <= 0) return;
        const timer = setInterval(() => {
            setLockoutTime((t) => t - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ✅ Fix: actual resend API call
    const handleResendCode = async () => {
        if (!canResend) return;
        try {
            await requestOtp({
                phone_number: userData.phone_number,
                role: 'customer',
                device_id,
                allow_new_device: false,
            }).unwrap();

            setOtp('');
            setResendTimer(59);
            setCanResend(false);
        } catch (error: any) {
            Alert.alert('Error', error?.data?.message || 'Failed to resend OTP');
        }
    };

    const handleChangeMobileNumber = () => {
        if (OTPdata?.exists) {
            navigation.goBack();
        } else {
            navigation.navigate('SignUpScreen');
        }
    };

    // ✅ Fix: added handleVerifyOtp to dependency array
    // const handleOtpChange = useCallback(async (text: string) => {
    //     setOtp(text);
    //     console.log(text, 'text');

    //     if (text.length === 4) {
    //         await callHandleVerifyOtp(text);
    //     }
    // }, [handleVerifyOtp]);
    const handleOtpChange = useCallback(async (text: string) => {
        setOtp(text);

        if (text.length === 4) {
            // ✅ call handleVerifyOtp directly, no intermediate function
            await handleVerifyOtp({
                phone_number: userData.phone_number,
                otp: text,
                device_id,
                role: 'customer',
                allow_new_device: false,
                //             errorContainer: {
                //     flexDirection: "row",
                //     alignItems: "center",
                //     backgroundColor: "#FEF2F2",
                //     paddingHorizontal: hS(12),
                //     paddingVertical: vS(8),
                //     borderRadius: mS(10),
                //     marginTop: vS(16),
                //     gap: hS(8),
                //     width: "100%",
                // },
                // errorText: {
                //     fontSize: mS(12),
                //     color: "#EF4444",
                //     fontWeight: "600",
                //     flex: 1,
                // },
            });
        }
    }, [handleVerifyOtp, userData.phone_number, device_id]); // ✅ all deps included

    // ✅ Fix: pass role and allow_new_device
    // const callHandleVerifyOtp = async (otpValue: string) => {
    //     await handleVerifyOtp({
    //         phone_number: userData.phone_number,
    //         otp: otpValue,
    //         device_id,
    //         role: 'customer',           // ✅ required
    //         allow_new_device: false, // ✅ required, handled inside hook on DEVICE_CONFLICT
    //         errorContainer: {
    //         flexDirection: "row",
    //         alignItems: "center",
    //         backgroundColor: "#FEF2F2",
    //         paddingHorizontal: hS(12),
    //         paddingVertical: vS(8),
    //         borderRadius: mS(10),
    //         marginTop: vS(16),
    //         gap: hS(8),
    //         width: "100%",
    //     },
    //     errorText: {
    //         fontSize: mS(12),
    //         color: "#EF4444",
    //         fontWeight: "600",
    //         flex: 1,
    //     },
    // });
    // };

    return (
        <View style={[
            localStyles.container,
            {
                paddingTop: insets.top + vS(20),
                paddingBottom: insets.bottom + vS(20),
                backgroundColor: appColors.background
            }
        ]}>
            <View style={Styles.flex}>
                {/* PREMIUM HEADER SECTION */}
                <View style={localStyles.headerSection}>
                    <Text style={[localStyles.welcomeText, { color: appColors.primary }]}>Verification Code</Text>
                    <Text style={[localStyles.titleText, { color: appColors.text }]}>
                        {OTPdata?.exists ? "Welcome Back!" : "Almost There!"}
                    </Text>
                    <Text style={[localStyles.descriptionText, { color: appColors.lightTextColor }]}>
                        {OTPdata?.exists
                            ? `Enter the 4-digit code sent to`
                            : `Let's verify your account for`}{' '}
                        <Text style={[localStyles.phoneNumberText, { color: appColors.text }]}>
                            {userData?.phone_number || user?.phone_number}
                        </Text>
                    </Text>
                </View>

                {/* PREMIUM OTP INPUT CARD */}
                <View style={[localStyles.otpCard, { backgroundColor: appColors.card, borderColor: appColors.border, shadowColor: isDark ? '#000' : '#64748B' }]}>
                    {/* --- START TEMPORARY OTP DISPLAY (DETACHABLE) --- */}
                    {/* TODO: Remove this block once SMS integration is complete */}
                    {OTPdata?.otp && (
                        <View style={{ marginBottom: vS(15), padding: mS(10), backgroundColor: isDark ? 'rgba(2, 132, 199, 0.2)' : '#E0F2FE', borderRadius: mS(8), width: '100%' }}>
                            <Text style={{ fontSize: mS(14), color: isDark ? '#38BDF8' : '#0284C7', fontWeight: 'bold', textAlign: 'center' }}>
                                Temporary Dev OTP: {OTPdata.otp}
                            </Text>
                        </View>
                    )}
                    {/* --- END TEMPORARY OTP DISPLAY --- */}
                    <OTPInput
                        numberOfDigits={4}
                        onChangeText={handleOtpChange}
                        value={otp}
                        editable={lockoutTime === 0}
                    // placeholderCharacter="-"
                    // style={localStyles.premiumOtpInput}
                    />

                    {lockoutTime > 0 ? (
                        <View style={localStyles.errorContainer}>
                            <MaterialCommunityIcons name="clock-outline" size={mS(16)} color="#EF4444" />
                            <Text style={localStyles.errorText}>Locked! Try again in {formatTime(lockoutTime)}</Text>
                        </View>
                    ) : (error?.includes('locked for 5 minutes') && lockoutTime === 0) ? (
                        <View style={[localStyles.errorContainer, { backgroundColor: '#F0FDF4' }]}>
                            <MaterialCommunityIcons name="check-circle-outline" size={mS(16)} color="#10B981" />
                            <Text style={[localStyles.errorText, { color: '#10B981' }]}>You can try now</Text>
                        </View>
                    ) : error && (
                        <View style={localStyles.errorContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={mS(16)} color="#EF4444" />
                            <Text style={localStyles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={localStyles.resendContainer}>
                        <Text style={[localStyles.notReceivedText, { color: appColors.lightTextColor }]}>Didn't receive the code?</Text>
                        <TouchableOpacity
                            onPress={handleResendCode}
                            disabled={!canResend || resending}
                        >
                            <Text style={[
                                localStyles.resendLink,
                                { color: canResend ? appColors.button : (isDark ? '#475569' : '#94A3B8') }
                            ]}>
                                {resending
                                    ? 'Resending...'
                                    : canResend
                                        ? 'Resend Now'
                                        : `Resend in ${resendTimer}s`
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Loader */}
                {loading && (
                    <ActivityIndicator
                        size="large"
                        color={appColors.primary}
                        style={localStyles.loader}
                    />
                )}

                {/* PREMIUM ACTION BUTTONS */}
                <View style={localStyles.actionSection}>
                    <TouchableOpacity
                        onPress={handleChangeMobileNumber}
                        activeOpacity={0.8}
                        style={[
                            localStyles.premiumActionButton,
                            { backgroundColor: OTPdata?.exists ? appColors.card : appColors.button, shadowColor: isDark ? '#000' : '#000' }
                        ]}
                    >
                        <Text style={[
                            localStyles.actionButtonText,
                            { color: OTPdata?.exists ? appColors.text : '#FFFFFF' }
                        ]}>
                            {OTPdata?.exists
                                ? `Change Mobile Number`
                                : `Sign Up to Continue`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Background Decoration */}
            <Car
                width={hS(220)}
                height={vS(120)}
                style={localStyles.backgroundCar}
            />
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerSection: {
        marginTop: vS(40),
        marginBottom: vS(32),
        paddingHorizontal: hS(24),
    },
    welcomeText: {
        fontSize: mS(14),
        fontWeight: '700',
        color: colors.button,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: vS(10),
    },
    titleText: {
        fontSize: mS(32),
        fontWeight: '800',
        color: '#1E293B',
        lineHeight: mS(40),
        marginBottom: vS(12),
    },
    descriptionText: {
        fontSize: mS(15),
        color: '#64748B',
        lineHeight: vS(22),
        fontWeight: '500',
    },
    phoneNumberText: {
        fontWeight: '700',
        color: '#1E293B',
    },
    otpCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: hS(24),
        borderRadius: mS(24),
        paddingVertical: vS(32),
        paddingHorizontal: hS(20),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        alignItems: 'center',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vS(24),
    },
    notReceivedText: {
        fontSize: mS(14),
        color: '#64748B',
        fontWeight: '500',
        marginRight: hS(6),
    },
    resendLink: {
        fontSize: mS(14),
        fontWeight: '800',
        color: colors.button,
    },
    loader: {
        marginTop: vS(30),
    },
    actionSection: {
        marginTop: vS(40),
        paddingHorizontal: hS(24),
    },
    premiumActionButton: {
        height: vS(64),
        borderRadius: mS(20),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    actionButtonText: {
        fontSize: mS(17),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    backgroundCar: {
        position: 'absolute',
        bottom: vS(-40),
        right: hS(-60),
        opacity: 0.7,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        paddingHorizontal: hS(12),
        paddingVertical: vS(8),
        borderRadius: mS(10),
        marginTop: vS(16),
        gap: hS(8),
        width: "100%",
    },
    errorText: {
        fontSize: mS(12),
        color: "#EF4444",
        fontWeight: "600",
        flex: 1,
    },
});

export default OTPScreen;