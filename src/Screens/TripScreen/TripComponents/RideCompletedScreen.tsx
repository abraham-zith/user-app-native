import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    ToastAndroid,
    Alert,
    StatusBar,
    Dimensions
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
    FadeInDown,
    FadeInUp,
    Layout,
    ZoomIn,
} from 'react-native-reanimated';
import { TabNavigation_Nav } from '../../../Navigations/navigations';
import { useRoute } from '@react-navigation/native';
import generateInvoicePDF from '../../Invoice/GenerateInvoice';
import colors from '../../../constant/colors';
import { hS, vS, mS } from '../../../lib/responsive';
import { useUpdateTripMutation } from '../../../service/userApi';
import { TripStatus } from '../../../enums/trip.enum';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { RootState } from '../../../redux/store';
import { BackHandler } from 'react-native';
import { safeReset } from '../../../Navigations/navigationRef';

const { width } = Dimensions.get('window');

const RideCompletedScreen = ({ navigation }: any) => {
    const route = useRoute<any>();
    const trip = route?.params;
    const insets = useSafeAreaInsets();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [updateTrip] = useUpdateTripMutation();
    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const { colors: appColors, isDark } = useAppTheme();
    const [isRated, setIsRated] = useState(trip?.isRated || false);
    const Ridedata = {
        name: 'T2Drive',
        description: `Payment for ${trip?.ride_type?.replace(/[-_]/g, ' ').toUpperCase()} Trip`,
        Bprice: trip?.base_fare || 0,
        allowances: trip?.driver_allowance || 0,
        Tprice: trip?.total_fare || 0,
        coupon_code: trip?.coupon_code,
        discount: trip?.discount || 0,
        pickupaddress: trip?.pickup_address,
        dropaddress: trip?.drop_address,
        currency: 'INR',
        tripstatus: trip?.trip_status
    };

    const handleInvoiceAction = useCallback((action: 'email' | 'display') => {
        generateInvoicePDF(
            navigation,
            action,
            setIsLoading,
            trip,
            localuser
        );
    }, [navigation, trip, localuser]);

    const handleUpdateRating = async (selectedRating: number) => {
        if (selectedRating === 0) {
            Alert.alert('Rating Required', 'Please provide a star rating to help us improve.');
            return;
        }
        if (feedback === '') {
            Alert.alert('Feedback Required', 'Please provide a feedback to help us improve.');
            return;
        }

        const allowedFields = [
            'trip_id',
            'ride_type',
            'pickup_address',
            'drop_address',
            'scheduled_start_time',
            'trip_status',
            'rating',
            'feedback',
        ];

        const payload = {
            trip_id: trip.trip_id,
            trip_status: TripStatus.COMPLETED,
            rating: selectedRating,
            feedback: feedback
        };

        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([key, value]) =>
                allowedFields.includes(key) && value != null
            )
        );

        try {
            const result = await updateTrip(cleanPayload).unwrap();
            if (result.success) {
                ToastAndroid.show('Thank you for your feedback!', ToastAndroid.SHORT);
                // navigation.reset({
                //     index: 0,
                //     routes: [{ name: TabNavigation_Nav }],
                // });
                safeReset(TabNavigation_Nav);
                setIsRated(true);
            }
        } catch (error) {
            Alert.alert('Something went wrong, please try again later.');
        }
    };

    // ✅ Navigation Lock: Force users to stay on this screen until rated
    useEffect(() => {
        const handleBackAction = () => {
            if (!isRated) {
                // navigation.navigate(TabNavigation_Nav);
                Alert.alert("Rating Required", "Please provide a rating before returning to home screen.");
                return true; // Block back action
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackAction
        );

        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (isRated || e.data.action.type === 'RESET') {
                return;
            }
            e.preventDefault();
            handleBackAction();
        });

        return () => {
            backHandler.remove();
            unsubscribe();
        };
    }, [isRated, navigation]);

    useEffect(() => {
        if (trip?.payment_status === 'PAID' && localuser?.settings_preferences?.invoice_email === true) {
            handleInvoiceAction('email');
        }
    }, []);

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: appColors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "light-content"} backgroundColor={isDark ? appColors.background : colors.button} />

            {/* Celebratory Hero Header */}
            <Animated.View
                entering={FadeInUp.duration(600)}
                style={[styles.heroHeader, { paddingTop: insets.top + vS(20), backgroundColor: isDark ? appColors.background : colors.button, borderBottomLeftRadius: isDark ? 0 : mS(40), borderBottomRightRadius: isDark ? 0 : mS(40) }]}
            >
                <Animated.View entering={ZoomIn.delay(300).duration(500)} style={styles.successBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={mS(60)} color="#FFFFFF" />
                </Animated.View>
                <Text style={styles.heroTitle}>Trip Completed!</Text>
                <Text style={styles.heroSubtitle}>You've arrived safely at your destination.</Text>
            </Animated.View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Trip Route Visualization */}
                <Animated.View
                    entering={FadeInDown.delay(400).duration(600)}
                    style={[styles.routeCard, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}
                >
                    <View style={styles.routeRow}>
                        <View style={styles.routeDotContainer}>
                            <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
                            <View style={[styles.routeLine, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]} />
                            <MaterialCommunityIcons name="map-marker" size={mS(20)} color="#EF4444" />
                        </View>
                        <View style={styles.routeTextContainer}>
                            <View style={styles.locationInfo}>
                                <Text style={[styles.locationLabel, { color: isDark ? '#94A3B8' : '#94A3B8' }]}>PICKUP</Text>
                                <Text style={[styles.locationValue, { color: appColors.text }]} numberOfLines={1}>{Ridedata.pickupaddress}</Text>
                            </View>
                            <View style={styles.locationInfo}>
                                <Text style={[styles.locationLabel, { color: isDark ? '#94A3B8' : '#94A3B8' }]}>DROP-OFF</Text>
                                <Text style={[styles.locationValue, { color: appColors.text }]} numberOfLines={1}>{Ridedata.dropaddress}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Modern Payment Card */}
                <Animated.View
                    entering={FadeInDown.delay(500).duration(600)}
                    style={[styles.paymentCard, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9', borderWidth: isDark ? 1 : 0 }]}
                >
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: appColors.text }]}>Payment Summary</Text>
                        <View style={[styles.paidBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
                            <Text style={[styles.paidText, { color: isDark ? '#10B981' : '#059669' }]}>PAID</Text>
                        </View>
                    </View>

                    <View style={styles.fareRow}>
                        <Text style={[styles.fareLabel, { color: appColors.secondaryText }]}>Ride Fare</Text>
                        <Text style={[styles.fareValue, { color: appColors.text }]}>₹{Ridedata.Bprice}</Text>
                    </View>
                    <View style={styles.fareRow}>
                        <Text style={[styles.fareLabel, { color: appColors.secondaryText }]}>Driver Allowance</Text>
                        <Text style={[styles.fareValue, { color: appColors.text }]}>₹{Ridedata.allowances}</Text>
                    </View>
                    <View style={styles.fareRow}>
                        <Text style={[styles.fareLabel, { color: appColors.secondaryText }]}>Taxes & Fees</Text>
                        <Text style={[styles.fareValue, { color: appColors.text }]}>₹0.00</Text>
                    </View>
                    {Ridedata.discount > 0 && (
                        <View style={styles.fareRow}>
                            <Text style={[styles.fareLabel, { color: '#10B981', fontWeight: '700' }]}>
                                Coupon ({Ridedata.coupon_code})
                            </Text>
                            <Text style={[styles.fareValue, { color: '#10B981' }]}>- ₹{Ridedata.discount}</Text>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]} />

                    <View style={styles.totalPayRow}>
                        <Text style={[styles.totalPayLabel, { color: appColors.text }]}>Total Amount</Text>
                        <Text style={[styles.totalPayValue, { color: isDark ? '#60A5FA' : colors.button }]}>₹{Ridedata.Tprice}</Text>
                    </View>

                    <View style={styles.paymentFooter}>
                        <MaterialCommunityIcons name="shield-check" size={mS(14)} color="#10B981" />
                        <Text style={styles.paymentFooterText}>Securely processed via Razorpay</Text>
                    </View>
                </Animated.View>

                {/* Premium Rating Section (Conditioned) */}
                {!isRated && (
                    <Animated.View
                        entering={FadeInDown.delay(600).duration(600)}
                        style={[styles.ratingBox, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9', borderWidth: isDark ? 1 : 0 }]}
                    >
                        <Text style={[styles.ratingTitle, { color: appColors.text }]}>How was your trip?</Text>
                        <Text style={[styles.ratingSubtitle, { color: appColors.secondaryText }]}>Your feedback helps us improve your experience.</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    activeOpacity={0.6}
                                    style={styles.starTouch}
                                >
                                    <Animated.View layout={Layout.springify()}>
                                        <MaterialCommunityIcons
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={mS(44)}
                                            color={star <= rating ? "#F59E0B" : (isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0")}
                                        />
                                    </Animated.View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Quick Feedback Chips */}
                        {rating > 0 && (
                            <Animated.View entering={FadeInDown.duration(400)} style={styles.feedbackContainer}>
                                <Text style={[styles.feedbackLabel, { color: appColors.secondaryText }]}>What was good?</Text>
                                <View style={styles.chipsRow}>
                                    {['Clean', 'Professional', 'Friendly', 'Safe'].map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.feedbackChip,
                                                {
                                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'
                                                },
                                                feedback === option && {
                                                    backgroundColor: colors.button,
                                                    borderColor: colors.button
                                                }
                                            ]}
                                            onPress={() => setFeedback(feedback === option ? '' : option)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                { color: appColors.secondaryText },
                                                feedback === option && { color: '#FFFFFF' }
                                            ]}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </Animated.View>
                        )}
                    </Animated.View>
                )}

                {/* Action Buttons */}
                <Animated.View
                    entering={FadeInDown.delay(700).duration(600)}
                    style={styles.actionContainer}
                >
                    <TouchableOpacity
                        style={styles.primaryButton}
                        activeOpacity={0.8}
                        onPress={() => isRated ? navigation.reset({ index: 0, routes: [{ name: TabNavigation_Nav }] }) : handleUpdateRating(rating)}
                    >
                        <Text style={styles.primaryButtonText}>{isRated ? "Return Home" : "Done"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.button }]}
                        activeOpacity={0.6}
                        onPress={() => handleInvoiceAction('display')}
                    >
                        <MaterialCommunityIcons name="file-download-outline" size={mS(20)} color={isDark ? appColors.text : colors.button} />
                        <Text style={[styles.secondaryButtonText, { color: isDark ? appColors.text : colors.button }]}>Download Receipt</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Modal statusBarTranslucent navigationBarTranslucent transparent visible={isLoading} animationType="fade">
                    <View style={styles.loaderOverlay}>
                        <View style={styles.loaderCard}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                            <Text style={styles.loaderText}>Generating Invoice...</Text>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    heroHeader: {
        backgroundColor: colors.button,
        alignItems: 'center',
        paddingBottom: vS(30),
        borderBottomLeftRadius: mS(40),
        borderBottomRightRadius: mS(40),
        shadowColor: colors.button,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    successBadge: {
        marginBottom: vS(15),
    },
    heroTitle: {
        fontSize: mS(28),
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    heroSubtitle: {
        fontSize: mS(14),
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: vS(8),
        textAlign: 'center',
        paddingHorizontal: hS(40),
        lineHeight: vS(20),
    },
    scrollContent: {
        paddingTop: vS(15),
        paddingHorizontal: hS(20),
        paddingBottom: vS(40),
    },
    routeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(24),
        padding: mS(20),
        marginBottom: vS(20),
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    routeRow: {
        flexDirection: 'row',
    },
    routeDotContainer: {
        width: hS(30),
        alignItems: 'center',
        paddingTop: vS(4),
    },
    routeDot: {
        width: mS(10),
        height: mS(10),
        borderRadius: mS(5),
    },
    routeLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: vS(4),
    },
    routeTextContainer: {
        flex: 1,
        marginLeft: hS(10),
    },
    locationInfo: {
        marginBottom: vS(15),
    },
    locationLabel: {
        fontSize: mS(10),
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: vS(2),
    },
    locationValue: {
        fontSize: mS(14),
        fontWeight: '600',
        color: '#1E293B',
    },
    paymentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(24),
        padding: mS(24),
        marginBottom: vS(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(20),
    },
    cardTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        color: '#1E293B',
    },
    paidBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: hS(12),
        paddingVertical: vS(4),
        borderRadius: mS(8),
    },
    paidText: {
        fontSize: mS(12),
        fontWeight: '800',
        color: '#059669',
    },
    fareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: vS(12),
    },
    fareLabel: {
        fontSize: mS(14),
        color: '#64748B',
        fontWeight: '500',
    },
    fareValue: {
        fontSize: mS(14),
        color: '#334155',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: vS(15),
    },
    totalPayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(15),
    },
    totalPayLabel: {
        fontSize: mS(16),
        fontWeight: '800',
        color: '#1E293B',
    },
    totalPayValue: {
        fontSize: mS(22),
        fontWeight: '900',
        color: colors.button,
    },
    paymentFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: vS(5),
    },
    paymentFooterText: {
        fontSize: mS(12),
        color: '#10B981',
        fontWeight: '700',
        marginLeft: hS(6),
    },
    ratingBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(24),
        padding: mS(24),
        alignItems: 'center',
        marginBottom: vS(30),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    ratingTitle: {
        fontSize: mS(20),
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: vS(6),
    },
    ratingSubtitle: {
        fontSize: mS(13),
        color: '#64748B',
        textAlign: 'center',
        marginBottom: vS(20),
        lineHeight: vS(18),
    },
    starsRow: {
        flexDirection: 'row',
        gap: hS(8),
    },
    starTouch: {
        padding: mS(5),
    },
    feedbackContainer: {
        marginTop: vS(20),
        width: '100%',
        alignItems: 'center',
    },
    feedbackLabel: {
        fontSize: mS(14),
        fontWeight: '600',
        marginBottom: vS(12),
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: hS(10),
    },
    feedbackChip: {
        paddingHorizontal: hS(16),
        paddingVertical: vS(10),
        borderRadius: mS(20),
        borderWidth: 1,
    },
    chipText: {
        fontSize: mS(13),
        fontWeight: '600',
    },
    actionContainer: {
        gap: vS(12),
    },
    primaryButton: {
        backgroundColor: colors.button,
        height: vS(56),
        borderRadius: mS(18),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.button,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: mS(18),
        fontWeight: '800',
    },
    secondaryButton: {
        height: vS(56),
        borderRadius: mS(18),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.button,
        borderStyle: 'dashed',
    },
    secondaryButtonText: {
        color: colors.button,
        fontSize: mS(16),
        fontWeight: '700',
        marginLeft: hS(8),
    },
    loaderOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderCard: {
        backgroundColor: '#1E293B',
        padding: mS(30),
        borderRadius: mS(24),
        alignItems: 'center',
    },
    loaderText: {
        marginTop: vS(15),
        fontSize: mS(15),
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default RideCompletedScreen;