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
import { Easing } from 'react-native';

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

const BigPulse = () => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ).start();
    }, [pulseAnim]);

    const activeScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 3],
    });

    const activeOpacity = pulseAnim.interpolate({
        inputRange: [0, 0.8, 1],
        outputRange: [0.6, 0, 0],
    });

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 70, height: 150 }}>
            <Animated.View style={{
                position: 'absolute',
                width: 120, height: 120, borderRadius: 60,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                transform: [{ scale: activeScale }],
                opacity: activeOpacity
            }} />
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }}>
                <MaterialCommunityIcons name="clock-outline" size={40} color="#FFF" />
            </View>
        </View>
    );
};

import { TripPhase } from '../../MapTrackingScreen/UserMapScreen';

interface DayHaltWaitingViewProps {
    pickup: string;
    destination: string;
    eta: number;
    tripPhase: TripPhase;
    tripData: any;
    driver: any;
    navigation: any;
    status?: TripStatus; // ✅ Added reactive status
}

const DayHaltWaitingView: React.FC<DayHaltWaitingViewProps> = ({
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
            await Share.share({
                message: `I'm on a T2Drive trip to ${destination}. Track me here: t2driveapp://trips/${tripData.trip_id}`,
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
            <View style={styles.cityBgContainer}>
                <View style={styles.treeLeft}>
                    <View style={styles.treeTop} />
                    <View style={styles.treeTrunk} />
                </View>
                <View style={styles.buildingLeft1} />
                <View style={styles.buildingLeft2} />
                <View style={styles.buildingLeft3} />
                
                <View style={styles.buildingRight1} />
                <View style={styles.buildingRight2} />
                <View style={styles.treeRight}>
                    <View style={styles.treeTop} />
                    <View style={styles.treeTrunk} />
                </View>
                <View style={styles.ground} />
            </View>
            {/* BIG PULSE HEADER */}
            <BigPulse />

            {/* 1. DAY HALT TRACKER */}
            <View style={[styles.progressSection, { backgroundColor: isDark ? appColors.iconBox : appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', borderWidth: isDark ? 1 : 0 }]}>
                <View style={styles.progressHeader}>
                    <Text style={[styles.statusLabel, { color: appColors.text, fontSize: mS(18) }]}>
                        TRIP HALTED (PAUSED)
                    </Text>
                    <LivePulse />
                </View>

                <View style={styles.timelineArea}>
                    <Text style={{ color: appColors.secondaryText, fontSize: mS(13), marginBottom: vS(10) }}>
                        The driver has halted the trip for the day and will resume tomorrow.
                    </Text>
                    <View style={styles.locationPoints}>
                        <View style={styles.point}>
                            <View style={[styles.dot, styles.pickupDot]} />
                            <Text numberOfLines={2} style={[styles.pointText, { color: appColors.secondaryText }]}>{destination}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ZONE 1: QUICK INFO (THE "GLANCE" AREA) */}
            <View style={[styles.zone1, { backgroundColor: isDark ? appColors.iconBox : appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                {/* Left: Driver and Car info */}
                <View style={styles.glanceLeft}>
                    <View style={[styles.avatar, styles.avatarContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0' }]}>
                        {driver?.driverImage ? (
                            <>
                                <FastImage
                                    source={{ uri: driver.driverImage, priority: FastImage.priority.normal }}
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
                        <Text style={[styles.driverNameSmall, { color: appColors.text }]} numberOfLines={1}>
                            {driver?.driverName || 'Driver'}
                        </Text>
                        <Text style={[styles.vehicleInfoSmall, { color: appColors.secondaryText }]} numberOfLines={1}>
                            {driver?.carModel || 'Sedan'} • {driver?.carPlate || 'TN 02'}
                        </Text>
                    </View>
                </View>

                {/* Right: Waiting duration/info */}
                <View style={styles.glanceRight}>
                    <Text style={[styles.hugeEta, { color: appColors.text, fontSize: mS(18) }]}>
                        Waiting
                    </Text>
                    <View style={styles.statusIndicator}>
                        <View style={[styles.onTimeDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={[styles.onTimeText, { color: '#F59E0B' }]}>Driver paused</Text>
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
            <View style={[styles.zone3, { backgroundColor: isDark ? appColors.iconBox : '#F9FAFB', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                <View style={[styles.routeSummary, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                    <View style={styles.routeItem}>
                        <Text style={styles.routeIcon}>📍</Text>
                        <Text style={styles.routeLabel} numberOfLines={1}>Pickup: </Text>
                        <Text style={[styles.routeValue, {
                            color: isDark ? appColors.primary : appColors.button
                        }]} numberOfLines={1}>{pickup.split(',')[0]}</Text>
                    </View>
                    <View style={styles.routeItem}>
                        <Text style={styles.routeIcon}>🏁</Text>
                        <Text style={[styles.routeLabel, { color: appColors.secondaryText }]} numberOfLines={1}>Drop-off: </Text>
                        <Text style={[styles.routeValue, { color: appColors.text }]} numberOfLines={1}>{destination.split(',')[0]}</Text>
                    </View>
                </View>

                {/* Additional Trip Info - Pill UI */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mS(8), marginTop: vS(4), marginBottom: vS(16) }}>
                    {tripData?.ride_type && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1E293B' : '#F1F5F9', paddingHorizontal: hS(10), paddingVertical: vS(6), borderRadius: mS(8) }}>
                            <MaterialCommunityIcons name="car-info" size={mS(14)} color={appColors.secondaryText} />
                            <Text style={{ fontSize: mS(11), fontWeight: '700', color: appColors.text, marginLeft: hS(4) }}>{tripData.ride_type}</Text>
                        </View>
                    )}
                    {tripData?.trip_type && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1E293B' : '#F1F5F9', paddingHorizontal: hS(10), paddingVertical: vS(6), borderRadius: mS(8) }}>
                            <MaterialCommunityIcons name="swap-horizontal" size={mS(14)} color={appColors.secondaryText} />
                            <Text style={{ fontSize: mS(11), fontWeight: '700', color: appColors.text, marginLeft: hS(4) }}>{tripData.trip_type}</Text>
                        </View>
                    )}
                    {tripData?.created_at && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1E293B' : '#F1F5F9', paddingHorizontal: hS(10), paddingVertical: vS(6), borderRadius: mS(8) }}>
                            <MaterialCommunityIcons name="calendar-clock" size={mS(14)} color={appColors.secondaryText} />
                            <Text style={{ fontSize: mS(11), fontWeight: '700', color: appColors.text, marginLeft: hS(4) }}>
                                {new Date(tripData.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.fareInfo}>
                    <Text style={[styles.fareLabel, { color: appColors.secondaryText }]}>Fare</Text>
                    <View style={styles.fareRow}>
                        <Text style={[styles.fareValue, { color: appColors.text }]}>₹{tripData?.total_fare || '0'}</Text>
                        <View style={[styles.paymentBadge, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                            <MaterialCommunityIcons name="cash" size={mS(12)} color={appColors.secondaryText} />
                            <Text style={[styles.paymentText, { color: appColors.secondaryText }]}>{tripData.payment_type || 'Cash'}</Text>
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
    
    // City Background
    cityBgContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: vS(280), justifyContent: 'flex-end', opacity: 0.15, zIndex: 0 },
    ground: { height: vS(100), backgroundColor: '#47B872', width: '100%' },
    treeLeft: { position: 'absolute', bottom: vS(100), left: mS(25), alignItems: 'center' },
    treeRight: { position: 'absolute', bottom: vS(100), right: mS(25), alignItems: 'center' },
    treeTop: { width: mS(28), height: mS(40), borderRadius: mS(14), backgroundColor: '#47B872' },
    treeTrunk: { width: mS(4), height: mS(16), backgroundColor: '#47B872' },
    buildingLeft1: { position: 'absolute', bottom: vS(100), left: mS(70), width: mS(28), height: vS(50), backgroundColor: '#47B872', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
    buildingLeft2: { position: 'absolute', bottom: vS(100), left: mS(100), width: mS(22), height: vS(80), backgroundColor: '#47B872', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
    buildingLeft3: { position: 'absolute', bottom: vS(100), left: mS(124), width: mS(30), height: vS(60), backgroundColor: '#47B872', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
    buildingRight1: { position: 'absolute', bottom: vS(100), right: mS(90), width: mS(35), height: vS(95), backgroundColor: '#47B872', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
    buildingRight2: { position: 'absolute', bottom: vS(100), right: mS(60), width: mS(28), height: vS(65), backgroundColor: '#47B872', borderTopLeftRadius: 2, borderTopRightRadius: 2 },

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
    locationPoints: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    point: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(8),
        flex: 1,
    },
    pointText: {
        fontSize: mS(12),
        fontWeight: '600',
        color: '#4B5563',
        flex: 1,
    },
    destText: {
        textAlign: 'right',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    pickupDot: { backgroundColor: '#10B981' },
    destDot: { backgroundColor: '#EF4444' },

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
    driverNameSmall: {
        fontSize: mS(15),
        fontWeight: '800',
        color: '#111827',
    },
    vehicleInfoSmall: {
        fontSize: mS(11),
        color: '#6B7280',
        fontWeight: '500',
    },
    glanceRight: {
        alignItems: 'flex-end',
        paddingLeft: hS(10),
    },
    hugeEta: {
        fontSize: mS(24),
        fontWeight: '900',
        color: '#111827',
        lineHeight: mS(28),
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vS(2),
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
        backgroundColor: '#F9FAFB',
        borderRadius: mS(20),
        padding: mS(16),
        marginBottom: vS(20),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    routeSummary: {
        marginBottom: vS(12),
        paddingBottom: vS(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    routeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vS(6),
    },
    routeIcon: {
        fontSize: mS(12),
        marginRight: hS(8),
    },
    routeLabel: {
        fontSize: mS(12),
        fontWeight: '700',
        color: '#9CA3AF',
    },
    routeValue: {
        fontSize: mS(12),
        fontWeight: '600',
        // color: '#1F2937',
        flex: 1,
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

export default DayHaltWaitingView;