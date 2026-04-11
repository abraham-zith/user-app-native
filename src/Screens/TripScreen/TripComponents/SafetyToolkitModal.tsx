import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    ScrollView,
    Image,
    Platform,
    Linking,
    Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { hS, vS, mS } from '../../../lib/responsive';
import colors from '../../../constant/colors';
import { useNavigation } from '@react-navigation/native';
import { SafetyScreen_Nav } from '../../../Navigations/navigations';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useTriggerSosMutation } from '../../../service/tripApi';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SafetyToolkitModalProps {
    isVisible: boolean;
    onClose: () => void;
    tripData?: any;
    emergencyContacts?: { name: string; phone: string }[];
}

const SafetyToolkitModal: React.FC<SafetyToolkitModalProps> = ({
    isVisible,
    onClose,
    tripData,
    emergencyContacts = []
}) => {
    const { colors: appColors, isDark } = useAppTheme();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [triggerSos] = useTriggerSosMutation();

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 12,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isVisible]);

    const handleCallPolice = () => {
        Alert.alert(
            "Emergency SOS",
            "Are you sure you want to call emergency services?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Call 112", style: "destructive", onPress: () => Linking.openURL('tel:112') }
            ]
        );
    };

    const handleTriggerSos = async () => {
        const res = await triggerSos({
            trip_id: tripData?.trip_id,
            id: tripData?.user_id,
            user_type: 'customer',
        })
        if (res.data.success) {
            Alert.alert("SOS Triggered", "Emergency services have been notified.");
        } else {
            Alert.alert("Error", "Failed to trigger SOS.");
        }
    }

    const handleShareWithContact = (contact: { name: string; phone: string }) => {
        const destination = tripData?.drop_address || "destination";
        const tripUrl = `vdriveapp://trips/${tripData?.trip_id}`;
        const message = `I'm on a VDrive trip to ${destination}. Track my journey here: ${tripUrl}`;

        Alert.alert(
            "Share Trip Status",
            `Share your live trip status with ${contact.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Send SMS",
                    onPress: () => {
                        const smsUrl = `sms:${contact.phone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
                        Linking.openURL(smsUrl).catch(() => Alert.alert("Error", "Could not open SMS app"));
                    }
                }
            ]
        );
    };

    const handleAddContact = () => {
        onClose();
        setTimeout(() => {
            navigation.navigate(SafetyScreen_Nav);
        }, 300);
    };

    const safetyActions = [
        {
            id: 'police',
            title: 'Call Police',
            subtext: 'Call local authorities now',
            icon: 'shield-alert',
            iconColor: '#FF3B30',
            bgColor: '#FEF2F2',
            onPress: handleCallPolice,
        },
        {
            id: 'share',
            title: 'Share Trip',
            subtext: 'Send live location to contacts',
            icon: 'share-variant',
            iconColor: '#2196F3',
            bgColor: '#EFF6FF',
            onPress: () => {
                const destination = tripData?.drop_address || "destination";
                const message = `I'm on a VDrive trip to ${destination}. Track my journey here: vdriveapp://trips/${tripData?.trip_id}`;
                Alert.alert("Share Trip", "Opening share sheet...");
            },
        },
        {
            id: 'support',
            title: 'Safety Line',
            subtext: 'Talk to our safety support team',
            icon: 'headphones',
            iconColor: '#0D9488',
            bgColor: '#F0FDFA',
            onPress: () => Alert.alert("Safety Support", "Connecting to safety support..."),
        },
        {
            id: 'report',
            title: 'Report Issue',
            subtext: 'Report unsafe behavior or concerns',
            icon: 'flag-outline',
            iconColor: '#F59E0B',
            bgColor: '#FFFBEB',
            onPress: () => Alert.alert("Report Issue", "Opening report form..."),
        }
    ];

    const ContactAvatar = ({ name }: { name: string }) => {
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return (
            <View style={[styles.avatarCircle, { backgroundColor: isDark ? appColors.background : '#F1F5F9' }]}>
                <Text style={[styles.avatarText, { color: isDark ? appColors.primary : colors.button }]}>{initials}</Text>
            </View>
        );
    };

    return (
        <Modal statusBarTranslucent navigationBarTranslucent transparent
            visible={isVisible}
            onRequestClose={onClose}
            animationType="none"
        >
            <View style={styles.modalContainer}>
                <Animated.View
                    style={[styles.backdrop, { opacity: fadeAnim }]}
                    onTouchStart={onClose}
                />

                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            transform: [{ translateY: slideAnim }],
                            backgroundColor: appColors.card,
                            paddingBottom: insets.bottom + vS(20),
                            maxHeight: SCREEN_HEIGHT * 0.9
                        }
                    ]}
                >
                    {/* DRAG HANDLE */}
                    <View style={[styles.handle, { backgroundColor: isDark ? appColors.border : '#E2E8F0' }]} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: vS(20) }}
                    >
                        {/* TOP SECTION: SOS HEADER */}
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.sosPill} onPress={handleTriggerSos}>
                                <MaterialCommunityIcons name="shield-check" size={mS(24)} color="#FFF" />
                                <Text style={styles.sosPillText}>Emergency SOS</Text>
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { color: appColors.text }]}>We're here to help.</Text>
                            <Text style={[styles.headerSubtext, { color: appColors.secondaryText }]}>Choose an option below to stay safe.</Text>
                        </View>

                        {/* QUICK SAFETY ACTIONS GRID */}
                        <View style={styles.actionGrid}>
                            {safetyActions.map((action) => (
                                <TouchableOpacity
                                    key={action.id}
                                    style={[styles.actionCard, { backgroundColor: isDark ? appColors.background : action.bgColor }]}
                                    onPress={action.onPress}
                                >
                                    <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)' }]}>
                                        <MaterialCommunityIcons name={action.icon} size={mS(24)} color={action.iconColor} />
                                    </View>
                                    <Text style={[styles.actionTitle, { color: appColors.text }]}>{action.title}</Text>
                                    <Text style={[styles.actionSubtext, { color: appColors.secondaryText }]}>{action.subtext}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* TRUSTED CONTACTS SECTION */}
                        <View style={styles.contactsSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: appColors.text }]}>Trusted Contacts</Text>
                                <TouchableOpacity onPress={handleAddContact}>
                                    <Text style={[styles.addText, { color: appColors.primary }]}>+ Add New</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.contactsDescription, { color: appColors.secondaryText }]}>Share your trip instantly with people you trust.</Text>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contactsScroll}>
                                <TouchableOpacity style={styles.addContactBtn} onPress={handleAddContact}>
                                    <View style={[styles.addIconCircle, { borderColor: isDark ? appColors.border : '#E2E8F0' }]}>
                                        <MaterialCommunityIcons name="plus" size={mS(20)} color={isDark ? appColors.lightTextColor : "#64748B"} />
                                    </View>
                                    <Text style={[styles.contactName, { color: appColors.secondaryText }]}>Add</Text>
                                </TouchableOpacity>

                                {/* Real Contacts from Props */}
                                {emergencyContacts.length > 0 ? (
                                    emergencyContacts.map((contact, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.contactItem}
                                            onPress={() => handleShareWithContact(contact)}
                                        >
                                            <ContactAvatar name={contact.name} />
                                            <Text style={[styles.contactName, { color: appColors.secondaryText }]} numberOfLines={1}>
                                                {contact.name.split(' ')[0]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.emptyContacts}>
                                        <Text style={styles.emptyText}>No contacts found</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        {/* BOTTOM STRIP */}
                        <View style={[styles.bottomStrip, { backgroundColor: isDark ? appColors.background : '#F8FAFC' }]}>
                            <MaterialCommunityIcons name="shield-lock-outline" size={mS(16)} color={appColors.lightTextColor} />
                            <Text style={[styles.bottomText, { color: appColors.lightTextColor }]}>
                                Your location and ride details may be shared for your safety.
                            </Text>
                        </View>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: mS(32),
        borderTopRightRadius: mS(32),
        paddingHorizontal: hS(20),
        paddingBottom: vS(30),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 25,
    },
    handle: {
        width: mS(40),
        height: vS(5),
        backgroundColor: '#E2E8F0',
        borderRadius: mS(10),
        alignSelf: 'center',
        marginVertical: vS(15),
    },
    header: {
        alignItems: 'center',
        marginBottom: vS(24),
    },
    sosPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF3B30',
        paddingHorizontal: hS(24),
        paddingVertical: vS(12),
        borderRadius: mS(30),
        marginBottom: vS(16),
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    sosPillText: {
        color: '#FFFFFF',
        fontSize: mS(16),
        fontWeight: '900',
        marginLeft: hS(8),
        letterSpacing: 0.5,
    },
    headerTitle: {
        fontSize: mS(20),
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: vS(4),
    },
    headerSubtext: {
        fontSize: mS(14),
        color: '#64748B',
        fontWeight: '500',
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: mS(12),
        marginBottom: vS(24),
    },
    actionCard: {
        // width: (Dimensions.get('window').width - hS(52)) / 2,
        width: '48%',
        padding: mS(16),
        borderRadius: mS(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconWrapper: {
        width: mS(44),
        height: mS(44),
        borderRadius: mS(14),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(12),
    },
    actionTitle: {
        fontSize: mS(14),
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: vS(4),
    },
    actionSubtext: {
        fontSize: mS(11),
        color: '#64748B',
        fontWeight: '500',
        lineHeight: mS(14),
    },
    contactsSection: {
        marginBottom: vS(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(4),
    },
    sectionTitle: {
        fontSize: mS(16),
        fontWeight: '800',
        color: '#1E293B',
    },
    addText: {
        fontSize: mS(14),
        color: '#2563EB',
        fontWeight: '700',
    },
    contactsDescription: {
        fontSize: mS(13),
        color: '#64748B',
        fontWeight: '500',
        marginBottom: vS(16),
    },
    contactsScroll: {
        paddingRight: hS(20),
        gap: hS(16),
    },
    addContactBtn: {
        alignItems: 'center',
        gap: vS(8),
    },
    addIconCircle: {
        width: mS(50),
        height: mS(50),
        borderRadius: mS(25),
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircle: {
        width: mS(50),
        height: mS(50),
        borderRadius: mS(25),
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactName: {
        fontSize: mS(12),
        fontWeight: '600',
        color: '#64748B',
    },
    avatarText: {
        fontSize: mS(16),
        fontWeight: '800',
        color: colors.button,
    },
    emptyContacts: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: hS(20),
    },
    emptyText: {
        fontSize: mS(13),
        color: '#94A3B8',
        fontWeight: '600',
        fontStyle: 'italic',
    },
    contactItem: {
        alignItems: 'center',
        gap: vS(8),
    },
    bottomStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: hS(8),
        paddingVertical: vS(12),
        backgroundColor: '#F8FAFC',
        borderRadius: mS(12),
    },
    bottomText: {
        fontSize: mS(10),
        color: '#94A3B8',
        fontWeight: '600',
        maxWidth: '85%',
    },
});

export default SafetyToolkitModal;
