import React, { useCallback, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Linking,
    Animated,
    Dimensions,
    Share,
} from 'react-native';
import { Text } from '../../../Components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSocket } from '../../../Socket/SocketContext';
import { hS, vS, mS } from '../../../lib/responsive';
import colors from '../../../constant/colors';
import { useAppTheme } from '../../../hooks/useAppTheme';
import FastImage from 'react-native-fast-image';
import Skeleton from '../../../Components/Skeleton';

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
    const [isImageLoading, setIsImageLoading] = React.useState(false);

    // ==================== ANIMATIONS ====================
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

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
        });
    }, [driver]);

    const handleSMSDriver = useCallback(() => {
        navigation.navigate('ChatScreen', {
            rideId: trip.trip_id,
            driverId: driver.driverId,
            driverName: driver.driverName,
            driverImage: driver.driverProfilePic || driver.driverImage,
            driverPhone: driver.driverPhone,
            userId: trip.user_id,
        });
    }, [driver, trip, navigation]);

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

    const handleShareTrip = async () => {
        try {
            const driverName = driver?.driverName || 'your driver';
            const vehicleInfo = [driver?.carModel, driver?.carPlate].filter(Boolean).join(' ') || 'vehicle';
            const destinationName = trip?.drop_address || trip?.destination || 'my destination';
            const pickupName = trip?.pickup_address || trip?.pickup || 'my pickup location';

            const now = new Date();
            const dateStr = now.toLocaleDateString();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const shareMessage = `I'm on a trip!
Date: ${dateStr}
Time: ${timeStr}

Driver: ${driverName}
Vehicle: ${vehicleInfo}

Pickup: ${pickupName}
Destination: ${destinationName}

Track my live ride here: https://t2drive.in/trip/share/${trip?.trip_id}`;

            await Share.share({
                message: shareMessage,
                title: 'Share Trip Status',
            });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    // Extract OTP digits
    const otpString = String(trip?.otp || driver?.driverOTP || '1234').padStart(4, '0');
    const otpDigits = otpString.split('');

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* 1. Header Section */}
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.headerTitle, { color: appColors.text }]}>
                            {status === 'ARRIVED' ? 'Driver is here' : 'Driver on the way'}
                        </Text>
                        <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7' }]}>
                            <Text style={[styles.statusPillText, { color: '#16A34A' }]}>
                                {status === 'ARRIVED' ? 'Arrived' : 'Arriving Soon'}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.subtitleText, { color: appColors.secondaryText }]}>
                        {status === 'ACCEPTED' ? 'Driver Found!' :
                            status === 'ARRIVING' ? `Arriving in ${eta} mins...` :
                                'Pick up point reached'}
                    </Text>
                </View>
            </View>

            {/* 2. Driver Profile Card */}
            <View style={[styles.driverCard, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' }]}>
                <View style={styles.driverCardRow}>
                    <View style={styles.avatarContainer}>
                        {driver?.driverProfilePic ? (
                            <>
                                <FastImage
                                    source={{ uri: driver.driverProfilePic, priority: FastImage.priority.normal }}
                                    style={styles.avatarImage}
                                    onLoadStart={() => setIsImageLoading(true)}
                                    onLoadEnd={() => setIsImageLoading(false)}
                                />
                                {isImageLoading && (
                                    <View style={StyleSheet.absoluteFillObject}>
                                        <Skeleton width="100%" height="100%" borderRadius={24} />
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.placeholderAvatar}>
                                <MaterialCommunityIcons name="account" size={mS(24)} color="#9CA3AF" />
                            </View>
                        )}
                    </View>
                    <View style={styles.driverInfo}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.driverName, { color: appColors.text }]}>{driver?.driverName || 'Driver Assigned'}</Text>
                            <MaterialCommunityIcons name="check-decagram" size={mS(14)} color="#2563EB" />
                        </View>
                        <View style={styles.ratingRow}>
                            <MaterialCommunityIcons name="star" size={mS(12)} color="#F59E0B" />
                            <Text style={[styles.ratingText, { color: appColors.secondaryText }]}>{driver?.driverRating || '5.0'}</Text>
                            {driver?.totalRides ? (
                                <Text style={[styles.ridesText, { color: '#9CA3AF' }]}> • {driver.totalRides} Rides</Text>
                            ) : null}
                        </View>
                        {driver?.carModel ? (
                            <Text style={[styles.carInfoText, { color: '#9CA3AF' }]} numberOfLines={1}>
                                {driver.carModel}
                            </Text>
                        ) : null}
                    </View>
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                        {driver?.carPlate ? (
                            <View style={[styles.plateBox, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', marginBottom: vS(8) }]}>
                                <Text style={[styles.plateText, { color: appColors.text }]}>
                                    {driver.carPlate.includes(' ') ? driver.carPlate.split(' ').slice(0, 2).join(' ') + '\n' + driver.carPlate.split(' ').slice(2).join(' ') : driver.carPlate}
                                </Text>
                            </View>
                        ) : null}
                        <TouchableOpacity style={[styles.headerCallBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', marginLeft: 0 }]} onPress={handleCallDriver}>
                            <MaterialCommunityIcons name="phone" size={mS(20)} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* 3. OTP & Actions Box */}
            <View style={[styles.grayBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                {/* OTP Section */}
                <View style={styles.otpSection}>
                    <Text style={[styles.otpTitle, { color: appColors.text }]}>Share OTP with Driver</Text>
                    <View style={styles.otpBoxes}>
                        {otpDigits.map((digit, idx) => (
                            <View key={idx} style={[styles.otpBox, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                                <Text style={[styles.otpDigit, { color: appColors.text }]}>{digit}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={[styles.otpSubtitle, { color: '#9CA3AF' }]}>OTP is valid for this trip only</Text>
                </View>

                {/* Actions */}
                <View style={[styles.actionsRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleSMSDriver}>
                        <View style={[styles.actionIconWrapper, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                            <MaterialCommunityIcons name="message-text" size={mS(20)} color="#2563EB" />
                        </View>
                        <Text style={[styles.actionBtnText, { color: appColors.text }]}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleCallDriver}>
                        <View style={[styles.actionIconWrapper, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                            <MaterialCommunityIcons name="phone" size={mS(20)} color="#16A34A" />
                        </View>
                        <Text style={[styles.actionBtnText, { color: appColors.text }]}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleShareLocation}>
                        <View style={[styles.actionIconWrapper, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                            <MaterialCommunityIcons name="map-marker" size={mS(20)} color="#16A34A" />
                        </View>
                        <Text style={[styles.actionBtnText, { color: appColors.text }]}>Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleShareTrip}>
                        <View style={[styles.actionIconWrapper, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                            <MaterialCommunityIcons name="share-variant" size={mS(20)} color="#2563EB" />
                        </View>
                        <Text style={[styles.actionBtnText, { color: appColors.text }]}>Share Trip</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 4. Secure Payments Footer */}
            <View style={[styles.footerBanner, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#EFF6FF' }]}>
                <View style={[styles.shieldIconWrapper, { backgroundColor: '#2563EB' }]}>
                    <MaterialCommunityIcons name="shield-check" size={mS(18)} color="#FFFFFF" />
                </View>
                <View style={styles.footerTextContainer}>
                    <Text style={[styles.footerTitle, { color: '#1E3A8A' }]}>Secure Payments</Text>
                    <Text style={[styles.footerDesc, { color: isDark ? '#94A3B8' : '#334155' }]}>
                        Your ride is protected with safety & insurance
                    </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={mS(20)} color="#1E3A8A" />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    // Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: vS(12),
    },
    headerLeft: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(8),
        marginBottom: vS(4),
    },
    headerTitle: {
        fontSize: mS(18),
        fontWeight: '800',
    },
    statusPill: {
        paddingHorizontal: hS(8),
        paddingVertical: vS(2),
        borderRadius: mS(6),
    },
    statusPillText: {
        fontSize: mS(10),
        fontWeight: '700',
    },
    subtitleText: {
        fontSize: mS(13),
        fontWeight: '500',
    },
    headerCallBtn: {
        width: mS(36),
        height: mS(36),
        borderRadius: mS(8),
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: hS(12),
    },

    // Driver Card
    driverCard: {
        borderRadius: mS(16),
        borderWidth: 1,
        padding: mS(12),
        marginBottom: vS(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    driverCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: mS(50),
        height: mS(50),
        borderRadius: mS(25),
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
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
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(4),
    },
    driverName: {
        fontSize: mS(15),
        fontWeight: '700',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vS(2),
        marginBottom: vS(2),
    },
    ratingText: {
        fontSize: mS(12),
        fontWeight: '600',
        marginLeft: hS(2),
    },
    ridesText: {
        fontSize: mS(12),
        fontWeight: '500',
    },
    carInfoText: {
        fontSize: mS(12),
        fontWeight: '500',
    },
    plateBox: {
        borderWidth: 1,
        borderRadius: mS(8),
        paddingHorizontal: hS(10),
        paddingVertical: vS(6),
        alignItems: 'center',
    },
    plateText: {
        fontSize: mS(12),
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: vS(16),
    },

    // OTP & Actions
    grayBox: {
        borderRadius: mS(16),
        marginBottom: vS(12),
        paddingHorizontal: hS(16),
    },
    otpSection: {
        alignItems: 'center',
        paddingVertical: vS(12),
    },
    otpTitle: {
        fontSize: mS(13),
        fontWeight: '700',
        marginBottom: vS(12),
    },
    otpBoxes: {
        flexDirection: 'row',
        gap: hS(12),
        marginBottom: vS(12),
    },
    otpBox: {
        width: mS(42),
        height: mS(48),
        borderWidth: 1,
        borderRadius: mS(8),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    otpDigit: {
        fontSize: mS(22),
        fontWeight: '700',
    },
    otpSubtitle: {
        fontSize: mS(11),
        fontWeight: '500',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: vS(12),
        borderTopWidth: 1,
    },
    actionBtn: {
        alignItems: 'center',
        flex: 1,
    },
    actionIconWrapper: {
        width: mS(44),
        height: mS(44),
        borderRadius: mS(22),
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(6),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    actionBtnText: {
        fontSize: mS(11),
        fontWeight: '600',
    },

    // Footer
    footerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: mS(12),
        borderRadius: mS(16),
        marginBottom: vS(12),
    },
    shieldIconWrapper: {
        width: mS(32),
        height: mS(32),
        borderRadius: mS(16),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(12),
    },
    footerTextContainer: {
        flex: 1,
    },
    footerTitle: {
        fontSize: mS(13),
        fontWeight: '700',
        marginBottom: vS(2),
    },
    footerDesc: {
        fontSize: mS(11),
        fontWeight: '500',
    },
});

export default TrackingView;