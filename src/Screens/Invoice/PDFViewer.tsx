import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, PermissionsAndroid, Platform, Alert } from "react-native";
import Pdf from "react-native-pdf";
import RNBlob from "react-native-blob-util";
import Ionicons from "react-native-vector-icons/Ionicons";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import colors from "../../constant/colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { Styles } from "../../lib/styles";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from "../../hooks/useAppTheme";


interface Props {
    route: any;
    navigation: any;
}

export default function PDFViewerScreen({ route, navigation }: Props) {
    const { base64 } = route.params;

    const insets = useSafeAreaInsets();
    const { isDark, colors: themeColors } = useAppTheme();

    const savePDF = async () => {
        try {
            const fileName = `Invoice_${Date.now()}.pdf`;
            const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

            // Write the file to storage
            await RNFS.writeFile(filePath, base64, "base64");

            // Must use file:// prefix for Share
            const fileUri = "file://" + filePath;

            await Share.open({
                title: "Share Invoice",
                url: fileUri,
                type: "application/pdf",
                filename: fileName,
                saveToFiles: true,
            });
        } catch (error) {
        }
    };

    return (
        <View style={[Styles.flex, {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: themeColors.background
        }]}>

            {/* Header */}
            <View style={[styles.header, {
                backgroundColor: themeColors.background,
                borderBottomColor: themeColors.border
            }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>Invoice</Text>
                <TouchableOpacity onPress={savePDF} style={[Styles.flexRow]}>
                    <Text style={[styles.btnText, { color: themeColors.primary }]}>PDF</Text>
                    <MaterialCommunityIcons
                        name="download-circle"
                        color={themeColors.primary}
                        size={20}
                    />
                </TouchableOpacity>
            </View>

            <Pdf
                source={{ uri: `data:application/pdf;base64,${base64}` }}
                style={{ flex: 1, backgroundColor: themeColors.background }}
                trustAllCerts={false}
                enablePaging={false}
                horizontal={false}        // Vertical scrolling
                scale={1.0}
                spacing={0}
                minScale={1}
                maxScale={3}
                fitPolicy={2}             // 0 = FIT_WIDTH  (best for mobile)
                onLoadComplete={(pages) => {
                }}
                onError={(error) => {
                }}
            />

            {/* Download Button */}

        </View>
    );
}

const styles = StyleSheet.create({
    downloadBtn: {
        backgroundColor: colors.button,
        padding: 15,
        alignItems: "center",
    },
    btnText: {
        fontSize: 14,
        fontWeight: "600"
    },
    header: {
        height: 55,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        justifyContent: "space-between",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
});
