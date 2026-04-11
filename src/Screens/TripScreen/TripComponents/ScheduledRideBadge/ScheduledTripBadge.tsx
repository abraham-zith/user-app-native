import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useGetActiveTripbyUserIdQuery } from '../../../../service/userApi';
import { RootState } from '../../../../redux/store';
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

export const ScheduledTripBadge = () => {
    const navigation = useNavigation<any>();
    const localuser = useSelector((state: RootState) => state.userSlice.user);

    // Use RTK Query instead of manual tripSlice selector
    const { data: tripData } = useGetActiveTripbyUserIdQuery(localuser?.id, {
        skip: !localuser?.id,
    });

    const scheduledTrips = tripData?.data?.scheduledTrips || [];
    const [isExpanded, setIsExpanded] = useState(false);

    const translateY = useSharedValue(0);
    const expansion = useSharedValue(0);

    const COLLAPSED_WIDTH = mS(48);
    const EXPANDED_WIDTH = mS(180);

    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-4, { duration: 1500 }),
                withTiming(0, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    useEffect(() => {
        expansion.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
    }, [isExpanded]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        width: interpolate(expansion.value, [0, 1], [COLLAPSED_WIDTH, EXPANDED_WIDTH], Extrapolate.CLAMP),
    }));

    const textOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(expansion.value, [0.7, 1], [0, 1], Extrapolate.CLAMP),
        transform: [{ translateX: interpolate(expansion.value, [0, 1], [-10, 0]) }]
    }));

    if (scheduledTrips.length === 0) return null;

    const handlePress = () => {
        if (!isExpanded) {
            setIsExpanded(true);
            setTimeout(() => setIsExpanded(false), 5000);
        } else {
            navigation.navigate('ScheduledTripsList');
        }
    };

    return (
        <Animated.View style={[styles.badgeWrapper, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.pill}
                onPress={handlePress}
            >
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="calendar-clock" size={mS(18)} color="white" />
                    {!isExpanded && scheduledTrips.length > 0 && (
                        <View style={styles.miniBadge}>
                            <Text style={styles.miniBadgeText}>{scheduledTrips.length}</Text>
                        </View>
                    )}
                </View>
                
                {isExpanded && (
                    <Animated.View style={[styles.textContainer, textOpacityStyle]}>
                        <Text style={styles.pillText} numberOfLines={1}>
                            {scheduledTrips.length} Scheduled
                        </Text>
                        <Text style={styles.subText}>Ready</Text>
                    </Animated.View>
                )}

                {isExpanded && (
                    <Animated.View style={textOpacityStyle}>
                        <MaterialCommunityIcons name="chevron-right" size={mS(18)} color="rgba(255,255,255,0.4)" />
                    </Animated.View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    badgeWrapper: {
        overflow: 'visible',
        height: mS(48),
        borderRadius: mS(12),
        backgroundColor: 'rgba(30, 27, 75, 0.95)',
        borderWidth: 1.5,
        borderColor: 'rgba(129, 140, 248, 0.2)',
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
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
        backgroundColor: '#6366F1',
        width: mS(36),
        height: mS(36),
        borderRadius: mS(8),
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
        letterSpacing: 0.2,
    },
    subText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: mS(9),
        fontWeight: '500',
        marginTop: vS(1),
    },
    miniBadge: {
        position: 'absolute',
        top: -mS(5),
        right: -mS(5),
        backgroundColor: '#EF4444',
        minWidth: mS(18),
        height: mS(18),
        borderRadius: mS(9),
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
        fontSize: mS(9),
        fontWeight: '900',
    },
});