import React, { useEffect, useRef } from "react";
import { Modal, View, TouchableWithoutFeedback, Animated, TextInput, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Button from "./Button";
import { hS, vS, mS } from "../lib/responsive";
import colorsConstant from "../constant/colors";
import { useAppTheme } from "../hooks/useAppTheme";

export default function BottomSheetInput({
    visible,
    label,
    fields,
    onChange,
    onSave,
    onClose,
    backgroundColor = "#fff"
}: {
    visible: boolean;
    label: string;
    fields: Array<{
        key: string;
        placeholder: string;
        value: string;
        icon?: string;
    }>;
    onChange: (key: string, value: string) => void;
    onSave: () => void;
    onClose: () => void;
    backgroundColor?: string;
}) {
    const { colors, isDark } = useAppTheme();
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 1 : 0,
            duration: 200,
            useNativeDriver: true
        }).start();
    }, [visible]);

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0],
    });

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            {/* Dim Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            {/* Bottom Sheet Card */}
            <Animated.View
                style={[
                    styles.sheetCard,
                    { backgroundColor: colors.card, transform: [{ translateY }] }
                ]}
            >
                {/* Drag Indicator */}
                <View style={[styles.dragIndicator, { backgroundColor: colors.border }]} />

                <Text style={[styles.sheetTitle, { color: colors.text }]}>{label}</Text>

                {fields.map((field) => (
                    <View key={field.key} style={styles.fieldSection}>
                        <Text style={[styles.fieldLabel, { color: colors.lightTextColor }]}>{field.placeholder}</Text>
                        <View style={[styles.inputCard, { backgroundColor: colors.iconBox, borderColor: colors.border, borderWidth: isDark ? 0 : 1.5 }]}>
                            {field.icon && (
                                <MaterialCommunityIcons
                                    name={field.icon}
                                    size={mS(20)}
                                    color={colors.icon}
                                    style={{ marginRight: hS(10) }}
                                />
                            )}
                            <TextInput
                                placeholder={field.placeholder}
                                placeholderTextColor={colors.secondaryText}
                                value={field.value}
                                onChangeText={(text) => onChange(field.key, text)}
                                style={[styles.textInput, { color: colors.text }]}
                                autoFocus={fields.length === 1}
                            />
                        </View>
                    </View>
                ))}

                <Button
                    onPress={onSave}
                    style={styles.saveBtn}
                >
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                </Button>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheetCard: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: hS(24),
        paddingBottom: vS(40),
        paddingTop: vS(12),
        borderTopLeftRadius: mS(32),
        borderTopRightRadius: mS(32),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    dragIndicator: {
        width: hS(40),
        height: vS(5),
        backgroundColor: "#E2E8F0",
        borderRadius: mS(10),
        alignSelf: "center",
        marginBottom: vS(24),
    },
    sheetTitle: {
        fontSize: mS(20),
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: vS(10),
    },
    fieldSection: {
        marginBottom: vS(18),
    },
    fieldLabel: {
        fontSize: mS(13),
        fontWeight: "700",
        color: "#64748B",
        marginBottom: vS(8),
        marginLeft: hS(4),
    },
    inputCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: mS(16),
        paddingHorizontal: hS(16),
        height: vS(54),
    },
    textInput: {
        flex: 1,
        fontSize: mS(16),
        fontWeight: "700",
        paddingVertical: 0,
    },
    saveBtn: {
        marginTop: vS(12),
        height: vS(60),
        borderRadius: mS(20),
        backgroundColor: colorsConstant.button,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colorsConstant.button,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    saveBtnText: {
        fontSize: mS(17),
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },
});
