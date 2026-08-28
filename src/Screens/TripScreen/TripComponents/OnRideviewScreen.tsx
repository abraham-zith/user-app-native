import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    Share,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Skeleton from '../../../Components/Skeleton';
import { Text } from '../../../Components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSocket } from '../../../Socket/SocketContext';
import { TripStatus } from '../../../enums/trip.enum';
import { useOptimization } from '../../../context/OptimizationContext';

// Utils
import { hS, vS, mS } from '../../../lib/responsive';
import { ChatScreen_Nav } from '../../../Navigations/navigations';
import { useAppTheme } from '../../../hooks/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Sub-Component: Pulse Animation for Live Status ---
const LivePulse = () => {
    const { shouldThrottle } = useOptimization();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (shouldThrottle) return;
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.5,
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
    }, [shouldThrottle]);

    return (
        <View style={pulseStyles.container}>
            <Animated.View style={[pulseStyles.pulse, { transform: [{ scale: pulseAnim }] }]} />
            <View style={pulseStyles.core} />
        </View>
    );
};

const pulseStyles = StyleSheet.create({
    container: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
    pulse: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(37, 99, 235, 0.4)' },
    core: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB' },
});

import { TripPhase } from '../../MapTrackingScreen/UserMapScreen';

interface OnRideViewProps {
    pickup: string;
    destination: string;
    eta: number;
    tripPhase: TripPhase;
    tripData: any;
    driver: any;
    navigation: any;
    status?: TripStatus; // ✅ Added reactive status
}

