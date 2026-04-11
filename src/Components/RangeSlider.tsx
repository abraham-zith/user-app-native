import React, { useState, useRef } from "react"
import { PanResponder, View } from "react-native";
import Text from "./Text";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Animated } from "react-native";



interface SliderProps {
    minValue?: number;
    maxValue?: number;
    setValue?: (value: number) => void;
    width?: number;
    containerHeight?: number;
    height?: number;
    activeColor?: string;
    inactiveColor?: string;
    stepValues?: string[];
    onChange?: (value: string) => void;
}

const RangeSlider: React.FC<SliderProps> = ({
    minValue = 0,
    maxValue = 100,
    setValue = () => { },
    width = 300,
    containerHeight = 40,
    height = 10,
    activeColor = '#152D5E',
    inactiveColor = '#E8E8EF',
    stepValues = [" ", "12h", "16h", "20h", "1 day", "2 days", "3 days"],
    onChange = () => { }
}) => {


    const [value, setSliderValue] = useState<number>(minValue);
    const sliderPosition = useRef(new Animated.ValueXY()).current;

    const initialX = useRef(0);

    const thumbWidth = 25;
    const maxPosition = width - thumbWidth;
    const stepCount = stepValues.length;
    const stepWidth = maxPosition / (stepValues.length - 1);


    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                initialX.current = (sliderPosition.x as any)._value ?? 0;
            },
            onPanResponderMove(e, gestureState) {
                let newX = initialX.current + gestureState.dx;

                if (newX < 0) newX = 0;
                if (newX > maxPosition) newX = maxPosition;

                const stepIndex = Math.round(newX / stepWidth);
                const snappedX = stepIndex * stepWidth;

                sliderPosition.setValue({ x: newX, y: 0 });

                // const range = maxValue - minValue;
                // const newValue = parseFloat(
                //     ((newX / maxPosition) * range + minValue).toFixed(2)
                // );
                // setValue(newValue);
                // setSliderValue(newValue);

                // setValue(stepValues[stepIndex]);
                // onChange(stepValues[stepIndex]);

            },
            onPanResponderRelease: () => {
                const current = (sliderPosition as any)._value;
                const nearestIndex = Math.round(current / stepWidth);
                const snapX = nearestIndex * stepWidth;

                Animated.spring(sliderPosition, {
                    toValue: snapX,
                    useNativeDriver: false,
                }).start();

                setSliderValue(nearestIndex);
                onChange(stepValues[nearestIndex]);

            }
        })
    ).current;
    return (

        <GestureHandlerRootView style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <View style={{
                width,
                height: containerHeight,
                justifyContent: 'center'
            }}>
                {/* inactive track */}
                <View style={{
                    height,
                    backgroundColor: inactiveColor,
                    position: 'absolute',
                    width: '100%',
                    borderRadius: 10
                }}>

                </View>
                <Animated.View style={{
                    height,
                    backgroundColor: activeColor,
                    position: 'absolute',
                    width: sliderPosition.x.interpolate({
                        inputRange: [0, maxPosition],
                        outputRange: [0, width],
                        extrapolate: 'clamp'
                    }),
                    borderRadius: 10
                }} />


                {/* Thumb */}
                <Animated.View
                    style={{
                        backgroundColor: activeColor,
                        position: 'absolute',
                        width: thumbWidth,
                        height: thumbWidth,
                        borderRadius: 20,
                        borderWidth: 3,
                        borderColor: inactiveColor,
                        left: value === maxValue ? 0 : -2,
                        transform: [{ translateX: sliderPosition.x }],


                    }}
                    {...panResponder.panHandlers}
                >

                </Animated.View>

            </View>
            {/* Dots + Labels */}
            <View
                style={{
                    width,
                    position: 'absolute',
                    marginTop: 25,
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                {stepValues.map((label, index) => {
                    const isActive = index <= value;

                    return (
                        <View key={index} style={{ alignItems: "center" }}>
                            {/* Dot */}
                            <View
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: isActive ? activeColor : "#C7C7D3",
                                    marginBottom: 8,
                                }}
                            />

                            {/* Label */}
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: isActive ? activeColor : "#777",
                                }}
                            >
                                {label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </GestureHandlerRootView>
    )

}


export default RangeSlider;
