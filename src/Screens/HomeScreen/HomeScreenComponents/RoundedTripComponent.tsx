import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RoundWayImage } from '../../../assets/svg';
import fonts from "../../../constant/fonts";
import { useAppTheme } from "../../../hooks/useAppTheme";
// Import your responsive utilities
import { hS, vS, mS } from '../../../lib/responsive';

export function RoundedTrip() {
    const { colors: appColors, isDark } = useAppTheme();
    return (
        <View style={style.container}>
            <Text style={[fonts.bold, style.title, { color: appColors.text }]}>
                Recent Round Trip
            </Text>

            <View style={style.imageWrapper}>
                <RoundWayImage
                    width={'100%'}
                    height={vS(142)}
                />
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        width: '100%',
        // Use minHeight to allow content to expand if needed
        minHeight: vS(165),
        rowGap: vS(9),
        // Centers the component within the parent's padding
        alignSelf: 'center',
    },
    title: {
        fontSize: mS(13),
        fontWeight: '700',
        lineHeight: vS(16),
        paddingHorizontal: hS(20),
        color: '#1E293B',
    },
    imageWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }
});