const OnRideView: React.FC<OnRideViewProps> = ({
    pickup,
    destination,
    eta,
    tripPhase,
    tripData,
    driver,
    navigation,
    status,
}) => {
    const { colors: appColors, isDark } = useAppTheme();
    const { socket } = useSocket();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [isImageLoading, setIsImageLoading] = useState(false);
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    // ==================== HANDLERS ====================
    const onShareTrip = async () => {
        try {
            const driverName = driver?.driverName || 'your driver';
            const vehicleInfo = [driver?.carModel, driver?.carPlate].filter(Boolean).join(' ') || 'vehicle';
            const destinationName = destination || 'my destination';
            const pickupName = pickup || 'my pickup location';

            const now = new Date();
            const dateStr = now.toLocaleDateString();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const shareMessage = `I'm on a T2Drive trip!
Date: ${dateStr}
Time: ${timeStr}

Driver: ${driverName}
Vehicle: ${vehicleInfo}

Pickup: ${pickupName}
Destination: ${destinationName}

Track my live ride here: https://t2drive.in/trip/share/${tripData.trip_id}`;

            await Share.share({
                message: shareMessage,
                title: 'Share Trip Status',
            });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleEmergency = useCallback(() => {
        Alert.alert('SOS / Emergency', 'Notify emergency contacts and support?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'SOS CALL (112)', onPress: () => Linking.openURL('tel:112') },
            {
                text: 'ALERT SUPPORT',
                onPress: () => {
                    socket.emit('emergency', { tripId: tripData.trip_id, timestamp: Date.now() });
                    Alert.alert('Alerted', 'Support team has been notified.');
                }
            },
        ]);
    }, [tripData.trip_id, socket]);

    const handleCallDriver = useCallback(() => {
        const phone = driver?.driverPhone || tripData.phone;
        if (phone) Linking.openURL(`tel:${phone}`);
        else Alert.alert('Error', 'Driver phone not available');
    }, [tripData]);

    const handleChat = useCallback(() => {
        navigation.navigate(ChatScreen_Nav, {
            driverId: tripData.driverId || tripData.driver_id || driver.driverId || driver.driver_id,
            rideId: tripData.trip_id,
            driverName: driver.driverName,
            driverImage: driver.driverImage,
            driverPhone: driver.driverPhone,
            userId: tripData.user_id,
        });
    }, [tripData, navigation]);

    // ==================== RENDER ====================

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* 1. PROGRESS TRACKER */}
            <View style={[styles.progressSection, { backgroundColor: isDark ? appColors.iconBox : appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', borderWidth: isDark ? 1 : 0 }]}>
                <View style={styles.progressHeader}>
                    <Text style={[styles.statusLabel, { color: appColors.text }]}>
                        {status === TripStatus.ARRIVED ? 'DRIVER ARRIVED' :
                            status === TripStatus.LIVE ? 'TRIP IN PROGRESS' :
                                status === TripStatus.WAITING ? 'DRIVER WAITING' :
                                    status === TripStatus.DAY_HALT ? 'TRIP HALTED (OVERNIGHT)' :
                                        status === TripStatus.RETURN_STARTED ? 'RETURN TRIP IN PROGRESS' :
                                            'HEADING TO PICKUP'}
                    </Text>
                    <LivePulse />
                </View>

                <View style={styles.timelineArea}>
                    <View style={[styles.timelineLine, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F3F4F6' }]}>
                        <View style={[
                            styles.timelineFill,
                            {
                                width: (status === TripStatus.LIVE || status === TripStatus.RETURN_STARTED) ? '75%' : (status === TripStatus.WAITING || status === TripStatus.DAY_HALT) ? '90%' : status === TripStatus.ARRIVED ? '50%' : '20%',
                                backgroundColor: isDark ? 'rgba(37, 99, 235, 0.8)' : '#2563EB'
                            }
                        ]} />
                        <View style={[
                            styles.carIconWrapper,
                            { left: (status === TripStatus.LIVE || status === TripStatus.RETURN_STARTED) ? '75%' : (status === TripStatus.WAITING || status === TripStatus.DAY_HALT) ? '90%' : status === TripStatus.ARRIVED ? '50%' : '20%' }
                        ]}>
                            <MaterialCommunityIcons name="car-side" size={mS(24)} color={appColors.primary} />
                        </View>
                    </View>
                    <View style={styles.locationPointsRow}>
                        <View style={styles.locationColLeft}>
                            <Text style={styles.locLabel}>PICKUP</Text>
                            <Text numberOfLines={1} style={[styles.locValue, { color: '#2563EB' }]}>{pickup.split(',')[0]}</Text>
                        </View>
                        <View style={styles.locationColRight}>
                            <Text style={styles.locLabelRight}>DROP-OFF</Text>
                            <Text numberOfLines={1} style={[styles.locValueRight, { color: appColors.text }]}>{destination.split(',')[0]}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ZONE 1: QUICK INFO (THE "GLANCE" AREA) */}
            <View style={[styles.zone1, { backgroundColor: isDark ? appColors.iconBox : appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                {/* Left: Driver and Car info */}
                <View style={styles.glanceLeft}>
                    <View style={[styles.avatar, styles.avatarContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0' }]}>
                        {driver?.driverProfilePic ? (
                            <>
                                <FastImage
                                    source={{ uri: driver.driverProfilePic, priority: FastImage.priority.normal }}
                                    style={styles.avatarImage}
                                    onLoadStart={() => setIsImageLoading(true)}
                                    onLoadEnd={() => setIsImageLoading(false)}
                                />
                                {isImageLoading && (
                                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                                        <Skeleton width="100%" height="100%" borderRadius={25} />
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={[styles.placeholderAvatar, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                                <MaterialCommunityIcons name="account" size={mS(22)} color={isDark ? '#64748B' : "#94A3B8"} />
                            </View>
                        )}
                    </View>
                    <View style={styles.carInfo}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.driverNameSmall, { color: appColors.text }]} numberOfLines={1}>
                                {driver?.driverName || 'Driver'}
                            </Text>
                            <MaterialCommunityIcons name="check-decagram" size={mS(16)} color="#2563EB" />
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={[styles.vehicleInfoSmall, { color: appColors.secondaryText }]} numberOfLines={1}>
                                {driver?.carModel || 'Sedan'}
                            </Text>
                            {/* <View style={styles.platePill}>
                                <Text style={styles.plateText}>{driver?.carPlate || 'TN 02 AB 1234'}</Text>
                            </View> */}
                        </View>
                    </View>
                </View>

                {/* Right: Huge ETA and "On time" */}
                <View style={styles.glanceRight}>
                    <View style={styles.etaBlock}>
                        <Text style={[styles.hugeEta, { color: appColors.text }]}>
                            {status === TripStatus.ACCEPTED ? '—' : `${eta} min`}
                        </Text>
                        <Text style={[styles.etaAwayText, { color: appColors.text }]}>away</Text>
                    </View>
                    <View style={styles.statusIndicator}>
                        <View style={styles.onTimeDot} />
                        <Text style={styles.onTimeText}>On time</Text>
                    </View>
                </View>
            </View>

            {/* ZONE 2: INTERACTION (THE "ACTION" AREA) */}
            <View style={styles.actionGrid}>
                {/* Chat Button */}
                <TouchableOpacity style={styles.actionPill} onPress={handleChat}>
                    <View style={[styles.actionIcon, { backgroundColor: isDark ? appColors.iconBox : '#F3F4F6' }]}>
                        <MaterialCommunityIcons name="message-text" size={mS(20)} color={isDark ? '#94A3B8' : "#4B5563"} />
                    </View>
                    <Text style={[styles.actionText, { color: appColors.secondaryText }]}>Chat</Text>
                </TouchableOpacity>

                {/* Call Button */}
                <TouchableOpacity style={styles.actionPill} onPress={handleCallDriver}>
                    <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
                        <MaterialCommunityIcons name="phone" size={mS(20)} color="#059669" />
                    </View>
                    <Text style={[styles.actionText, { color: appColors.secondaryText }]}>Call</Text>
                </TouchableOpacity>

                {/* Share Trip Button */}
                <TouchableOpacity style={styles.actionPill} onPress={onShareTrip}>
                    <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#EFF6FF', borderWidth: 1, borderColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)' }]}>
                        <MaterialCommunityIcons name="share-variant" size={mS(20)} color="#2563EB" />
                    </View>
                    <Text style={[styles.actionText, { color: appColors.secondaryText }]}>Share</Text>
                </TouchableOpacity>

                {/* SOS / Safety Button - Red Outline */}
                <TouchableOpacity style={styles.actionPill} onPress={handleEmergency}>
                    <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(220, 38, 38, 0.1)' : '#FEF2F2', borderWidth: 1.5, borderColor: '#DC2626' }]}>
                        <MaterialCommunityIcons name="shield-alert" size={mS(20)} color="#DC2626" />
                    </View>
                    <Text style={[styles.actionText, { color: appColors.secondaryText }]}>Safety</Text>
                </TouchableOpacity>
            </View>

            {/* ZONE 3: TRIP DETAILS (THE "INFORMATION" AREA) */}
            <View style={[styles.zone3, { backgroundColor: isDark ? appColors.iconBox : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                <View style={styles.fareInfo}>
                    <Text style={[styles.fareLabel, { color: appColors.secondaryText }]}>Fare</Text>
                    <View style={styles.fareRow}>
                        <Text style={[styles.fareValue, { color: appColors.text }]}>₹{tripData?.total_fare || '0'}</Text>
                        <View style={[styles.paymentBadge, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                            <MaterialCommunityIcons name="cash" size={mS(12)} color={appColors.secondaryText} />
                            <Text style={[styles.paymentText, { color: appColors.secondaryText }]}>{tripData.payment_type || 'Cash/Online'}</Text>
                            {/* <MaterialCommunityIcons name="chevron-up" size={mS(16)} color={appColors.secondaryText} /> */}
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: hS(16),
        paddingTop: vS(10),
    },

    // Progress Section
    progressSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(20),
        padding: mS(16),
        marginBottom: vS(16),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(20),
    },
    statusLabel: {
        fontSize: mS(14),
        fontWeight: '900',
        color: '#111827',
        letterSpacing: 0.5,
    },
    timelineArea: {
        marginTop: vS(10),
        marginBottom: vS(5),
    },
    timelineLine: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        position: 'relative',
        marginBottom: vS(15),
    },
    timelineFill: {
        height: '100%',
        backgroundColor: '#BFDBFE',
        borderRadius: 3,
    },
    carIconWrapper: {
        position: 'absolute',
        top: -10,
        marginLeft: -12,
    },
    locationPointsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationColLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    locationColRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    locLabel: {
        fontSize: mS(10),
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: vS(2),
    },
    locLabelRight: {
        fontSize: mS(10),
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: vS(2),
        textAlign: 'right',
    },
    locValue: {
        fontSize: mS(13),
        fontWeight: '700',
    },
    locValueRight: {
        fontSize: mS(13),
        fontWeight: '700',
        textAlign: 'right',
    },

    // Info Cards
    infoRow: {
        flexDirection: 'row',
        gap: hS(12),
        marginBottom: vS(16),
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: mS(16),
        padding: mS(12),
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(10),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    infoLabel: {
        fontSize: mS(9),
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: mS(15),
        fontWeight: '900',
        color: '#111827',
    },

    // Driver Card
    driverCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: mS(16),
        padding: mS(12),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: vS(20),
    },
    avatar: {
        width: mS(50),
        height: mS(50),
        borderRadius: mS(25),
        overflow: 'hidden',
    },
    avatarContainer: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderAvatar: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    driverCoreInfo: {
        flex: 1,
        marginLeft: hS(12),
    },
    driverName: {
        fontSize: mS(15),
        fontWeight: '800',
        color: '#111827',
    },
    vehicleInfo: {
        fontSize: mS(12),
        color: '#6B7280',
        fontWeight: '500',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(4),
        backgroundColor: '#FFFBEB',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: mS(8),
    },
    ratingText: {
        fontSize: mS(12),
        fontWeight: '800',
        color: '#D97706',
    },

    // Action Grid (Preserved base styles)
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: vS(16),
        paddingHorizontal: hS(4),
    },
    actionPill: {
        alignItems: 'center',
        gap: vS(6),
    },
    actionIcon: {
        width: mS(48),
        height: mS(48),
        borderRadius: mS(14),
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: mS(11),
        fontWeight: '700',
        color: '#4B5563',
    },

    // Zone 1: Glance Area
    zone1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: mS(20),
        padding: mS(12),
        marginBottom: vS(16),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    glanceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    carInfo: {
        marginLeft: hS(10),
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(4),
        marginBottom: vS(2),
    },
    driverNameSmall: {
        fontSize: mS(15),
        fontWeight: '800',
    },
    vehicleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(8),
    },
    vehicleInfoSmall: {
        fontSize: mS(11),
        fontWeight: '500',
    },
    platePill: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: hS(6),
        paddingVertical: vS(2),
        borderRadius: mS(4),
    },
    plateText: {
        fontSize: mS(10),
        color: '#1D4ED8',
        fontWeight: '700',
    },
    glanceRight: {
        alignItems: 'flex-end',
        paddingLeft: hS(10),
    },
    etaBlock: {
        alignItems: 'center',
        marginBottom: vS(2),
    },
    hugeEta: {
        fontSize: mS(18),
        fontWeight: '900',
        lineHeight: mS(22),
    },
    etaAwayText: {
        fontSize: mS(11),
        fontWeight: '600',
        lineHeight: mS(12),
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    onTimeDot: {
        width: mS(6),
        height: mS(6),
        borderRadius: mS(3),
        backgroundColor: '#10B981',
        marginRight: hS(4),
    },
    onTimeText: {
        fontSize: mS(10),
        fontWeight: '700',
        color: '#10B981',
    },

    // Zone 3: Trip Details
    zone3: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(20),
        padding: mS(16),
        marginBottom: vS(20),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    fareInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fareLabel: {
        fontSize: mS(14),
        fontWeight: '700',
        color: '#9CA3AF',
    },
    fareRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(8),
    },
    fareValue: {
        fontSize: mS(20),
        fontWeight: '900',
        color: '#111827',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: mS(12),
        gap: hS(4),
    },
    paymentText: {
        fontSize: mS(10),
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
});

export default OnRideView;