import React, { useState, useEffect } from 'react';
import {
    StyleSheet, View, Text, ScrollView, Switch,
    StatusBar, ActivityIndicator, Alert,
    Platform,
    AppState, AppStateStatus
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../../../../constant/colors';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../redux/store';
import { useGetUserQuery, useUpdateUserMutation } from '../../../../../service/userApi';
import { updateUserStore } from '../../../../../redux/userSlice';
import {
    checkNotifications,
    requestNotifications,
    RESULTS,
    openSettings
} from 'react-native-permissions';
import { hS, mS, vS } from '../../../../../lib/responsive';
import { useAppTheme } from "../../../../../hooks/useAppTheme";
type PreferenceKey = 'invoice_email' | 'promo_email' | 'whatsapp_updates' | 'push_notifications' | 'sms_alerts';

type SettingsPreference = {
    invoice_email: boolean,
    promo_email: boolean,
    whatsapp_updates: boolean,
    push_notifications: boolean,
    sms_alerts: boolean,
}
const initialSettingsPreference = {
    invoice_email: false,
    promo_email: false,
    whatsapp_updates: false,
    push_notifications: false,
    sms_alerts: false,
}
const Preferences = () => {
    const { data: userData, isLoading } = useGetUserQuery()
    const insets = useSafeAreaInsets();
    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const dispatch = useDispatch()
    const [updateUser] = useUpdateUserMutation();
    const [loading, setLoading] = useState(false);
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);
    const [settings, setSettings] = useState<SettingsPreference>(localuser?.settings_preferences ? localuser?.settings_preferences : initialSettingsPreference);
    const { colors: appColors, isDark } = useAppTheme();

    useEffect(() => {
        const incomingPreferences = (userData as any)?.settings_preferences;

        if (incomingPreferences) {
            setSettings(incomingPreferences);
        }
    }, [userData, isLoading]);

    const handleNotificationPermission = async () => {
        const { status } = await checkNotifications();

        if (status === RESULTS.GRANTED) {
            return true;
        }

        // On iOS/Android, if it's already been denied once, 
        // it might return BLOCKED instead of DENIED.
        if (status === RESULTS.DENIED) {

            const { status: newStatus } = await requestNotifications(['alert', 'sound', 'badge']);

            if (newStatus === RESULTS.GRANTED) {
                return true;
            }
            // If they just denied it NOW, we usually don't show the Alert immediately 
            // to avoid annoying them. But if it didn't even show the popup, it's blocked.
            else if (newStatus === RESULTS.BLOCKED || newStatus === RESULTS.DENIED) {
                showSettingsAlert();
                return false;
            }
        }

        else if (status === RESULTS.BLOCKED) {
            showSettingsAlert();
            return false;
        }

        return false;
    };

    // Helper to keep code clean
    const showSettingsAlert = () => {
        Alert.alert(
            "Notifications are Off",
            "We need notification access to send you ride updates. Please enable them in Settings.",
            [
                { text: "Not Now", style: "cancel" },
                { text: "Open Settings", onPress: () => openSettings() }
            ]
        );
    };

    const handleToggle = async (key: PreferenceKey) => {
        const newValue = !settings[key];

        if (key === 'push_notifications' && newValue === true) {

            const hasPermission = await handleNotificationPermission();
            if (!hasPermission) {
                // Important: Don't update the toggle if permission was denied/blocked
                return;
            }
        }

        const updatedPreferences = {
            ...settings,
            [key]: newValue
        };

        setUpdatingKey(key);

        try {

            const payload = {
                id: localuser.id,
                settings_preferences: updatedPreferences
            };

            const response = await updateUser(payload).unwrap();

            if (response.success) {
                dispatch(updateUserStore({ settings_preferences: updatedPreferences }));
                setSettings(updatedPreferences);
            }
        } catch (error: any) {
            // console.error(error, "error")
            Alert.alert('Something Went Wrong!!!', 'Try Again Later');
            const errorMsg = error?.data?.message || "Failed to save preference";
            // Alert.alert("Update Error", errorMsg);

        } finally {
            setUpdatingKey(null);
        }
    };

    const PreferenceToggle = ({ title, description, icon, prefKey }: { title: string, description: string, icon: string, prefKey: PreferenceKey }) => (
        <View style={[styles.toggleRow, { borderBottomColor: appColors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: appColors.iconBox }]}>
                <MaterialCommunityIcons name={icon} size={mS(20)} color={isDark ? '#38BDF8' : colors.button} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.toggleTitle, { color: appColors.text }]}>{title}</Text>
                <Text style={[styles.toggleDesc, { color: appColors.secondaryText }]}>{description}</Text>
            </View>
            <View style={styles.controlContainer}>
                {updatingKey === prefKey ? (
                    <ActivityIndicator size="small" color="#34C759" />
                ) : (
                    <Switch
                        trackColor={{ false: appColors.border, true: '#10B981' }}
                        thumbColor={'#FFF'}
                        ios_backgroundColor={appColors.border}
                        onValueChange={() => handleToggle(prefKey)}
                        value={settings[prefKey]}
                    />
                )}
            </View>
        </View>
    );

    useEffect(() => {
        const syncNotificationToggle = async () => {
            const { status } = await checkNotifications();

            if (status !== RESULTS.GRANTED && settings.push_notifications === true) {
                const updatedPreferences = {
                    ...settings,
                    push_notifications: false
                };

                setSettings(updatedPreferences);
                dispatch(updateUserStore({ settings_preferences: updatedPreferences }));
            }
        };

        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                syncNotificationToggle();
            }
        });

        syncNotificationToggle();

        return () => {
            subscription.remove();
        };
    }, [settings.push_notifications]);

    if (loading) return (
        <View style={[styles.center, { backgroundColor: appColors.background }]}>
            <ActivityIndicator size="large" color={colors.button} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={appColors.background} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + vS(40) }]}
            >
                <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#EFF6FF', borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#DBEAFE' }]}>
                    <View style={styles.infoIconBox}>
                        <MaterialCommunityIcons name="information-outline" size={mS(20)} color={isDark ? '#38BDF8' : colors.button} />
                    </View>
                    <Text style={[styles.infoText, isDark && { color: '#38BDF8' }]}>Customize how you'd like to stay informed about your rides and exclusive offers.</Text>
                </View>

                {/* --- Section: Email Settings --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: appColors.secondaryText }]}>Email Settings</Text>
                </View>

                <View style={[styles.cardContainer, { backgroundColor: appColors.card }]}>
                    <PreferenceToggle
                        icon="file-document-outline"
                        title="Ride Invoices"
                        description="Direct copies of your bills after every trip."
                        prefKey="invoice_email"
                    />
                    <PreferenceToggle
                        icon="sale"
                        title="Promotions"
                        description="Updates on discounts and new features."
                        prefKey="promo_email"
                    />
                </View>

                {/* --- Section: Direct Messaging --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: appColors.secondaryText }]}>Direct Messaging</Text>
                </View>

                <View style={[styles.cardContainer, { backgroundColor: appColors.card }]}>
                    <PreferenceToggle
                        icon="whatsapp"
                        title="WhatsApp Updates"
                        description="Ride status and booking info on WhatsApp."
                        prefKey="whatsapp_updates"
                    />
                    <PreferenceToggle
                        icon="message-text-outline"
                        title="SMS Alerts"
                        description="Crucial account updates via Text Message."
                        prefKey="sms_alerts"
                    />
                </View>

                {/* --- Section: Mobile App --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: appColors.secondaryText }]}>Mobile App</Text>
                </View>

                <View style={[styles.cardContainer, { backgroundColor: appColors.card }]}>
                    <PreferenceToggle
                        icon="bell-ring-outline"
                        title="Push Notifications"
                        description="Real-time alerts for ride arrival and safety."
                        prefKey="push_notifications"
                    />
                </View>

                <View style={[styles.footerContainer, {
                    // backgroundColor: isDark ? appColors.iconBox : appColors.card,
                }]}>
                    <MaterialCommunityIcons name="shield-check-outline" size={mS(16)} color={appColors.secondaryText} />
                    <Text style={[styles.footerNote, { color: appColors.secondaryText }]}>
                        Essential service updates regarding your account or active rides cannot be disabled.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollContent: {
        paddingTop: vS(16),
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: mS(16),
        backgroundColor: '#EFF6FF',
        marginHorizontal: hS(16),
        borderRadius: mS(16),
        marginBottom: vS(24),
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    infoIconBox: {
        marginRight: hS(12),
    },
    infoText: {
        flex: 1,
        fontSize: mS(13),
        color: '#1E40AF',
        lineHeight: mS(18),
        fontWeight: '500',
    },
    sectionHeader: {
        marginTop: vS(10),
        marginHorizontal: hS(20),
        marginBottom: vS(8),
    },
    sectionTitle: {
        fontSize: mS(13),
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    cardContainer: {
        marginHorizontal: hS(16),
        backgroundColor: '#FFFFFF',
        borderRadius: mS(20),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
        marginBottom: vS(20),
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(16),
        paddingHorizontal: hS(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconContainer: {
        width: mS(40),
        height: vS(40),
        backgroundColor: '#F8FAFC',
        borderRadius: mS(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(16),
    },
    textContainer: {
        flex: 1,
        marginRight: hS(10),
    },
    toggleTitle: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#1E293B',
    },
    toggleDesc: {
        fontSize: mS(12),
        color: '#64748B',
        marginTop: vS(2),
        fontWeight: '500',
    },
    controlContainer: {
        width: hS(50),
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: hS(30),
        marginTop: vS(10),
        gap: hS(8),
    },
    footerNote: {
        fontSize: mS(12),
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: mS(18),
        fontWeight: '500',
    },
});

export default Preferences;