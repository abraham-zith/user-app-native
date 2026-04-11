import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence
} from 'react-native-reanimated';
import { useAppTheme } from '../hooks/useAppTheme';

const Skeleton = ({ width, height, borderRadius = 8, style }: any) => {
    const { isDark } = useAppTheme();
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        // Create a smooth pulsing loop
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.4, { duration: 800 })
            ),
            -1, // Loop forever
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                { width, height, borderRadius, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0' },
                animatedStyle,
                style
            ]}
        />
    );
};

export default Skeleton;