import React, { useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';
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
}

const RatingView: React.FC<RatingViewProps> = ({
    tripData,
    fare,
    navigation,
    isRated = false,
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
                rating: rating,
                feedback: feedback,
                // trip_status: TripStatus.COMPLETED,
            };

            await updateTrip(payload).unwrap();

            // Emit rating event to socket
            socket.emit('driverRating', {
                tripId: tripData.trip_id,
                driverId: tripData.driver_id,
                rating: rating,
                feedback: feedback,
                timestamp: Date.now(),
            });

            Alert.alert(
                'Thank you!',
                'Your rating has been recorded.',
                [
                    {
                        text: 'Done',
                        onPress: () => {
                            // navigation.goBack();
                            // navigation.navigate(CheckoutScreen_Nav, tripData)

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
            // console.error('❌ Error submitting rating:', error);
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
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        // navigation.goBack();
                        // navigation.navigate(RideCompletedScreen_Nav, { ...tripData, isRated: false })

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
            {/* COMPLETION MESSAGE */}
            <View style={styles.completionSection}>
                <View style={styles.successIcon}>
                    <MaterialCommunityIcons
                        name="check-circle"
                        size={mS(60)}
                        color="#10B981"
                    />
                </View>
                <Text style={[styles.completionTitle, { color: appColors.text }]}>Trip Complete!</Text>
                <Text style={[styles.completionSubtitle, { color: appColors.secondaryText }]}>
                    Thank you for using VDrive
                </Text>
            </View>

            {/* TRIP SUMMARY */}
            <View style={[styles.summarySection, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E7EB', borderWidth: isDark ? 1 : 1 }]}>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: appColors.secondaryText }]}>Trip Fare</Text>
                    <Text style={[styles.summaryValue, { color: appColors.text }]}>₹{fare || '0'}</Text>
                </View>
                <View
                    style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E7EB', paddingTop: vS(12), marginTop: vS(12) }]}
                >
                    <Text style={[styles.summaryLabel, { color: appColors.secondaryText }]}>Duration</Text>
                    <Text style={[styles.summaryValue, { color: appColors.text }]}>
                        {tripData?.trip_duration_minutes || '--'} mins
                    </Text>
                </View>
            </View>

            {/* RATING SECTION */}
            <View style={styles.ratingSection}>
                <Text style={[styles.ratingTitle, { color: appColors.text }]}>Rate Your Trip</Text>

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
                                    star <= rating ? '#F59E0B' : isDark ? 'rgba(255, 255, 255, 0.1)' : '#D1D5DB'
                                }
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* RATING DISPLAY */}
                {rating > 0 && (
                    <Text style={[styles.ratingDisplay, { color: appColors.secondaryText }]}>
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
                <View style={[styles.feedbackSection, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.05)' : '#FFFBEB', borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FED7AA', borderWidth: isDark ? 1 : 1 }]}>
                    <Text style={[styles.feedbackLabel, { color: appColors.text }]}>Additional Feedback</Text>
                    <Text style={[styles.feedbackNote, { color: appColors.secondaryText }]}>
                        Tell us what can we improve (optional)
                    </Text>

                    <View style={styles.feedbackOptions}>
                        {['Clean', 'Professional', 'Friendly', 'Safe'].map(
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

            {/* ACTION BUTTONS */}
            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        { backgroundColor: appColors.button, opacity: rating === 0 ? 0.5 : 1 },
                    ]}
                    onPress={handleSubmitRating}
                    disabled={rating === 0 || isSubmitting}
                >
                    <Text style={styles.submitBtnText}>
                        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.skipBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#E5E7EB', borderWidth: 1 }]}
                    onPress={handleSkipRating}
                    disabled={isSubmitting}
                >
                    <Text style={[styles.skipBtnText, { color: appColors.secondaryText }]}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: hS(16),
        paddingVertical: vS(20),
    },

    // Completion Section
    completionSection: {
        alignItems: 'center',
        marginBottom: vS(28),
    },
    successIcon: {
        marginBottom: vS(16),
    },
    completionTitle: {
        fontSize: mS(28),
        fontWeight: '800',
        color: '#111827',
        marginBottom: vS(8),
        textAlign: 'center',
    },
    completionSubtitle: {
        fontSize: mS(14),
        color: '#6B7280',
        textAlign: 'center',
    },

    // Summary Section
    summarySection: {
        backgroundColor: '#F9FAFB',
        padding: hS(16),
        borderRadius: mS(12),
        marginBottom: vS(28),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: mS(14),
        color: '#6B7280',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: mS(18),
        fontWeight: '700',
        color: '#111827',
    },

    // Rating Section
    ratingSection: {
        alignItems: 'center',
        marginBottom: vS(24),
    },
    ratingTitle: {
        fontSize: mS(20),
        fontWeight: '700',
        color: '#111827',
        marginBottom: vS(20),
    },
    starContainer: {
        flexDirection: 'row',
        gap: hS(12),
        justifyContent: 'center',
        marginBottom: vS(16),
    },
    starBtn: {
        padding: hS(8),
    },
    ratingDisplay: {
        fontSize: mS(14),
        color: '#6B7280',
        fontStyle: 'italic',
        textAlign: 'center',
    },

    // Feedback Section
    feedbackSection: {
        backgroundColor: '#FFFBEB',
        padding: hS(16),
        borderRadius: mS(12),
        marginBottom: vS(24),
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    feedbackLabel: {
        fontSize: mS(14),
        fontWeight: '600',
        color: '#111827',
        marginBottom: vS(4),
    },
    feedbackNote: {
        fontSize: mS(12),
        color: '#6B7280',
        marginBottom: vS(12),
    },
    feedbackOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: hS(8),
    },
    feedbackChip: {
        paddingHorizontal: hS(12),
        paddingVertical: vS(8),
        borderRadius: mS(20),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    feedbackChipActive: {
        backgroundColor: colors.button,
        borderColor: colors.button,
    },
    feedbackChipText: {
        fontSize: mS(12),
        fontWeight: '500',
        color: '#6B7280',
    },
    feedbackChipTextActive: {
        color: '#FFFFFF',
    },

    // Button Section
    buttonSection: {
        gap: vS(12),
        marginBottom: vS(20),
    },
    submitBtn: {
        width: '100%',
        paddingVertical: vS(14),
        borderRadius: mS(12),
        backgroundColor: colors.button,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        fontSize: mS(16),
        fontWeight: '700',
        color: '#FFFFFF',
    },
    skipBtn: {
        width: '100%',
        paddingVertical: vS(12),
        borderRadius: mS(12),
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    skipBtnText: {
        fontSize: mS(14),
        fontWeight: '600',
        color: '#6B7280',
    },
});

export default RatingView;