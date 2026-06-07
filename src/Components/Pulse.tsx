import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useOptimization } from '../context/OptimizationContext';

const Pulse = () => {
    const { shouldThrottle } = useOptimization();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (shouldThrottle) return;
        // Create a looping animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2, // Scale up to 120%
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1, // Scale back to 100%
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shouldThrottle]);

    return (
        <View style={styles.container}>
            {/* The Outer Pulse Circle */}
            <Animated.View
                style={[
                    styles.pulseCircle,
                    { transform: [{ scale: pulseAnim }], opacity: 0.3 }
                ]}
            />
            {/* The Solid Inner Dot */}
            <View style={styles.innerDot} />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8, // Space between pulse and text
    },
    pulseCircle: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981', // Match your "Start Ride" green
    },
    innerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    arrivalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center', // Centers the badge horizontally
        backgroundColor: '#FFFFFF', // Clean white background
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 25,
        // marginTop: 10,
        // Elevation for Android
        elevation: 4,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    // arrivalBadge: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     backgroundColor: '#F0FDF4',
    //     paddingHorizontal: 12,
    //     paddingVertical: 6,
    //     borderRadius: 20,
    // }
});


export default Pulse;