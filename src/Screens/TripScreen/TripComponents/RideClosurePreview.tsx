import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useCheckReferralEligibilityQuery } from '../../../service/referralApi';
import { Text } from '../../../Components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Types & Enums
import { PaymentStatus } from '../../../enums/trip.enum';
import { CheckoutScreen_Nav } from '../../../Navigations/navigations';

// Utils
import { hS, vS, mS } from '../../../lib/responsive';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface RideClosurePreviewProps {
    tripData: any;
    fare: number;
    navigation: any;
    driver?: any;
}

const RideClosurePreview: React.FC<RideClosurePreviewProps> = ({
    tripData,
    fare,
    navigation,
    driver,
}) => {
    const { colors: appColors, isDark } = useAppTheme();
    const { data: eligibilityRes } = useCheckReferralEligibilityQuery();
    const isEligible = eligibilityRes?.data?.isEligible;

    const handleProceedToPayment = () => {
        navigation.navigate(CheckoutScreen_Nav, tripData);
    };

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: vS(30) }}>
                
                {/* HERO HEADER */}
                <View style={styles.headerSection}>
                    <View style={[styles.iconGlow, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5' }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#10B981' }]}>
                            <MaterialCommunityIcons name="check" size={mS(40)} color="#FFFFFF" />
                        </View>
                    </View>
                    <Text style={[styles.title, { color: appColors.text }]}>Destination Reached</Text>
                    <Text style={[styles.subtitle, { color: appColors.secondaryText }]}>
                        You have arrived safely. Please complete the payment to finish the trip.
                    </Text>
                </View>

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
                            <Text style={[styles.statText, { color: appColors.text }]}>{tripData?.duration ? `${Math.round(tripData.duration / 60)} mins` : '-'}</Text>
                        </View>
                    </View>
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

                {/* FARE SUMMARY CARD */}
                <View style={[styles.summaryCard, { backgroundColor: isDark ? appColors.iconBox : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB', borderWidth: 1, shadowColor: isDark ? '#000' : '#E5E7EB' }]}>
                    <Text style={styles.fareLabel}>TOTAL FARE</Text>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.amount, { color: appColors.text }]}>₹{fare || '0'}</Text>
                        <View style={[styles.paymentBadge, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7' }]}>
                            <MaterialCommunityIcons name="clock-alert-outline" size={mS(14)} color="#D97706" style={{ marginRight: hS(4) }} />
                            <Text style={[styles.paymentText, { color: '#D97706' }]}>Payment Pending</Text>
                        </View>
                    </View>

                    {tripData?.discount > 0 && (
                        <View style={[styles.couponRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F3F4F6' }]}>
                            <View style={styles.couponInfo}>
                                <MaterialCommunityIcons name="ticket-percent" size={mS(18)} color="#10B981" />
                                <Text style={styles.couponMessage}>Coupon Applied ({tripData.coupon_code})</Text>
                            </View>
                            <Text style={styles.discountAmount}>- ₹{tripData.discount}</Text>
                        </View>
                    )}
                </View>

                {isEligible && (
                    <View style={[styles.hintContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }]}>
                        <MaterialCommunityIcons name="information" size={mS(18)} color="#3B82F6" />
                        <Text style={styles.hintText}>💡 Your first ride discount will be applied at checkout</Text>
                    </View>
                )}
            </ScrollView>

            {/* ACTION BUTTON FIXED AT BOTTOM */}
            <View style={styles.bottomAction}>
                <TouchableOpacity
                    style={[styles.payBtn, { backgroundColor: appColors.primary }]}
                    onPress={handleProceedToPayment}
                    activeOpacity={0.8}
                >
                    <Text style={styles.payBtnText}>Proceed to Payment</Text>
                    <MaterialCommunityIcons name="arrow-right" size={mS(20)} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

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
    detailCard: {
        borderRadius: mS(16),
        padding: mS(16),
        marginBottom: vS(16),
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
    summaryCard: {
        padding: mS(20),
        borderRadius: mS(20),
        marginBottom: vS(16),
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
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(12),
        paddingHorizontal: hS(16),
        borderRadius: mS(12),
        marginBottom: vS(20),
        gap: hS(10),
    },
    hintText: {
        fontSize: mS(13),
        fontWeight: '600',
        color: '#3B82F6',
        flex: 1,
    },
    bottomAction: {
        paddingTop: vS(16),
        paddingBottom: vS(16),
    },
    payBtn: {
        height: vS(56),
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
    payBtnText: {
        color: '#FFF',
        fontSize: mS(18),
        fontWeight: '800',
    }
});

export default RideClosurePreview;
