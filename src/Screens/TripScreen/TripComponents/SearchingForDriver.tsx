import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
    TouchableOpacity,
    Dimensions,
    Platform,
    ToastAndroid,
    Alert,
    FlatList,
    Image,
} from 'react-native';
import { Text } from "../../../Components";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Services
import { useFindNearbyDriversMutation } from '../../../service/userApi';

// Socket & Types
import { useSocket } from '../../../Socket/SocketContext';
import { SOCKET_EVENTS } from '../../../Socket/socket.events';

// Utils
import { hS, vS, mS } from '../../../lib/responsive';
import colors from '../../../constant/colors';
import { useAppTheme } from '../../../hooks/useAppTheme';

const { width } = Dimensions.get('window');

// ==================== TYPES ====================

export interface Driver {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    current_lat: number;
    current_lng: number;
    distance_meters: number;
    rating: number;
    phone_number?: string;
    driverProfilePic?: string;
}

interface SearchDriverProps {
    tripData?: any;
    navigation?: any;
    route?: any;
}

// ==================== MAIN COMPONENT ====================

const SearchingDriver: React.FC<SearchDriverProps> = ({
    tripData: propTripData,
    navigation,
    route,
}) => {
    const { colors: appColors, isDark } = useAppTheme();
    const tripData = propTripData || route?.params;
    const { socket, isConnected, onTripAccepted } = useSocket();
    const [findNearbyDrivers] = useFindNearbyDriversMutation();

    // ==================== STATE ====================
    const [drivers, setDrivers] = useState<Driver[]>([]);

    // ✅ Reset local state when trip_id changes
    useEffect(() => {
        if (tripData?.trip_id) {
            setDrivers([]);
        }
    }, [tripData?.trip_id]);

    // ==================== ANIMATIONS ====================
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // ==================== ANIMATION SETUP ====================
    useEffect(() => {
        // Pulsing Radar Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Rotating Outer Ring
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [pulseAnim, rotateAnim]);

    // ==================== FETCH NEARBY DRIVERS ====================
    useEffect(() => {
        if (!tripData?.pickup_lat || !tripData?.pickup_lng) {
            return;
        }

        const fetchNearbyDrivers = async () => {
            try {
                const payload = {
                    lat: Number(tripData.pickup_lat),
                    lng: Number(tripData.pickup_lng),
                    newTrip: [tripData],
                };

                const response = await findNearbyDrivers(payload).unwrap();

                if (response.success) {
                    setDrivers(response.data.drivers || []);
                } else {
                }
            } catch (error) {
                Alert.alert('Nearby Drivers not Found', 'Try Again Later');
                // console.error('❌ Error fetching nearby drivers:', error);
            }
        };

        fetchNearbyDrivers();
    }, [tripData?.pickup_lat, tripData?.pickup_lng]);

    // ==================== INTERPOLATIONS ====================

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const scale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2.5],
    });

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.6, 0.3, 0],
    });

    // ==================== SUB-COMPONENTS ====================

    /**
     * Searching header with status badge
     */
    const SearchingHeader = () => (
        <>
            <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE' }]}>
                <Text style={[styles.statusBadgeText, { color: isDark ? '#60A5FA' : '#2563EB' }]}>
                    Connecting to drivers...
                </Text>
            </View>
            <View style={styles.header}>
                <Text style={[styles.title, { color: appColors.text }]}>Finding your Captain</Text>
                <Text style={[styles.subtitle, { color: appColors.secondaryText }]}>
                    Connecting you to the nearest VDrive driver...
                </Text>
            </View>
        </>
    );

    /**
     * Animated searching animation
     */
    const SearchingAnimation = () => (
        <View style={styles.animationContainer}>
            <Animated.View
                style={[styles.pulse, { transform: [{ scale }], opacity }]}
            />
            <Animated.View style={[styles.ring, { transform: [{ rotate: rotation }], borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E8F0FE' }]}>
                <MaterialCommunityIcons
                    name="dots-horizontal"
                    size={hS(280)}
                    color={appColors.primary}
                    style={styles.dots}
                />
            </Animated.View>
            <View style={[styles.iconCircle, { backgroundColor: appColors.primary, shadowColor: appColors.primary }]}>
                <MaterialCommunityIcons
                    name="car-hatchback"
                    size={hS(60)}
                    color="#FFFFFF"
                />
            </View>
        </View>
    );

    /**
     * Nearby drivers list (optional UI)
     */
    const NearbyDriversList = () => (
        <View style={[styles.listSection, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5' }]}>
            <Text style={[styles.listTitle, { color: appColors.text }]}>Available Drivers</Text>
            <FlatList
                scrollEnabled={false}
                data={drivers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.driverCard, { backgroundColor: appColors.background, borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F3F4F6' }]}>
                        <View>
                            <Text style={[styles.driverCardName, { color: appColors.text }]}>
                                {item.full_name}
                            </Text>
                            <Text style={[styles.driverCardDetails, { color: appColors.secondaryText }]}>
                                ⭐ {item.rating} • {item.distance_meters}m
                                away
                            </Text>
                        </View>
                        <Text style={styles.carEmoji}>🚗</Text>
                    </View>
                )}
            />
        </View>
    );

    /**
     * Safety info footer
     */
    const SafetyFooter = () => (
        <View style={styles.footer}>
            <View style={styles.infoRow}>
                <MaterialCommunityIcons
                    name="shield-check"
                    size={hS(20)}
                    color="#29AE46"
                />
                <Text style={styles.infoText}>
                    Your safety is our priority
                </Text>
            </View>
        </View>
    );

    // ==================== RENDER ====================

    return (
        <View style={styles.container}>
            <SearchingHeader />
            <SearchingAnimation />
            <SafetyFooter />
        </View>
    );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: vS(20),
        paddingBottom: vS(20),
        paddingHorizontal: hS(20),
    },

    // Header
    statusBadge: {
        backgroundColor: '#DBEAFE',
        padding: mS(8),
        borderRadius: mS(8),
        alignSelf: 'flex-start',
        marginBottom: vS(10),
    },
    statusBadgeText: {
        color: '#2563EB',
        fontSize: mS(12),
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: hS(20),
        marginBottom: vS(20),
    },
    title: {
        fontSize: mS(24),
        fontWeight: 'bold',
        color: '#152D5E',
        textAlign: 'center',
        marginBottom: vS(10),
    },
    subtitle: {
        fontSize: mS(14),
        color: '#687487',
        textAlign: 'center',
    },

    // Animation
    animationContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: vS(300),
        width: hS(300),
        marginVertical: vS(40),
    },
    pulse: {
        position: 'absolute',
        width: hS(120),
        height: hS(120),
        borderRadius: hS(60),
        backgroundColor: colors.button,
    },
    ring: {
        position: 'absolute',
        width: hS(280),
        height: hS(280),
        borderRadius: hS(140),
        borderWidth: 2,
        borderColor: '#E8F0FE',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: hS(100),
        height: hS(100),
        borderRadius: hS(50),
        backgroundColor: colors.button,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: colors.button,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    dots: {
        opacity: 0.2,
    },

    // Footer
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: mS(14),
        color: '#687487',
        marginLeft: hS(8),
    },

    // Driver Assigned Content
    content: {
        width: '100%',
        gap: vS(15),
    },
    arrivalBadge: {
        backgroundColor: '#FEF3C7',
        padding: mS(8),
        borderRadius: mS(10),
        alignItems: 'center',
        marginBottom: vS(12),
    },
    arrivalBadgeText: {
        color: '#92400E',
        fontSize: mS(11),
        fontWeight: '800',
    },

    driverProfileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#F9FAFB',
        padding: mS(10),
        borderRadius: mS(20),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    avatar: {
        width: mS(50),
        height: mS(50),
        borderRadius: mS(27),
        backgroundColor: '#E5E7EB',
    },
    driverInfo: {
        flex: 1,
        marginLeft: hS(10),
    },
    driverName: {
        fontSize: mS(16),
        fontWeight: 'bold',
        color: '#111827',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vS(2),
    },
    ratingText: {
        color: '#4B5563',
        fontSize: mS(13),
        marginLeft: hS(4),
    },

    actionGroup: {
        flexDirection: 'row',
        gap: hS(10),
        marginVertical: vS(10),
    },
    actionBtn: {
        height: mS(45),
        borderRadius: mS(12),
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
        gap: hS(8),
    },
    actionBtnText: {
        fontSize: mS(14),
        fontWeight: '600',
        color: '#111827',
    },

    startBtn: {
        width: '100%',
        height: vS(50),
        borderRadius: mS(12),
        backgroundColor: '#32a852',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: vS(10),
    },
    startBtnText: {
        color: '#FFF',
        fontSize: mS(16),
        fontWeight: 'bold',
    },

    // Drivers List
    listSection: {
        width: '100%',
        marginTop: vS(20),
    },
    listTitle: {
        fontSize: mS(16),
        fontWeight: 'bold',
        marginBottom: vS(10),
        color: '#111827',
    },
    driverCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: mS(15),
        marginBottom: vS(10),
        backgroundColor: '#f9f9f9',
        borderRadius: mS(10),
        alignItems: 'center',
    },
    driverCardName: {
        fontSize: mS(16),
        fontWeight: '600',
        color: '#111827',
    },
    driverCardDetails: {
        color: '#666',
        marginTop: vS(4),
        fontSize: mS(13),
    },
    carEmoji: {
        fontSize: mS(24),
    },
});

export default SearchingDriver;