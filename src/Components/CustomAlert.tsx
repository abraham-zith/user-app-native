import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constant/colors';
import { useAppTheme } from '../hooks/useAppTheme';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    type?: 'danger' | 'info';
}

const CustomAlert = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    type = 'info'
}: CustomAlertProps) => {
    const { colors: appColors, isDark } = useAppTheme();
    return (
        <Modal statusBarTranslucent navigationBarTranslucent transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <View style={{
                    width: '85%',
                    backgroundColor: appColors.card,
                    borderRadius: 20,
                    padding: 25,
                    alignItems: 'center',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    borderWidth: isDark ? 1 : 0,
                    borderColor: appColors.border
                }}>
                    {/* Icon Section */}
                    <View style={{
                        width: 60, height: 60, borderRadius: 30,
                        backgroundColor: type === 'danger' ? (isDark ? 'rgba(239, 68, 68, 0.1)' : '#FFE5E5') : (isDark ? 'rgba(37, 99, 235, 0.1)' : '#E5F1FF'),
                        justifyContent: 'center', alignItems: 'center', marginBottom: 15
                    }}>
                        <MaterialCommunityIcons
                            name={type === 'danger' ? "alert-outline" : "information-outline"}
                            size={30}
                            color={type === 'danger' ? "#FF4444" : colors.button}
                        />
                    </View>

                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: appColors.text, marginBottom: 10 }}>
                        {title}
                    </Text>
                    <Text style={{ fontSize: 14, color: appColors.secondaryText, textAlign: 'center', marginBottom: 20, lineHeight: 20 }}>
                        {message}
                    </Text>

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
                        <TouchableOpacity
                            onPress={onCancel}
                            style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}
                        >
                            <Text style={{ color: appColors.secondaryText, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            style={{
                                flex: 2,
                                backgroundColor: type === 'danger' ? '#FF4444' : appColors.button,
                                borderRadius: 12,
                                paddingVertical: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: '700' }}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;