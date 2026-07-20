import React, { useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Text } from '../../../Components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Socket
import { useSocket } from '../../../Socket/SocketContext';

// API
import { useUpdateTripMutation } from '../../../service/userApi';

// Types & Enums
import { PaymentStatus, TripStatus } from '../../../enums/trip.enum';

// Utils
import { hS, vS, mS } from '../../../lib/responsive';
import colors from '../../../constant/colors';
import { CheckoutScreen_Nav, RideCompletedScreen_Nav } from '../../../Navigations/navigations';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface RatingViewProps {
    tripData: any;
    fare: number;
    navigation: any;
    isRated?: boolean;
    driver?: any;
}

const RatingView: React.FC<RatingViewProps> = ({
    tripData,
    fare,
    navigation,
    isRated = false,
    driver,
}) => {
    const { colors: appColors, isDark } = useAppTheme();
    // ==================== SOCKET SETUP ====================
    const { socket } = useSocket();

    // ==================== API ====================
    const [updateTrip] = useUpdateTripMutation();
    // ==================== STATE ====================
    const [rating, setRating] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==================== HANDLERS ====================

    /**
     * Handle rating submission
     */
    const handleSubmitRating = useCallback(async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please provide a rating');
            return;
        }

        try {
            setIsSubmitting(true);

            // Update trip with rating and feedback
            const payload = {
                trip_id: tripData.trip_id,
                driver_rating: rating,
                driver_feedback: feedback,
                // trip_status: TripStatus.COMPLETED,
            };
            console.log(payload, 'ratingpayload')
            await updateTrip(payload).unwrap();

            // Emit rating event to socket
            socket.emit('driverRating', {
                tripId: tripData.trip_id,
                driverId: tripData.driver_id,
                driver_rating: rating,
                driver_feedback: feedback,
                timestamp: Date.now(),
            });

            Alert.alert(
                'Thank you!',
                'Your rating has been recorded.',
                [
                    {
                        text: 'Done',
                        onPress: () => {
                            if (tripData.payment_status === PaymentStatus.PAID) {
                                navigation.navigate(RideCompletedScreen_Nav, { ...tripData, isRated: true })
                            } else {
                                navigation.navigate(CheckoutScreen_Nav, tripData)
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('❌ Error submitting rating:', error);
            Alert.alert('Error', 'Failed to submit rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [rating, feedback, tripData, socket, updateTrip, navigation]);

    /**
     * Skip rating and go back
     */
    const handleSkipRating = useCallback(() => {
        Alert.alert(
            'Skip Rating?',
            'Would you like to skip the rating?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        if (tripData.payment_status === PaymentStatus.PAID) {
                            navigation.navigate(RideCompletedScreen_Nav, { ...tripData, isRated: false })
                        } else {
                            navigation.navigate(CheckoutScreen_Nav, tripData)
                        }
                    },
                },
            ]
        );
    }, [navigation, tripData]);

    // ==================== RENDER ====================

    return (
        <ScrollView style={[styles.container, { backgroundColor: appColors.background }]} showsVerticalScrollIndicator={false}>
            {/* HERO HEADER */}
            <View style={styles.headerSection}>
                <View style={[styles.iconGlow, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5' }]}>
                    <View style={[styles.iconCircle, { backgroundColor: '#10B981' }]}>
                        <MaterialCommunityIcons name="check" size={mS(40)} color="#FFFFFF" />
                    </View>
                </View>
                <Text style={[styles.title, { color: appColors.text }]}>Trip Complete!</Text>
                <Text style={[styles.subtitle, { color: appColors.secondaryText }]}>
                    Thank you for riding with us. How was your experience?
                </Text>
            </View>

            {/* DRIVER INFO CARD */}
            {driver && (
                <View style={[styles.driverCard, { backgroundColor: isDark ? appColors.iconBox : appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', borderWidth: 1 }]}>
                    <View style={styles.avatarContainer}>
                        {driver?.driverProfilePic ? (
                            <FastImage source={{ uri: driver.driverProfilePic }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.placeholderAvatar}>
                                <MaterialCommunityIcons name="account" size={mS(24)} color="#9CA3AF" />
                            </View>
                        )}
                    </View>
                    <View style={styles.driverInfo}>
                        <Text style={[styles.driverName, { color: appColors.text }]}>{driver?.driverName || tripData?.driver_name || 'Driver'}</Text>
                        <Text style={styles.vehicleInfo}>
                            {driver?.vehicleModel || tripData?.vehicle_model || 'Vehicle'} • {driver?.vehicleNumber || tripData?.vehicle_number || ''}
                        </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                        <MaterialCommunityIcons name="star" size={mS(14)} color="#F59E0B" />
                        <Text style={styles.ratingText}>{driver?.rating || '5.0'}</Text>
                    </View>
                </View>
            )}

            {/* RATING SECTION */}
            <View style={styles.ratingSection}>
                {/* STAR RATING */}
                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            style={styles.starBtn}
                        >
                            <MaterialCommunityIcons
                                name={star <= rating ? 'star' : 'star-outline'}
                                size={mS(40)}
                                color={
                                    star <= rating ? '#F59E0B' : isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'
                                }
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* RATING DISPLAY */}
                {rating > 0 && (
                    <Text style={[styles.ratingDisplay, { color: appColors.primary }]}>
                        {rating === 1 && "We're sorry to hear that!"}
                        {rating === 2 && 'There is room for improvement'}
                        {rating === 3 && 'Thanks for your feedback'}
                        {rating === 4 && 'Great experience!'}
                        {rating === 5 && 'Excellent! Thank you!'}
                    </Text>
                )}
            </View>

            {/* FEEDBACK SECTION */}
            {rating > 0 && (
                <View style={[styles.feedbackSection, { backgroundColor: isDark ? appColors.iconBox : appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', borderWidth: 1 }]}>
                    <Text style={[styles.feedbackLabel, { color: appColors.text }]}>Additional Feedback</Text>
                    <Text style={[styles.feedbackNote, { color: appColors.secondaryText }]}>
                        Tell us what can we improve (optional)
                    </Text>

                    <View style={styles.feedbackOptions}>
                        {['Clean', 'Professional', 'Friendly', 'Safe', 'Punctual', 'Good driving'].map(
                            (option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.feedbackChip,
                                        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB' },
                                        feedback === option && [styles.feedbackChipActive, { backgroundColor: appColors.primary, borderColor: appColors.primary }],
                                    ]}
                                    onPress={() =>
                                        setFeedback(
                                            feedback === option
                                                ? ''
                                                : option
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.feedbackChipText,
                                            { color: appColors.secondaryText },
                                            feedback === option &&
                                            styles.feedbackChipTextActive,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                </View>
            )}

            {/* TRIP DETAILS CARD */}
            <View style={[styles.detailCard, { backgroundColor: isDark ? appColors.iconBox : appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', borderWidth: 1 }]}>
                <View style={styles.addressRow}>
                    <View style={styles.timelineColumn}>
                        <MaterialCommunityIcons name="circle-slice-8" size={mS(12)} color="#3B82F6" />
                        <View style={styles.timelineLine} />
                        <MaterialCommunityIcons name="map-marker" size={mS(14)} color="#EF4444" />
                    </View>
                    <View style={styles.addressContent}>
                        <View style={styles.addressItem}>
                            <Text style={styles.addressLabel}>Pickup Location</Text>
                            <Text style={[styles.addressText, { color: appColors.text }]} numberOfLines={2}>
                                {tripData?.pickup_address || 'Pickup'}
                            </Text>
                        </View>
                        <View style={styles.addressItem}>
                            <Text style={styles.addressLabel}>Drop-off Location</Text>
                            <Text style={[styles.addressText, { color: appColors.text }]} numberOfLines={2}>
                                {tripData?.drop_address || 'Destination'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.statsRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6' }]}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="map-marker-distance" size={mS(16)} color={appColors.secondaryText} />
                        <Text style={[styles.statText, { color: appColors.text }]}>{tripData?.distance ? `${(tripData.distance / 1000).toFixed(1)} km` : '-'} distance</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="clock-outline" size={mS(16)} color={appColors.secondaryText} />
                        <Text style={[styles.statText, { color: appColors.text }]}>{tripData?.trip_duration_minutes ? `${tripData.trip_duration_minutes} mins` : '-'}</Text>
                    </View>
                </View>
            </View>

            {/* FARE SUMMARY CARD */}
            <View style={[styles.summaryCard, { backgroundColor: isDark ? appColors.iconBox : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB', borderWidth: 1, shadowColor: isDark ? '#000' : '#E5E7EB' }]}>
                <Text style={styles.fareLabel}>FINAL FARE</Text>
                <View style={styles.summaryRow}>
                    <Text style={[styles.amount, { color: appColors.text }]}>₹{fare || '0'}</Text>
                    <View style={[styles.paymentBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
                        <MaterialCommunityIcons name="check-decagram" size={mS(14)} color="#10B981" style={{ marginRight: hS(4) }} />
                        <Text style={[styles.paymentText, { color: '#10B981' }]}>Paid</Text>
                    </View>
                </View>

                {tripData?.discount > 0 && (
                    <View style={[styles.couponRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F3F4F6' }]}>
                        <View style={styles.couponInfo}>
                            <MaterialCommunityIcons name="ticket-percent" size={mS(18)} color="#10B981" />
                            <Text style={styles.couponMessage}>Discount Applied</Text>
                        </View>
                        <Text style={styles.discountAmount}>- ₹{tripData.discount}</Text>
                    </View>
                )}
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        { backgroundColor: appColors.primary, opacity: rating === 0 ? 0.5 : 1 },
                    ]}
                    onPress={handleSubmitRating}
                    disabled={rating === 0 || isSubmitting}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitBtnText}>
                        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </Text>
                    {!isSubmitting && <MaterialCommunityIcons name="arrow-right" size={mS(20)} color="#FFF" />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.skipBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB' }]}
                    onPress={handleSkipRating}
                    disabled={isSubmitting}
                >
                    <Text style={[styles.skipBtnText, { color: appColors.secondaryText }]}>Skip for now</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: vS(20) }} />
        </ScrollView>
    );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: hS(20),
        paddingTop: vS(20),
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: vS(24),
    },
    iconGlow: {
        width: mS(88),
        height: mS(88),
        borderRadius: mS(44),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(16),
    },
    iconCircle: {
        width: mS(64),
        height: mS(64),
        borderRadius: mS(32),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: mS(24),
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: vS(8),
    },
    subtitle: {
        fontSize: mS(14),
        textAlign: 'center',
        paddingHorizontal: hS(10),
        lineHeight: vS(22),
    },
    driverCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: mS(16),
        padding: mS(16),
        marginBottom: vS(20),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    avatarContainer: {
        width: mS(48),
        height: mS(48),
        borderRadius: mS(24),
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    placeholderAvatar: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    driverInfo: {
        flex: 1,
        marginLeft: hS(12),
    },
    driverName: {
        fontSize: mS(16),
        fontWeight: '800',
        marginBottom: vS(2),
    },
    vehicleInfo: {
        fontSize: mS(12),
        color: '#6B7280',
        fontWeight: '500',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: mS(12),
        gap: hS(4),
    },
    ratingText: {
        fontSize: mS(12),
        fontWeight: '800',
        color: '#D97706',
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: vS(20),
        marginTop: vS(8),
    },
    starContainer: {
        flexDirection: 'row',
        gap: hS(8),
        justifyContent: 'center',
        marginBottom: vS(16),
    },
    starBtn: {
        padding: hS(8),
    },
    ratingDisplay: {
        fontSize: mS(15),
        fontWeight: '700',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    feedbackSection: {
        padding: hS(16),
        borderRadius: mS(16),
        marginBottom: vS(24),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    feedbackLabel: {
        fontSize: mS(15),
        fontWeight: '700',
        marginBottom: vS(4),
    },
    feedbackNote: {
        fontSize: mS(13),
        marginBottom: vS(16),
    },
    feedbackOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: hS(8),
    },
    feedbackChip: {
        paddingHorizontal: hS(14),
        paddingVertical: vS(8),
        borderRadius: mS(20),
        borderWidth: 1,
    },
    feedbackChipActive: {
        borderWidth: 1,
    },
    feedbackChipText: {
        fontSize: mS(13),
        fontWeight: '600',
    },
    feedbackChipTextActive: {
        color: '#FFFFFF',
    },
    detailCard: {
        borderRadius: mS(16),
        padding: mS(16),
        marginBottom: vS(20),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    addressRow: {
        flexDirection: 'row',
    },
    timelineColumn: {
        alignItems: 'center',
        marginRight: hS(12),
        paddingVertical: vS(4),
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: vS(4),
        borderStyle: 'dashed',
    },
    addressContent: {
        flex: 1,
    },
    addressItem: {
        marginBottom: vS(16),
    },
    addressLabel: {
        fontSize: mS(12),
        color: '#9CA3AF',
        fontWeight: '600',
        marginBottom: vS(4),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    addressText: {
        fontSize: mS(14),
        fontWeight: '700',
        lineHeight: vS(20),
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: vS(12),
        marginTop: vS(4),
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        gap: hS(6),
    },
    statDivider: {
        width: 1,
        height: mS(16),
        backgroundColor: '#E5E7EB',
    },
    statText: {
        fontSize: mS(13),
        fontWeight: '600',
    },
    summaryCard: {
        padding: mS(20),
        borderRadius: mS(20),
        marginBottom: vS(32),
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    fareLabel: {
        fontSize: mS(12),
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: vS(8),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        fontSize: mS(36),
        fontWeight: '900',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(12),
        paddingVertical: vS(6),
        borderRadius: mS(10),
    },
    paymentText: {
        fontSize: mS(12),
        fontWeight: '800',
    },
    couponRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: vS(16),
        marginTop: vS(16),
        borderTopWidth: 1,
        borderStyle: 'dashed',
    },
    couponInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(8),
    },
    couponMessage: {
        fontSize: mS(14),
        fontWeight: '700',
        color: '#10B981',
    },
    discountAmount: {
        fontSize: mS(16),
        fontWeight: '800',
        color: '#10B981',
    },
    buttonSection: {
        gap: vS(12),
    },
    submitBtn: {
        height: vS(56),
        width: '100%',
        borderRadius: mS(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: hS(10),
        elevation: 6,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitBtnText: {
        fontSize: mS(18),
        fontWeight: '800',
        color: '#FFFFFF',
    },
    skipBtn: {
        width: '100%',
        paddingVertical: vS(14),
        borderRadius: mS(16),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    skipBtnText: {
        fontSize: mS(15),
        fontWeight: '700',
    },
});

export default RatingView;