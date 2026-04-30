import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../../redux/store';
import { clearSuspensionData } from '../../redux/userSlice';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Styles } from '../../lib/styles';

const SuspensionScreen = () => {
    const { colors: appColors } = useAppTheme();
    const dispatch = useDispatch();
    const suspensionData = useSelector((state: RootState) => state.userSlice.suspensionData);

    const handleLogout = () => {
        dispatch(clearSuspensionData());
    };

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@vdrive.com');
    };

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: appColors.error + '20' }]}>
                    <MaterialCommunityIcons 
                        name={suspensionData?.status === 'blocked' ? "account-off" : "account-clock"} 
                        size={80} 
                        color={appColors.error} 
                    />
                </View>

                <Text style={[styles.title, { color: appColors.text }]}>
                    Account {suspensionData?.status === 'blocked' ? 'Blocked' : 'Suspended'}
                </Text>

                <Text style={[styles.subtitle, { color: appColors.text + '80' }]}>
                    Your account has been restricted by the administrator.
                </Text>

                <View style={[styles.reasonCard, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
                    <Text style={[styles.reasonLabel, { color: appColors.text + '50' }]}>REASON</Text>
                    <Text style={[styles.reasonText, { color: appColors.text }]}>
                        {suspensionData?.reason || 'No specific reason provided.'}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={[styles.supportButton, { backgroundColor: appColors.primary }]}
                    onPress={handleContactSupport}
                >
                    <Text style={styles.supportButtonText}>Contact Support</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={[styles.logoutButtonText, { color: appColors.text + '50' }]}>
                        Back to Login
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    reasonCard: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 40,
    },
    reasonLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    reasonText: {
        fontSize: 16,
        lineHeight: 24,
    },
    supportButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    supportButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 12,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SuspensionScreen;
