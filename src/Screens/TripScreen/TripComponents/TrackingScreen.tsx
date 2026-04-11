import React, { useCallback, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Linking,
    Animated,
    Dimensions,
} from 'react-native';
import { Text } from '../../../Components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSocket } from '../../../Socket/SocketContext';
import { hS, vS, mS } from '../../../lib/responsive';
import colors from '../../../constant/colors';
import { useAppTheme } from '../../../hooks/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TrackingViewProps {
    trip: any;
    driver: any;
    eta: number;
    status: string;
    navigation: any;
}

const TrackingView: React.FC<TrackingViewProps> = ({
    trip,
    driver,
    eta,
    status,
    navigation,
}) => {
    const { colors: appColors, isDark } = useAppTheme();
    // ==================== ANIMATIONS ====================
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        // Fade in entire content
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Pulse animation for status badges
        if (status === 'ACCEPTED' || status === 'ARRIVING' || status === 'ARRIVED') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [status]);

    // ==================== SOCKET & HANDLERS ====================
    const { socket } = useSocket();

    const handleCallDriver = useCallback(() => {
        const phoneNumber = driver?.driverPhone || driver?.phone_number || driver?.phone || '';
        if (!phoneNumber) {
            Alert.alert('Error', 'Driver phone number not available');
            return;
        }
        const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, '');
        const url = `tel:${cleanedNumber}`;
        Linking.canOpenURL(url).then((supported) => {
            if (!supported) {
                Alert.alert('Not Supported', 'Your device does not support calling.');
            } else {
                return Linking.openURL(url);
            }
        }).catch(err => {
            Alert.alert('Something Went Wrong!!!', 'Try Again Later');
            // console.error('Call Error:', err)
        });
    }, [driver]);

    const handleSMSDriver = useCallback(() => {
        navigation.navigate('ChatScreen', {
            rideId: trip.trip_id,
            driverId: driver.driverId,
            driverName: driver.driverName,
            driverImage: driver.driverImage,
            driverPhone: driver.driverPhone,
            userId: trip.user_id,
        })
        // const phoneNumber = driver?.driverPhone || driver?.phone_number || driver?.phone || '';
        // if (!phoneNumber) {
        //     Alert.alert('Error', 'Driver phone number not available');
        //     return;
        // }
        // const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, '');
        // Linking.openURL(`sms:${cleanedNumber}`).catch(err => console.error('SMS Error:', err));
    }, [driver]);

    const handleShareLocation = useCallback(() => {
        if (!driver?.driverId || !trip?.trip_id) {
            Alert.alert('Error', 'Missing required information');
            return;
        }
        socket.emit('shareLocation', {
            tripId: trip.trip_id,
            driverId: driver.driverId,
            userLat: trip.pickup_lat,
            userLng: trip.pickup_lng,
            timestamp: Date.now(),
        });
        Alert.alert('Success', 'Location shared with driver');
    }, [driver, trip, socket]);

    // ==================== RENDER ====================

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* 1. HEADER SECTION: Title & Status */}
            <View style={styles.headerSection}>
                <View>
                    <View style={styles.titleRow}>
                        <Text style={[styles.headerTitle, { color: appColors.text }]}>
                            {status === 'ARRIVED' ? 'Driver is here!' : 'Driver on the way!'}
                        </Text>
                        <View style={styles.greenDot} />
                    </View>
                    <Text style={[styles.etaText, { color: appColors.secondaryText }]}>
                        {status === 'ACCEPTED' ? 'Driver Found!' :
                            status === 'ARRIVING' ? `Arriving in ${eta} mins...` :
                                'Pick up point reached'}
                    </Text>
                </View>
                <View style={[styles.lottieContainer, {
                    backgroundColor: isDark ? appColors.iconBox : '#F1F5F9',
                    borderColor: isDark ? appColors.border : '#E2E8F0',
                    borderWidth: 1,
                    borderRadius: mS(10),
                }]}>
                    <MaterialCommunityIcons name="car-connected" size={mS(32)} color={appColors.primary} />
                </View>
            </View>

            {/* 2. DRIVER VERIFICATION (OTP) SECTION */}
            <View style={styles.otpSection}>
                <View style={[styles.otpGlassCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)' }]}>
                    <Text style={[styles.otpCode, { color: appColors.text }]}>{driver?.driverOTP || '1234'}</Text>
                    <Text style={[styles.otpLabel, { color: appColors.secondaryText }]}>OTP FOR DRIVER</Text>
                </View>
            </View>

            {/* 3. PREMIUM DRIVER INFO CARD */}
            <View style={[styles.premiumDriverCard, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB' }]}>
                <View style={styles.driverCoreRow}>
                    <View style={styles.avatarGlowWrapper}>
                        <View style={[styles.avatarGlow, { borderColor: appColors.primary }]} />
                        <View style={[styles.premiumAvatar, styles.avatarContainer, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                            {driver?.driverProfilePic ? (
                                <Image
                                    source={{ uri: driver.driverProfilePic }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <View style={[styles.placeholderAvatar, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                                    <MaterialCommunityIcons name="account" size={mS(28)} color={appColors.border} />
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.driverInfoBody}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.driverNameBold, { color: appColors.text }]}>{driver?.driverName || 'Sabari Mohan'}</Text>
                            <MaterialCommunityIcons name="check-decagram" size={mS(16)} color="#2196F3" style={styles.verifiedIcon} />
                        </View>
                        <View style={styles.ratingRow}>
                            <MaterialCommunityIcons name="star" size={mS(14)} color="#F59E0B" />
                            <Text style={[styles.ratingText, { color: appColors.secondaryText }]}>{driver?.driverRating || '4.9'}</Text>
                            <Text style={styles.rideCount}> • 4.5k Rides</Text>
                        </View>
                    </View>

                    <View style={styles.carDetailsArea}>
                        <View style={[styles.plateBadge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#111827' }]}>
                            <Text style={[styles.plateText, { color: isDark ? appColors.text : '#FFFFFF' }]}>{driver?.carPlate || 'TN 02 3456'}</Text>
                        </View>
                        <Text style={[styles.carModelText, { color: appColors.secondaryText }]} numberOfLines={1}>
                            {driver?.carModel || 'White Sedan'}
                        </Text>
                    </View>
                </View>

                {/* 4. ACTION BUTTONS SECTION */}
                <View style={[styles.actionSection, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                    <TouchableOpacity style={styles.roundActionBtn} onPress={handleSMSDriver}>
                        <View style={[styles.neumorphIcon, { backgroundColor: isDark ? appColors.iconBox : '#FFFFFF' }]}>
                            <MaterialCommunityIcons name="message-text" size={mS(22)} color={appColors.primary} />
                        </View>
                        <Text style={[styles.actionLabel, { color: appColors.secondaryText }]}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.roundActionBtn} onPress={handleCallDriver}>
                        <View style={[styles.neumorphIcon, { backgroundColor: isDark ? appColors.iconBox : '#FFFFFF' }]}>
                            <MaterialCommunityIcons name="phone" size={mS(22)} color="#059669" />
                        </View>
                        <Text style={[styles.actionLabel, { color: appColors.secondaryText }]}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.roundActionBtn} onPress={handleShareLocation}>
                        <View style={[styles.neumorphIcon, { backgroundColor: isDark ? appColors.iconBox : '#FFFFFF' }]}>
                            <MaterialCommunityIcons name="share-variant" size={mS(22)} color="#2563EB" />
                        </View>
                        <Text style={[styles.actionLabel, { color: appColors.secondaryText }]}>Share</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 5. RIDE STATUS STRIP */}
            <View style={styles.statusStrip}>
                <View style={[styles.stripGradient, { backgroundColor: appColors.primary }]}>
                    <Text style={styles.stripText}>
                        {status === 'ARRIVED' ? 'Driver Waiting' : 'Heading to pickup...'}
                    </Text>
                </View>
            </View>

            {/* 6. BOTTOM FOOTER */}
            <View style={styles.footerInfo}>
                <View style={styles.footerItem}>
                    <MaterialCommunityIcons name="credit-card-check-outline" size={mS(14)} color="#6B7280" />
                    <Text style={styles.footerText}>Online Payment Enabled</Text>
                </View>
                <View style={styles.footerItem}>
                    <MaterialCommunityIcons name="shield-check-outline" size={mS(14)} color="#6B7280" />
                    <Text style={styles.footerText}>Safety Insured</Text>
                </View>
            </View>
        </Animated.View>
    );
};

// ==================== PREMIUM STYLES ====================

const styles = StyleSheet.create({
    container: {
        paddingTop: vS(8),
        paddingHorizontal: hS(16),
        width: '100%',
    },

    // 1. Header Section
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(16),
        paddingHorizontal: hS(4),
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(6),
    },
    headerTitle: {
        fontSize: mS(22),
        fontWeight: '900',
        color: '#111827',
        letterSpacing: -0.5,
    },
    greenDot: {
        width: mS(8),
        height: mS(8),
        borderRadius: mS(4),
        backgroundColor: '#10B981',
        marginTop: vS(2),
    },
    etaText: {
        fontSize: mS(14),
        color: '#6B7280',
        fontWeight: '600',
        marginTop: vS(2),
    },
    lottieContainer: {
        width: mS(50),
        height: mS(50),
        justifyContent: 'center',
        alignItems: 'center',
    },

    // 2. OTP Section
    otpSection: {
        alignItems: 'center',
        marginBottom: vS(20),
    },
    otpGlassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: hS(24),
        paddingVertical: vS(10),
        borderRadius: mS(16),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    otpCode: {
        fontSize: mS(28),
        fontWeight: '900',
        color: '#111827',
        letterSpacing: 4,
    },
    otpLabel: {
        fontSize: mS(9),
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginTop: vS(4),
    },

    // 3. Premium Driver Card
    premiumDriverCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(28),
        padding: mS(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F9FAFB',
        marginBottom: vS(16),
    },
    driverCoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vS(16),
    },
    avatarGlowWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarGlow: {
        position: 'absolute',
        width: mS(68),
        height: mS(68),
        borderRadius: mS(34),
        borderWidth: 2,
        borderColor: colors.primary,
        opacity: 0.1,
    },
    premiumAvatar: {
        width: mS(56),
        height: mS(56),
        borderRadius: mS(28),
        overflow: 'hidden',
    },
    avatarContainer: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderAvatar: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    driverInfoBody: {
        flex: 1,
        marginLeft: hS(12),
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(4),
        marginBottom: vS(2),
    },
    driverNameBold: {
        fontSize: mS(16),
        fontWeight: '800',
        color: '#111827',
    },
    verifiedIcon: {
        marginTop: vS(1),
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: mS(12),
        fontWeight: '700',
        color: '#4B5563',
        marginLeft: hS(2),
    },
    rideCount: {
        fontSize: mS(12),
        color: '#9CA3AF',
        fontWeight: '500',
    },
    carDetailsArea: {
        alignItems: 'flex-end',
    },
    plateBadge: {
        backgroundColor: '#111827',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: mS(8),
    },
    plateText: {
        fontSize: mS(11),
        fontWeight: '900',
        color: '#FFFFFF',
    },
    carModelText: {
        fontSize: mS(10),
        color: '#6B7280',
        fontWeight: '700',
        marginTop: vS(4),
        maxWidth: hS(80),
    },

    // 4. Action Section
    actionSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: vS(16),
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    roundActionBtn: {
        alignItems: 'center',
        gap: vS(6),
    },
    neumorphIcon: {
        width: mS(48),
        height: mS(48),
        borderRadius: mS(24),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    actionLabel: {
        fontSize: mS(10),
        fontWeight: '800',
        color: '#4B5563',
    },

    // 5. Status Strip
    statusStrip: {
        marginBottom: vS(16),
    },
    stripGradient: {
        backgroundColor: colors.primary,
        borderRadius: mS(16),
        paddingVertical: vS(12),
        alignItems: 'center',
        opacity: 0.9,
    },
    stripText: {
        fontSize: mS(14),
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },

    // 6. Footer
    footerInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: hS(16),
        marginBottom: vS(20),
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(4),
    },
    footerText: {
        fontSize: mS(11),
        color: '#9CA3AF',
        fontWeight: '600',
    },
});

export default TrackingView;