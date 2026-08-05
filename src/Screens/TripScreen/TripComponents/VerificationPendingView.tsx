import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Text } from '../../../Components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { hS, vS, mS } from '../../../lib/responsive';
import { useAppTheme } from '../../../hooks/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VerificationPendingViewProps {
    driver: any;
    trip: any;
}

const VerificationPendingView: React.FC<VerificationPendingViewProps> = ({ driver, trip }) => {
    const { colors: appColors, isDark } = useAppTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={[styles.card, { backgroundColor: isDark ? appColors.iconBox : appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(37, 99, 235, 0.1)' }]}>
                    <MaterialCommunityIcons name="shield-sync" size={mS(48)} color={appColors.primary} />
                </View>
                
                <Text style={[styles.title, { color: appColors.text }]}>Verification Pending</Text>
                <Text style={[styles.subtitle, { color: appColors.secondaryText }]}>
                    Please wait while your ride is being verified. This usually takes just a moment.
                </Text>
                
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={appColors.primary} />
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        paddingHorizontal: hS(16),
        paddingBottom: vS(30),
        paddingTop: vS(10),
    },
    card: {
        borderRadius: mS(24),
        padding: mS(24),
        alignItems: 'center',
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    iconContainer: {
        width: mS(80),
        height: mS(80),
        borderRadius: mS(40),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(16),
    },
    title: {
        fontSize: mS(20),
        fontWeight: '700',
        marginBottom: vS(8),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: mS(14),
        textAlign: 'center',
        lineHeight: vS(20),
        marginBottom: vS(24),
        paddingHorizontal: hS(10),
    },
    loadingContainer: {
        height: mS(40),
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default VerificationPendingView;
