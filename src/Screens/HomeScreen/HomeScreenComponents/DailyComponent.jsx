import React from "react";
import { View, StyleSheet } from "react-native";
import { DailyComponentImage } from '../../../assets/svg';
import { Styles } from "../../../lib/styles";
import fonts from "../../../constant/fonts";
import Button from "../../../Components/Button";
import Text from '../../../Components/Text';
import { useAppTheme } from "../../../hooks/useAppTheme";

// Import your responsive utilities
import { hS, vS, mS } from '../../../lib/responsive';

export function DailyComponent() {
    const { colors: appColors, isDark } = useAppTheme();
    return (
        <View style={style.container}>
            <View style={[style.cardContainer, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
                {/* Left Column: Text & Button */}
                <View style={style.textColumn}>
                    <Text style={[fonts.bold, style.title, { color: appColors.text }]}>
                        Get Schedule Drivers
                    </Text>

                    <Text style={[fonts.light, style.description, { color: appColors.secondaryText }]}>
                        Hire the drivers who speaks your languages for up to week & we ‘ll make it happen
                    </Text>

                    <Button style={style.reserveBtn}>
                        <Text style={[fonts.regular, style.btnText]}>
                            Reserve Now
                        </Text>
                    </Button>
                </View>

                {/* Right Column: Image */}
                <DailyComponentImage width={hS(100)} height={vS(100)} />
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
        alignItems: 'center',
        // Centers the component within the parent's padding
        alignSelf: 'center',
    },
    cardContainer: {
        flexDirection: 'row',
        width: '90%', // Use percentage to fit the parent white sheet
        minHeight: vS(128),
        backgroundColor: '#F4F4F4',
        borderWidth: 0.8,
        borderColor: '#E5E5E5',
        borderRadius: mS(20),
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: hS(15), // Replaces 'left: 15' for internal spacing
        alignSelf: 'center',
    },
    textColumn: {
        width: '60%', // Take up 60% of the card width
        justifyContent: 'center',
    },
    title: {
        fontSize: mS(15),
        fontWeight: '700',
        lineHeight: vS(21),
        color: '#000000',
    },
    description: {
        fontSize: mS(10),
        fontWeight: '300',
        lineHeight: vS(13),
        color: '#000000',
        marginVertical: vS(4),
    },
    reserveBtn: {
        width: hS(120),
        height: vS(32),
        borderRadius: mS(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: vS(5),
    },
    btnText: {
        fontSize: mS(10),
        fontWeight: '400',
        color: '#FFFFFF',
    }
});