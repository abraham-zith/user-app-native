import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Modal,
    Pressable,
    useColorScheme,
    Alert,
    ToastAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Styles } from '../../../../lib/styles';
import fonts from '../../../../constant/fonts';
import colors from '../../../../constant/colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { AboutVdriveScreen_Nav, FavouritelocationScreens_Nav, HelpContactScreen_Nav, NotificationScreen_Nav, PreferencesScreen_Nav, ProfilescreenComponents_Nav, ProfileUpdateScreen_Nav, SafetyScreen_Nav, OffersScreen_Nav } from '../../../../Navigations/navigations';
import { useSignOut } from '../../../../service/auth/signout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hS, mS, vS } from '../../../../lib/responsive';
import { useDeleteUserMutation } from '../../../../service/userApi';
import { useAppTheme } from '../../../../hooks/useAppTheme';
import { useDispatch } from 'react-redux';
import { setThemeMode, ThemeMode } from '../../../../redux/themeSlice';

interface RapidoItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    color?: string;
}

const Settings = ({ navigation }: ScreenProps) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { colors, isDark, mode } = useAppTheme();
    const [deleteuser] = useDeleteUserMutation();
    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [themeVisible, setThemeVisible] = useState(false);
    const { signOut } = useSignOut();

    const handleNavigation = (screenName: string) => {
        navigation.navigate(screenName);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Account",
            "This action is permanent and cannot be reversed. Are you sure you want to delete your account?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        const result = await deleteuser(localuser.id).unwrap();
                        if (result.success) {
                            ToastAndroid.show('Account Deleted Successfully', ToastAndroid.SHORT);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const ActionRow = ({ icon, title, subtitle, onPress, showArrow = true, isCritical = false }: RapidoItemProps & { isCritical?: boolean }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionRow, { borderBottomColor: colors.border }]}
            onPress={onPress}
        >
            <View style={[
                styles.rowIconBox,
                { backgroundColor: colors.iconBox },
                isCritical && { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' }
            ]}>
                <MaterialCommunityIcons
                    name={icon}
                    size={mS(20)}
                    color={isCritical ? '#EF4444' : isDark ? colors.primary : colors.button}
                />
            </View>
            <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.text }, isCritical && { color: '#EF4444' }]}>{title}</Text>
                {subtitle && <Text style={[styles.rowSubtitle, { color: colors.lightTextColor }]}>{subtitle}</Text>}
            </View>
            {showArrow && !isCritical && (
                <MaterialCommunityIcons name="chevron-right" size={mS(20)} color={colors.border} />
            )}
        </TouchableOpacity>
    );

    const ThemeSelectionModal = () => {
        const themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
            { label: 'Light Mode', value: 'light', icon: 'white-balance-sunny' },
            { label: 'Dark Mode', value: 'dark', icon: 'moon-waning-crescent' },
            { label: 'System Default', value: 'system', icon: 'theme-light-dark' },
        ];

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={themeVisible}
                onRequestClose={() => setThemeVisible(false)}
                statusBarTranslucent
                navigationBarTranslucent
            >
                <Pressable style={styles.modalOverlay} onPress={() => setThemeVisible(false)} />
                <View style={[styles.sheetContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
                    <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose Theme</Text>
                    <View style={styles.themeOptionsList}>
                        {themeOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.themeOptionItem,
                                    mode === option.value && { backgroundColor: colors.iconBox }
                                ]}
                                onPress={() => {
                                    dispatch(setThemeMode(option.value));
                                    setThemeVisible(false);
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={option.icon}
                                    size={mS(24)}
                                    color={mode === option.value ? colors.primary : colors.lightTextColor}
                                />
                                <Text style={[
                                    styles.themeOptionLabel,
                                    { color: colors.text },
                                    mode === option.value && { color: colors.primary, fontWeight: '700' }
                                ]}>
                                    {option.label}
                                </Text>
                                {mode === option.value && (
                                    <MaterialCommunityIcons name="check-circle" size={mS(20)} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + vS(20) }]}
            >
                {/* --- GENERAL SECTION --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.lightTextColor }]}>General</Text>
                </View>

                <View style={[styles.cardContainer, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                    <ActionRow
                        icon="account-outline"
                        title="Profile"
                        subtitle={localuser?.phone_number}
                        onPress={() => navigation.navigate(ProfilescreenComponents_Nav, { screen: ProfileUpdateScreen_Nav, params: { localuser } })}
                    />
                    <ActionRow
                        icon="heart-outline"
                        title="Favourites"
                        subtitle="Manage favourite locations"
                        onPress={() => handleNavigation(FavouritelocationScreens_Nav)}
                    />
                    <ActionRow
                        icon="ticket-percent-outline"
                        title="Offers"
                        subtitle="View available coupons & discounts"
                        onPress={() => handleNavigation(OffersScreen_Nav)}
                    />
                    <ActionRow
                        icon="tune"
                        title="Preferences"
                        subtitle='Manage Preferences'
                        onPress={() => handleNavigation(PreferencesScreen_Nav)}
                    />
                    <ActionRow
                        icon="bell-ring-outline"
                        title="Notifications"
                        onPress={() => handleNavigation(NotificationScreen_Nav)}
                        showArrow={true}
                    />
                </View>

                {/* --- OTHERS SECTION --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.lightTextColor }]}>Others</Text>
                </View>

                <View style={[styles.cardContainer, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                    <ActionRow
                        icon="palette-outline"
                        title="Theme"
                        subtitle={mode === 'system' ? 'System Default' : mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        onPress={() => setThemeVisible(true)}
                    />
                    <ActionRow
                        icon="shield-check-outline"
                        title="Safety"
                        subtitle="Emergency contacts & Insurance"
                        onPress={() => handleNavigation(SafetyScreen_Nav)}
                    />
                    <ActionRow
                        icon="help-circle-outline"
                        title="Support"
                        onPress={() => handleNavigation(HelpContactScreen_Nav)}
                    />
                    <ActionRow
                        icon="information-outline"
                        title="About T2Drive"
                        onPress={() => handleNavigation(AboutVdriveScreen_Nav)}
                    />
                </View>

                {/* --- ACCOUNT ACTIONS --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.lightTextColor }]}>Account Actions</Text>
                </View>

                <View style={[styles.cardContainer, { marginBottom: vS(30), backgroundColor: colors.card, shadowColor: colors.text }]}>
                    <ActionRow
                        icon="logout"
                        title="Logout"
                        isCritical={true}
                        onPress={() => setLogoutVisible(true)}
                        showArrow={false}
                    />
                    <ActionRow
                        icon="trash-can-outline"
                        title="Delete Account"
                        isCritical={true}
                        onPress={() => handleDelete()}
                        showArrow={false}
                    />
                </View>

                <Text style={styles.versionText}>Version 1.0.42 (Beta)</Text>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={logoutVisible}
                onRequestClose={() => setLogoutVisible(false)}
                statusBarTranslucent
                navigationBarTranslucent
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setLogoutVisible(false)}
                />

                <View style={[styles.sheetContainer, { backgroundColor: colors.card }]}>
                    <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

                    <View style={styles.logoutIconBox}>
                        <MaterialCommunityIcons name="logout" size={mS(32)} color="#EF4444" />
                    </View>

                    <Text style={[styles.sheetTitle, { color: colors.text }]}>Logout</Text>
                    <Text style={[styles.sheetSubtitle, { color: colors.lightTextColor }]}>Are you sure you want to logout? You will need to sign in again to use the app.</Text>

                    <View style={styles.sheetActionContainer}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.sheetButton, styles.cancelButton, { backgroundColor: colors.iconBox }]}
                            onPress={() => setLogoutVisible(false)}
                        >
                            <Text style={[styles.cancelButtonText, { color: isDark ? colors.icon : '#475569' }]}>Stay Signed In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.sheetButton, styles.confirmLogoutButton]}
                            onPress={() => {
                                setLogoutVisible(false);
                                signOut(localuser.id);
                            }}
                        >
                            <Text style={styles.logoutButtonText}>Yes, Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ThemeSelectionModal />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: vS(12),
        paddingBottom: vS(30),
    },
    sectionHeader: {
        marginTop: vS(20),
        marginHorizontal: hS(20),
        marginBottom: vS(8),
    },
    sectionTitle: {
        fontSize: mS(13),
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    cardContainer: {
        marginHorizontal: hS(16),
        borderRadius: mS(20),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(16),
        paddingHorizontal: hS(16),
        borderBottomWidth: 1,
    },
    rowIconBox: {
        width: mS(40),
        height: mS(40),
        borderRadius: mS(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowContent: {
        flex: 1,
        marginLeft: hS(16),
    },
    rowTitle: {
        fontSize: mS(15),
        fontWeight: '700',
    },
    rowSubtitle: {
        fontSize: mS(12),
        marginTop: vS(2),
        fontWeight: '500',
    },
    versionText: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: mS(12),
        marginTop: vS(10),
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
    },
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: mS(30),
        borderTopRightRadius: mS(30),
        padding: mS(24),
        paddingBottom: vS(40),
        alignItems: 'center',
    },
    dragHandle: {
        width: hS(36),
        height: vS(4),
        borderRadius: mS(2),
        marginBottom: vS(24),
    },
    logoutIconBox: {
        width: mS(70),
        height: mS(70),
        borderRadius: mS(35),
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(16),
    },
    sheetTitle: {
        fontSize: mS(22),
        fontWeight: '800',
        marginBottom: vS(8),
    },
    sheetSubtitle: {
        fontSize: mS(15),
        textAlign: 'center',
        lineHeight: mS(22),
        marginBottom: vS(32),
        paddingHorizontal: hS(10),
    },
    sheetActionContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: mS(12),
    },
    sheetButton: {
        flex: 1,
        height: vS(54),
        borderRadius: mS(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        // Styled dynamically in component
    },
    confirmLogoutButton: {
        backgroundColor: '#EF4444',
    },
    cancelButtonText: {
        fontWeight: '700',
        fontSize: mS(15),
    },
    logoutButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: mS(15),
    },
    themeOptionsList: {
        width: '100%',
        marginTop: vS(10),
    },
    themeOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(16),
        paddingHorizontal: hS(16),
        borderRadius: mS(16),
        marginBottom: vS(8),
    },
    themeOptionLabel: {
        flex: 1,
        fontSize: mS(16),
        fontWeight: '600',
        marginLeft: hS(16),
    },
});

export default Settings;