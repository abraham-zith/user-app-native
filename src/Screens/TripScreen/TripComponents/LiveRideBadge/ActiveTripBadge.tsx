import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../../../redux/store';
import colors from '../../../../constant/colors';
import { Text } from '../../../../Components';
import { hS, vS, mS } from '../../../../lib/responsive';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';

export const ActiveTripBadge = () => {
    const navigation = useNavigation<any>();
    const localuser = useSelector((state: RootState) => state.userSlice.user);

    // Use Redux state for immediate updates (including optimistic ones)
    const activeTrips = useSelector((state: RootState) => state.tripSlice.activeTrips);

    const [isExpanded, setIsExpanded] = useState(false);
    // console.log(activeTrips, "activeTrips");
    const pulseScale = useSharedValue(1);
    const expansion = useSharedValue(0); // 0 = Icon, 1 = Expanded

    const COLLAPSED_WIDTH = mS(40);
    const EXPANDED_WIDTH = mS(180);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    useEffect(() => {
        expansion.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
    }, [isExpanded]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        width: interpolate(expansion.value, [0, 1], [COLLAPSED_WIDTH, EXPANDED_WIDTH], Extrapolate.CLAMP),
    }));

    const textOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(expansion.value, [0.7, 1], [0, 1], Extrapolate.CLAMP),
        transform: [{ translateX: interpolate(expansion.value, [0, 1], [-10, 0]) }]
    }));

    if (activeTrips.length === 0) return null;

    const handlePress = () => {
        navigation.navigate('OngoingTripsList');
    };

    return (
        <Animated.View style={[styles.badgeWrapper, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.pill}
                onPress={handlePress}
            >
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="car-multiple" size={mS(14)} color="white" />
                    {!isExpanded && activeTrips.length > 0 && (
                        <View style={styles.miniBadge}>
                            <Text style={styles.miniBadgeText}>{activeTrips.length}</Text>
                        </View>
                    )}
                </View>

                {isExpanded && (
                    <Animated.View style={[styles.textContainer, textOpacityStyle]}>
                        <Text style={styles.pillText} numberOfLines={1}>
                            {activeTrips.length} Ongoing {activeTrips.length > 1 ? 'Trips' : 'Trip'}
                        </Text>
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    </Animated.View>
                )}

                {isExpanded && (
                    <Animated.View style={textOpacityStyle}>
                        <MaterialCommunityIcons name="chevron-right" size={mS(18)} color="rgba(255,255,255,0.5)" />
                    </Animated.View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    badgeWrapper: {
        overflow: 'visible',
        height: mS(40),
        borderRadius: mS(20),
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    pill: {
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        paddingHorizontal: hS(6),
        overflow: 'visible',
    },
    iconCircle: {
        backgroundColor: colors.button || '#3B82F6',
        width: mS(28),
        height: mS(28),
        borderRadius: mS(14),
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    textContainer: {
        flex: 1,
        marginLeft: hS(10),
        marginRight: hS(5),
    },
    pillText: {
        color: 'white',
        fontWeight: '800',
        fontSize: mS(12),
        letterSpacing: 0.3,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vS(1),
    },
    liveDot: {
        width: mS(4),
        height: mS(4),
        borderRadius: mS(2),
        backgroundColor: '#10B981',
        marginRight: hS(4),
    },
    liveText: {
        color: '#10B981',
        fontSize: mS(8),
        fontWeight: '900',
        letterSpacing: 1,
    },
    miniBadge: {
        position: 'absolute',
        top: -mS(5),
        right: -mS(5),
        backgroundColor: '#EF4444', // Vibrant Red
        minWidth: mS(16),
        height: mS(16),
        borderRadius: mS(8),
        paddingHorizontal: mS(4),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 10,
    },
    miniBadgeText: {
        color: 'white',
        fontSize: mS(8),
        fontWeight: '900', // Extra bold for that notification feel
    },
});