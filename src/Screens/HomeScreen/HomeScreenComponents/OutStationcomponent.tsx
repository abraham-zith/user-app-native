import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { OutStationImage } from '../../../assets/svg';
import { Styles } from "../../../lib/styles";
import fonts from "../../../constant/fonts";
import { useAppTheme } from "../../../hooks/useAppTheme";

// Import your responsive utilities
import { hS, vS, mS } from '../../../lib/responsive';

export function OutstationComponent() {
    const { colors: appColors, isDark } = useAppTheme();
    return (
        <View style={style.container}>
            <Text style={[fonts.bold, style.title, { color: appColors.text }]}>
                Recent Outside Station
            </Text>

            <View style={style.imageWrapper}>
                <OutStationImage
                    width={'100%'}
                    height={vS(142)}
                />
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        // Use percentage width or scale for full responsiveness
        width: '100%',
        // verticalScale for height ensures rhythm is kept
        minHeight: vS(165),
        // gap between text and image
        rowGap: vS(9),
        // Center the component horizontally within its parent
        alignSelf: 'center',
    },
    title: {
        // mS (Moderate Scale) is best for font sizes
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