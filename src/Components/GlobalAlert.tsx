import React, { useEffect, useState, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    AlertButton,
    Platform
} from 'react-native';
import GlobalAlertManager from '../utils/GlobalAlertManager';
import { useAppTheme } from '../hooks/useAppTheme';
import { mS, vS, hS } from '../lib/responsive';

const { width } = Dimensions.get('window');

const GlobalAlert = () => {
    const { colors, isDark } = useAppTheme();
    const [visible, setVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        title: string;
        message?: string;
        buttons?: AlertButton[];
        options?: any;
    } | null>(null);

    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        GlobalAlertManager.setListener((title, message, buttons, options) => {
            setAlertConfig({ title, message, buttons, options });
            setVisible(true);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    tension: 60,
                    useNativeDriver: true,
                }),
            ]).start();
        });

        return () => {
            GlobalAlertManager.removeListener();
        };
    }, []);

    const closeAlert = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
            setAlertConfig(null);
            if (callback) callback();
            if (alertConfig?.options?.onDismiss) {
                alertConfig.options.onDismiss();
            }
        });
    };

    const handleButtonPress = (button: AlertButton) => {
        closeAlert(button.onPress);
    };

    const handleBackdropPress = () => {
        if (alertConfig?.options?.cancelable !== false) {
            closeAlert();
        }
    };

    if (!visible || !alertConfig) return null;

    // Default button if none provided
    const buttons = alertConfig.buttons && alertConfig.buttons.length > 0
        ? alertConfig.buttons
        : [{ text: 'OK' }];

    // Sort buttons: cancel on left/bottom, default/destructive on right/top depending on layout
    // Usually iOS has horizontal buttons for <= 2.
    const isHorizontal = buttons.length <= 2;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={handleBackdropPress}>
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <Animated.View
                            style={[
                                styles.alertContainer,
                                {
                                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        >
                            <View style={styles.contentContainer}>
                                <Text style={[styles.title, { color: colors.text }]}>{alertConfig.title}</Text>
                                {!!alertConfig.message && (
                                    <Text style={[styles.message, { color: isDark ? '#94A3B8' : '#475569' }]}>
                                        {alertConfig.message}
                                    </Text>
                                )}
                            </View>

                            <View style={[styles.buttonsContainer, !isHorizontal && styles.buttonsVertical, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' }]}>
                                {buttons.map((btn, index) => {
                                    const isCancel = btn.style === 'cancel';
                                    const isDestructive = btn.style === 'destructive';
                                    
                                    // Premium button styling
                                    const textColor = isDestructive 
                                        ? '#EF4444' 
                                        : isCancel 
                                            ? (isDark ? '#94A3B8' : '#64748B')
                                            : colors.button; // Uses app theme button color
                                            
                                    const fontWeight = isCancel ? '600' : '800';

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            activeOpacity={0.7}
                                            onPress={() => handleButtonPress(btn)}
                                            style={[
                                                styles.button,
                                                isHorizontal && { flex: 1 },
                                                isHorizontal && index > 0 && {
                                                    borderLeftWidth: 1,
                                                    borderLeftColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9'
                                                },
                                                !isHorizontal && index > 0 && {
                                                    borderTopWidth: 1,
                                                    borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9'
                                                }
                                            ]}
                                        >
                                            <Text style={[styles.buttonText, { color: textColor, fontWeight }]}>
                                                {btn.text || 'OK'}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: width * 0.82,
        borderRadius: mS(24),
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    contentContainer: {
        paddingTop: vS(24),
        paddingBottom: vS(20),
        paddingHorizontal: hS(24),
        alignItems: 'center',
    },
    title: {
        fontSize: mS(18),
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: vS(8),
        letterSpacing: 0.2,
    },
    message: {
        fontSize: mS(14),
        textAlign: 'center',
        lineHeight: vS(20),
        fontWeight: '500',
    },
    buttonsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
    },
    buttonsVertical: {
        flexDirection: 'column',
    },
    button: {
        paddingVertical: vS(16),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontSize: mS(16),
        letterSpacing: 0.3,
    },
});

export default GlobalAlert;
