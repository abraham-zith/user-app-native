import React, { ReactNode, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, LayoutChangeEvent } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { hS, mS, vS } from '../lib/responsive';

interface SwipeButtonProps {
    onSwipeSuccess: () => void;
    title?: string;
    Icon: ReactNode;
    railColor?: string;
    thumbColor?: string;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
}

const SwipeButton: React.FC<SwipeButtonProps> = ({
    onSwipeSuccess,
    title = "Get Started",
    Icon,
    railColor = '#000',
    thumbColor = '#fff',
    containerStyle,
    textStyle,
}) => {
    // 1. Dynamic Width Handling
    const [dimensions, setDimensions] = useState({ width: 0 });
    const translateX = useSharedValue<number>(0);
    const contextX = useSharedValue<number>(0);

    const THUMB_SIZE = 63;
    const PADDING = 7;

    // We calculate the range based on measured width minus padding and thumb size
    const SWIPE_RANGE = dimensions.width - THUMB_SIZE - (PADDING * 2);

    const onLayout = (event: LayoutChangeEvent) => {
        setDimensions({
            width: event.nativeEvent.layout.width,
        });
    };

    const panGesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
        })
        .onUpdate((event) => {
            // Only allow swiping if we have measured the width
            if (SWIPE_RANGE <= 0) return;

            let nextValue = event.translationX + contextX.value;
            translateX.value = Math.min(Math.max(nextValue, 0), SWIPE_RANGE);
        })
        .onEnd(() => {
            if (translateX.value > SWIPE_RANGE * 0.75) {
                translateX.value = withSpring(SWIPE_RANGE, { overshootClamping: true });
                runOnJS(onSwipeSuccess)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const animatedThumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const animatedTextStyle = useAnimatedStyle(() => {
        // Avoid division by zero if width isn't measured yet
        const opacityRange = SWIPE_RANGE > 0 ? SWIPE_RANGE * 0.6 : 1;
        return {
            opacity: interpolate(
                translateX.value,
                [0, opacityRange],
                [1, 0],
                Extrapolation.CLAMP
            ),
        };
    });

    return (
        <View
            onLayout={onLayout}
            style={[styles.container, { backgroundColor: railColor }, containerStyle]}
        >
            <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                <Text style={[styles.title, textStyle]}>{title}</Text>
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.thumb, { backgroundColor: thumbColor }, animatedThumbStyle]}>
                    {Icon}
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: vS(77),
        borderRadius: mS(50),
        padding: mS(7),
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100%', // Default to full width of parent
    },
    thumb: {
        height: vS(63),
        width: hS(63),
        borderRadius: mS(50),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: mS(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: vS(2) },
        shadowOpacity: 0.2,
        shadowRadius: mS(2),
    },
    textContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: mS(16),
        fontWeight: '600',
    }
});

export default SwipeButton;