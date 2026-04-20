import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
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
}

const RideClosurePreview: React.FC<RideClosurePreviewProps> = ({
    tripData,
    fare,
    navigation,
}) => {
    const { colors: appColors, isDark } = useAppTheme();
    const { data: eligibilityRes } = useCheckReferralEligibilityQuery();
    const isEligible = eligibilityRes?.data?.isEligible;

    const handleProceedToPayment = () => {
        navigation.navigate(CheckoutScreen_Nav, tripData);
    };

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            {/* ARRIVED STATUS */}
            <View style={styles.headerSection}>
                <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
                    <MaterialCommunityIcons
                        name="map-marker-check"
                        size={mS(40)}
                        color="#10B981"
                    />
                </View>
                <Text style={[styles.title, { color: appColors.text }]}>Destination Reached</Text>
                <Text style={[styles.subtitle, { color: appColors.secondaryText }]}>
                    You have arrived safely. Please complete the payment to finish the trip.
                </Text>
                {isEligible && (
                    <View style={[styles.hintContainer, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#EFF6FF' }]}>
                        <MaterialCommunityIcons name="information" size={mS(16)} color="#3B82F6" />
                        <Text style={styles.hintText}>💡 Your first ride discount will be applied at checkout</Text>
                    </View>
                )}
            </View>

            {/* FARE SUMMARY */}
            <View style={[styles.summaryCard, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E7EB', borderWidth: isDark ? 1 : 1 }]}>
                <View style={styles.summaryRow}>
                    <View>
                        <Text style={[styles.label, { color: appColors.secondaryText }]}>Total Fare</Text>
                        <Text style={[styles.amount, { color: appColors.text }]}>₹{fare || '0'}</Text>
                    </View>
                    <View style={[styles.paymentBadge, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB' }]}>
                        <Text style={[styles.paymentText, { color: '#F59E0B' }]}>Payment Pending</Text>
                    </View>
                </View>

                {tripData?.discount > 0 && (
                    <View style={[styles.couponRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9' }]}>
                        <View style={styles.couponInfo}>
                            <MaterialCommunityIcons name="tag-text" size={mS(16)} color="#10B981" />
                            <Text style={styles.couponMessage}>Coupon Applied ({tripData.coupon_code})</Text>
                        </View>
                        <Text style={styles.discountAmount}>- ₹{tripData.discount}</Text>
                    </View>
                )}
            </View>

            {/* ACTION BUTTON */}
            <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: appColors.button }]}
                onPress={handleProceedToPayment}
                activeOpacity={0.8}
            >
                <Text style={styles.payBtnText}>Proceed to Payment</Text>
                <MaterialCommunityIcons name="arrow-right" size={mS(20)} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: hS(20),
        paddingVertical: vS(24),
        borderTopLeftRadius: mS(30),
        borderTopRightRadius: mS(30),
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: vS(30),
    },
    iconCircle: {
        width: mS(80),
        height: mS(80),
        borderRadius: mS(40),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(16),
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
        paddingHorizontal: hS(20),
        lineHeight: vS(20),
    },
    summaryCard: {
        padding: mS(20),
        borderRadius: mS(20),
        marginBottom: vS(30),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: mS(12),
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: vS(4),
    },
    amount: {
        fontSize: mS(32),
        fontWeight: '900',
    },
    paymentBadge: {
        paddingHorizontal: hS(12),
        paddingVertical: vS(6),
        borderRadius: mS(8),
    },
    paymentText: {
        fontSize: mS(12),
        fontWeight: '800',
    },
    payBtn: {
        height: vS(56),
        borderRadius: mS(18),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: hS(10),
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    payBtnText: {
        color: '#FFF',
        fontSize: mS(18),
        fontWeight: '800',
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(10),
        paddingHorizontal: hS(16),
        borderRadius: mS(12),
        marginTop: vS(16),
        gap: hS(8),
    },
    hintText: {
        fontSize: mS(13),
        fontWeight: '600',
        color: '#3B82F6',
    },
    couponRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: vS(15),
        marginTop: vS(15),
        borderTopWidth: 1,
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
    }
});

export default RideClosurePreview;
