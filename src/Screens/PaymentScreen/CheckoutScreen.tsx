import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Alert, ScrollView, Platform,
    ToastAndroid,
    StatusBar,
    Dimensions,
    SafeAreaView
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { RideCompletedScreen_Nav, PaymentSuccessScreen_Nav } from '../../Navigations/navigations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';

import colors from '../../constant/colors';
import { hS, mS, vS } from '../../lib/responsive';
import { useCreatePaymentOrderMutation, useVerifyPaymentMutation } from '../../service/userApi';
import { useSocket } from '../../Socket/SocketContext';
import { TripStatus } from '../../enums/trip.enum';
import { useEffect, useMemo } from 'react';
import { useApplyReferralDiscountMutation } from '../../service/referralApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CheckoutScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const trip = route?.params;
    const [isProcessing, setIsProcessing] = useState(false);
    const insets = useSafeAreaInsets()
    const { colors: appColors, isDark } = useAppTheme();
    const [createPaymentOrder] = useCreatePaymentOrderMutation();
    const [verifyPayment] = useVerifyPaymentMutation();
    const [applyDiscount] = useApplyReferralDiscountMutation();
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH'>('ONLINE');
    const [discountData, setDiscountData] = useState<any>(null);
    const { onTripStatusChanged, joinTripRoom } = useSocket();

    // ✅ Fetch Referral Discount on Mount
    useEffect(() => {
        const fetchDiscount = async () => {
            try {
                const res = await applyDiscount({
                    minRideAmount: 0,
                    tripId: trip?.trip_id
                }).unwrap();
                if (res.success && res.data?.applied) {
                    setDiscountData(res.data);
                }
            } catch (err) {
                // Ignore silent failure
            }
        };
        fetchDiscount();
    }, [trip?.trip_id]);

    // ✅ Sync Status: If driver marks as COMPLETED (manual cash pay) while on this screen
    useEffect(() => {
        if (!trip?.trip_id) return;
        // ... (existing logic)

        // Ensure we are in the room to receive updates
        joinTripRoom(trip.trip_id, trip.user_id || 'USER', 'USER');

        const unsub = onTripStatusChanged((data: any) => {
            const incomingTripId = data.trip_id || data.tripId || data.rideId;
            if (incomingTripId?.toString() !== trip.trip_id?.toString()) return;

            const newStatus = data.status || data.trip_status || data.trip?.trip_status;
            if (newStatus === TripStatus.COMPLETED) {
                Alert.alert(
                    "Ride Completed",
                    "The driver has marked this trip as completed. Proceeding to summary.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                navigation.navigate(PaymentSuccessScreen_Nav, {
                                    targetScreen: RideCompletedScreen_Nav,
                                    tripData: {
                                        ...trip,
                                        payment_status: 'PAID',
                                        isHandCash: true
                                    }
                                });
                            }
                        }
                    ],
                    { cancelable: false }
                );
            }
        });

        return () => unsub();
    }, [trip?.trip_id]);

    const calculatedPayable = useMemo(() => {
        const total = trip?.total_fare || 0;
        if (!discountData) return total;

        console.log(discountData, "discountData");
        const { discountType, discountValue } = discountData;

        if (discountType === 'PERCENTAGE') {
            const discountAmount = (total * discountValue) / 100;
            return Math.max(0, total - discountAmount);
        } else {
            // Assume fixed amount if not percentage
            return Math.max(0, total - (discountValue || 0));
        }
    }, [trip?.total_fare, discountData]);

    const discountAmount = useMemo(() => {
        // If the trip already has a discount from a coupon, use that
        if (trip?.discount > 0) return trip.discount;
        
        // Otherwise use the re-calculated referral discount
        return (trip?.total_fare || 0) - calculatedPayable;
    }, [trip?.discount, trip?.total_fare, calculatedPayable]);

    const product = {
        name: 'VDrive Premium',
        description: `${trip?.ride_type?.replace(/[-_]/g, ' ').toUpperCase()} Trip`,
        Bprice: trip?.base_fare || 0,
        allowances: trip?.driver_allowance || (trip?.total_fare || 0) - (trip?.base_fare || 0) + (trip?.discount || 0),
        Tprice: (Number(trip?.base_fare) || 0) + (Number(trip?.driver_allowance) || 0),
        payable: trip?.discount > 0 ? (trip?.total_fare || 0) : calculatedPayable,
        discount: discountAmount,
        pickupaddress: trip?.pickup_address,
        dropaddress: trip?.drop_address,
        currency: 'INR'
    };

    const handleConfirmPayment = async () => {
        if (paymentMethod === 'CASH') {
            Alert.alert(
                "Cash Payment",
                "Please pay directly to the driver. Once the driver confirms the payment, your trip will be finalized.",
                [{ text: "OK" }]
            );
            return;
        }
        await handlePayment(product.payable);
    };

    const handlePayment = async (price: number) => {
        // ... existing handlePayment logic (remains same)
        setIsProcessing(true);
        setPaymentStatus('processing');
        try {
            const orderData = await createPaymentOrder({ amount: price }).unwrap();
            const options = {
                description: 'Booking Payment',
                currency: orderData.currency,
                key: 'rzp_test_SCjewpaZ96XBWa',
                amount: orderData.amount,
                name: 'VDRIVE',
                order_id: orderData.order_id,
                prefill: {
                    email: 'user@example.com',
                    contact: '6789054321',
                    name: 'User Name'
                },
                "retry": { "enabled": false, "max_count": 3 },
                theme: { color: colors.button }
            };

            RazorpayCheckout.open(options).then(async (data: any) => {
                setPaymentStatus('idle');
                try {
                    const result = await verifyPayment({
                        razorpay_payment_id: data.razorpay_payment_id,
                        razorpay_order_id: data.razorpay_order_id,
                        razorpay_signature: data.razorpay_signature,
                    }).unwrap();

                    if (result.success) {
                        setIsProcessing(false);
                        navigation.navigate(PaymentSuccessScreen_Nav, { 
                            targetScreen: RideCompletedScreen_Nav,
                            tripData: { ...trip, payment_status: 'PAID' }
                        });
                        ToastAndroid.show('Payment Verified Successfully', ToastAndroid.SHORT)
                    } else {
                        setPaymentStatus('failed');
                        Alert.alert('Payment Verification Failed');
                        setIsProcessing(false);
                    }
                } catch (error) {
                    setPaymentStatus('failed');
                    setIsProcessing(false);
                }
            }).catch((error: any) => {
                setPaymentStatus('failed');
                Alert.alert(`Payment Failed!!! Please Try Again...`);
                setIsProcessing(false);
            });
        } catch (error: any) {
            setPaymentStatus('failed');
            setIsProcessing(false);
            Alert.alert(`Error: ${error.code} | ${error.description}`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={appColors.background} />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + vS(120) }]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(600)} style={styles.contentHeader}>
                    <Text style={[styles.title, { color: appColors.text }]}>Payment Summary</Text>
                    <Text style={[styles.subtitle, { color: appColors.secondaryText }]}>Please review the details below</Text>
                </Animated.View>

                {/* TRIP SUMMARY CARD */}
                <Animated.View entering={FadeInUp.delay(200).duration(600)} style={[styles.summaryCard, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9', borderWidth: isDark ? 1 : 0 }]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 64, 175, 0.1)' }]}>
                            <Text style={[styles.badgeText, { color: isDark ? '#60A5FA' : colors.button }]}>{product.description}</Text>
                        </View>
                        <MaterialCommunityIcons name="credit-card-outline" size={mS(24)} color={isDark ? '#60A5FA' : colors.button} />
                    </View>

                    {/* ROUTE INFO */}
                    <View style={styles.routeSection}>
                        <View style={styles.routeIndicator}>
                            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                            <View style={styles.line} />
                            <MaterialCommunityIcons name="map-marker" size={mS(18)} color="#EF4444" />
                        </View>
                        <View style={styles.routeDetails}>
                            <View style={styles.locationBox}>
                                <Text style={[styles.locationLabel, { color: isDark ? '#94A3B8' : '#94A3B8' }]}>PICKUP</Text>
                                <Text style={[styles.locationText, { color: appColors.text }]}>{product.pickupaddress}</Text>
                            </View>
                            <View style={[styles.locationBox, { marginTop: vS(20) }]}>
                                <Text style={[styles.locationLabel, { color: isDark ? '#94A3B8' : '#94A3B8' }]}>DROP-OFF</Text>
                                <Text style={[styles.locationText, { color: appColors.text }]}>{product.dropaddress}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]} />

                    {/* PAYMENT METHOD SELECTION */}
                    <View style={styles.methodSection}>
                        <Text style={[styles.sectionHeader, { color: appColors.secondaryText }]}>PAYMENT METHOD</Text>
                        <View style={styles.methodRow}>
                            <TouchableOpacity
                                style={[styles.methodButton, paymentMethod === 'ONLINE' && { borderColor: colors.button, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 64, 175, 0.05)' }]}
                                onPress={() => setPaymentMethod('ONLINE')}
                            >
                                <MaterialCommunityIcons name="credit-card" size={mS(20)} color={paymentMethod === 'ONLINE' ? colors.button : appColors.secondaryText} />
                                <Text style={[styles.methodText, { color: paymentMethod === 'ONLINE' ? colors.button : appColors.text }]}>Online</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.methodButton, paymentMethod === 'CASH' && { borderColor: '#10B981', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' }]}
                                onPress={() => setPaymentMethod('CASH')}
                            >
                                <MaterialCommunityIcons name="cash" size={mS(20)} color={paymentMethod === 'CASH' ? '#10B981' : appColors.secondaryText} />
                                <Text style={[styles.methodText, { color: paymentMethod === 'CASH' ? '#10B981' : appColors.text }]}>Cash</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]} />

                    {/* FARE BREAKDOWN */}
                    <View style={styles.fareSection}>
                        <View style={styles.fareRow}>
                            <Text style={[styles.fareLabel, { color: appColors.secondaryText }]}>Ride Fare</Text>
                            <Text style={[styles.fareValue, { color: appColors.text }]}>₹{Number(product.Bprice).toFixed(2)}</Text>
                        </View>
                        <View style={styles.fareRow}>
                            <Text style={[styles.fareLabel, { color: appColors.secondaryText }]}>Driver Allowance</Text>
                            <Text style={[styles.fareValue, { color: appColors.text }]}>₹{Number(product.allowances).toFixed(2)}</Text>
                        </View>
                        {product.discount > 0 && (
                            <View style={styles.fareRow}>
                                <Text style={[styles.fareLabel, { color: '#10B981', fontWeight: '700' }]}>
                                    {trip?.coupon_code ? `Coupon (${trip.coupon_code})` : 'Referral Discount'}
                                </Text>
                                <Text style={[styles.fareValue, { color: '#10B981' }]}>- ₹{Number(product.discount).toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={[styles.fareRow, styles.totalRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}>
                            <Text style={[styles.totalLabel, { color: appColors.text }]}>Total Payable</Text>
                            <Text style={[styles.totalValue, { color: isDark ? '#60A5FA' : colors.button }]}>₹{Number(product.payable).toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={[styles.securityBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}>
                        <MaterialCommunityIcons name="shield-lock" size={mS(16)} color={isDark ? '#34D399' : "#10B981"} />
                        <Text style={[styles.securityText, { color: isDark ? '#34D399' : '#10B981' }]}>Payment Securely Processed via Razorpay</Text>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* STICKY FOOTER */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, vS(20)), backgroundColor: appColors.card, borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}>
                <TouchableOpacity
                    onPress={handleConfirmPayment}
                    disabled={paymentStatus === 'processing'}
                    style={[
                        styles.payButton,
                        paymentMethod === 'CASH' && { backgroundColor: '#10B981', shadowColor: '#10B981' },
                        paymentStatus === 'processing' && { opacity: 0.8 },
                        paymentStatus === 'failed' && { backgroundColor: '#EF4444', shadowColor: '#EF4444' }
                    ]}
                >
                    <View style={styles.btnContent}>
                        <Text style={styles.payButtonText}>
                            {paymentStatus === 'processing' ? 'Processing...' :
                                paymentStatus === 'failed' ? 'Retry Payment' :
                                    paymentMethod === 'CASH' ? 'Confirm Payment (Cash)' : `Confirm & Pay ₹${Number(product.payable).toFixed(2)}`}
                        </Text>
                        {paymentStatus !== 'processing' && (
                            <MaterialCommunityIcons
                                name={paymentMethod === 'CASH' ? "hand-coin-outline" : "check-circle"}
                                size={mS(20)}
                                color="#FFF"
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: hS(20),
        paddingTop: vS(20),
    },
    contentHeader: {
        marginBottom: vS(24),
    },
    sectionHeader: {
        fontSize: mS(12),
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: vS(16),
        textTransform: 'uppercase'
    },
    title: {
        fontSize: mS(24),
        fontWeight: '800',
        color: '#0F172A',
    },
    subtitle: {
        fontSize: mS(14),
        color: '#64748B',
        marginTop: vS(4),
    },
    summaryCard: {
        backgroundColor: '#FFF',
        borderRadius: mS(24),
        padding: mS(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(24),
    },
    badge: {
        backgroundColor: 'rgba(30, 64, 175, 0.1)',
        paddingHorizontal: hS(12),
        paddingVertical: vS(6),
        borderRadius: mS(100),
    },
    badgeText: {
        fontSize: mS(12),
        fontWeight: '700',
        color: colors.button,
        letterSpacing: 0.5,
    },
    routeSection: {
        flexDirection: 'row',
        marginBottom: vS(24),
    },
    routeIndicator: {
        width: hS(24),
        alignItems: 'center',
        paddingVertical: vS(6),
    },
    dot: {
        width: mS(8),
        height: mS(8),
        borderRadius: mS(4),
    },
    line: {
        width: 1.5,
        flex: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: vS(4),
    },
    routeDetails: {
        flex: 1,
        marginLeft: hS(12),
    },
    locationBox: {
        gap: vS(4),
    },
    locationLabel: {
        fontSize: mS(10),
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
    },
    locationText: {
        fontSize: mS(14),
        fontWeight: '600',
        color: '#1E293B',
        lineHeight: mS(20),
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: vS(24),
    },
    methodSection: {
        marginBottom: vS(8),
    },
    methodRow: {
        flexDirection: 'row',
        gap: hS(12),
    },
    methodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vS(12),
        borderRadius: mS(12),
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        gap: hS(8),
    },
    methodText: {
        fontSize: mS(14),
        fontWeight: '700',
    },
    fareSection: {
        gap: vS(16),
    },
    fareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fareLabel: {
        fontSize: mS(15),
        color: '#64748B',
    },
    fareValue: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#334155',
    },
    totalRow: {
        marginTop: vS(8),
        paddingTop: vS(16),
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    totalLabel: {
        fontSize: mS(18),
        fontWeight: '800',
        color: '#1E293B',
    },
    totalValue: {
        fontSize: mS(24),
        fontWeight: '900',
        color: colors.button,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: vS(32),
        backgroundColor: '#F0FDF4',
        paddingVertical: vS(10),
        borderRadius: mS(12),
        gap: hS(8),
    },
    securityText: {
        fontSize: mS(11),
        color: '#10B981',
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: hS(20),
        paddingTop: vS(16),
        borderTopLeftRadius: mS(24),
        borderTopRightRadius: mS(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 15,
    },
    payButton: {
        backgroundColor: colors.button,
        height: vS(60),
        borderRadius: mS(18),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.button,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(12),
    },
    payButtonText: {
        color: '#FFF',
        fontSize: mS(18),
        fontWeight: '800',
    }
});

export default CheckoutScreen;