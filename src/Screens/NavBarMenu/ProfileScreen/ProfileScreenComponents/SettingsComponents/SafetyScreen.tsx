import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ToastAndroid,
    ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContactPicker } from '../../../../../hooks/useContacts';
import colors from '../../../../../constant/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../redux/store';
import { useUpdateUserMutation } from '../../../../../service/userApi';
import { updateUserStore } from '../../../../../redux/userSlice';
import { hS, mS, vS } from '../../../../../lib/responsive';
import { ContactScreen_Nav } from '../../../../../Navigations/navigations';
import { useAppTheme } from "../../../../../hooks/useAppTheme";
import RelationshipSelectionModal from '../../../../../Components/RelationshipSelectionModal';
import { useAddTrustedContactMutation, useGetTrustedContactsQuery, useRemoveTrustedContactMutation } from '../../../../../service/sosApi';
import { skipToken } from '@reduxjs/toolkit/query';

export interface EmergencyContact {
    name: string;
    phone: string;
    relationship: string;
}

const RELATIONSHIP_SUGGESTIONS = [
    'Mother',
    'Father',
    'Sister',
    'Brother',
    'Spouse',
    'Friend',
    'Colleague',
    'Guardian',
];

const SafetyScreen = ({ navigation }: any) => {
    const { pickContact, loading } = useContactPicker();
    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const dispatch = useDispatch()
    const [updateUser] = useUpdateUserMutation();
    const [addTrustedContact] = useAddTrustedContactMutation();
    const [removeTrustedContact] = useRemoveTrustedContactMutation();
    const insets = useSafeAreaInsets()
    const { colors: appColors, isDark } = useAppTheme();
    const { data: serverContactsData, refetch: refetchContacts } = useGetTrustedContactsQuery(
        localuser?.id ? { userId: localuser.id } : skipToken
    );;

    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
    const [pickerloading, setpickerLoading] = useState(false);
    const [relationshipModalVisible, setRelationshipModalVisible] = useState(false);
    const [selectedContact, setSelectedContact] = useState<{ name: string; phone: string } | null>(null);

    if (!localuser) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: appColors.background }}>
                <ActivityIndicator size="large" color={colors.button} />
            </View>
        );
    }
    console.log(serverContactsData?.data, "serverContactsData")
    useEffect(() => {
        loadSavedContacts();
    }, []);

    // Sync with Redux store (primary ground truth for display)
    useEffect(() => {
        if (localuser?.emergency_contacts && Array.isArray(localuser.emergency_contacts)) {
            setEmergencyContacts(localuser.emergency_contacts);
            AsyncStorage.setItem('@emergency_contacts', JSON.stringify(localuser.emergency_contacts));
        }
    }, [localuser?.emergency_contacts]);

    // Sync with Server (source of truth for data integrity)
    useEffect(() => {
        if (serverContactsData?.data && Array.isArray(serverContactsData.data)) {
            setEmergencyContacts(serverContactsData.data);
            AsyncStorage.setItem('@emergency_contacts', JSON.stringify(serverContactsData.data));
            // Also sync back to Redux if different
            dispatch(updateUserStore({ emergency_contacts: serverContactsData.data }));
        }
    }, [serverContactsData]);

    const loadSavedContacts = async () => {
        const saved = await AsyncStorage.getItem('@emergency_contacts');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) setEmergencyContacts(parsed);
            } catch (e) {
                console.error("Error parsing saved contacts", e);
            }
        }
    };

    const openContactPicker = async () => {
        if ((emergencyContacts || []).length >= 5) {
            Alert.alert(
                "Limit Reached",
                "You can only add up to 5 emergency contacts. Please remove one to add a new one."
            );
            return;
        }
        setpickerLoading(true);

        navigation.navigate(ContactScreen_Nav, {
            onSelectContact: async (SelectedContact: any) => {
                if (SelectedContact) {
                    const cleanphone = SelectedContact.phone?.replace(/\+91/g, '').replace(/[^0-9]/g, '');

                    const isDuplicate = (emergencyContacts || []).some(contact => {
                        const existingPhone = contact.phone?.replace(/[^0-9]/g, '');
                        const incomingPhone = cleanphone?.replace(/[^0-9]/g, '');
                        return existingPhone === incomingPhone;
                    });

                    if (isDuplicate) {
                        Alert.alert("Already Added", `${SelectedContact.name} is already in your emergency list.`);
                        setpickerLoading(false);
                        navigation.goBack();
                        return;
                    }

                    // Store contact and show relationship modal
                    setSelectedContact({
                        name: SelectedContact.name,
                        phone: cleanphone || 'No Number',
                    });
                    setRelationshipModalVisible(true);
                    navigation.goBack();
                }
                setpickerLoading(false);
            },
        });
    };

    const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);

    const handleEditContactRelationship = (index: number) => {
        setEditingContactIndex(index);
        setSelectedContact({
            name: (emergencyContacts || [])[index].name,
            phone: (emergencyContacts || [])[index].phone,
        });
        setRelationshipModalVisible(true);
    };

    const handleRelationshipSelect = async (relationship: string) => {
        if (!selectedContact) return;

        const newContact: any = {
            name: selectedContact.name,
            phone: selectedContact.phone,
            relationship: relationship,
        };

        const updatedList = [...(emergencyContacts || [])];
        let oldContact: any = null;
        if (editingContactIndex !== null) {
            oldContact = updatedList[editingContactIndex];
            if (oldContact.id) newContact.id = oldContact.id;
            updatedList[editingContactIndex] = newContact;
        } else {
            updatedList.push(newContact);
        }

        try {
            const payload = {
                id: localuser.id,
                emergency_contacts: updatedList
            };

            const response = await updateUser(payload).unwrap();
            if (response.success) {
                dispatch(updateUserStore({ emergency_contacts: response.data.emergency_contacts }));
                ToastAndroid.show("Emergency contact updated successfully", ToastAndroid.SHORT);
            }

            const trustedcontacts = {
                id: localuser.id,
                name: newContact.name,
                phone: newContact.phone,
                relationship: newContact.relationship,
                user_type: 'customer'
            }

            if (editingContactIndex === null) {
                await addTrustedContact(trustedcontacts).unwrap();
            } else {
                if (oldContact && oldContact.id) {
                    await removeTrustedContact({ id: oldContact.id }).unwrap();
                }
                await addTrustedContact(trustedcontacts).unwrap();
            }

            refetchContacts();
            setEmergencyContacts(updatedList);
            await AsyncStorage.setItem('@emergency_contacts', JSON.stringify(updatedList));
        } catch (error) {
            ToastAndroid.show("Something Went Wrong!!! Try Later...", ToastAndroid.SHORT);
        } finally {
            setRelationshipModalVisible(false);
            setSelectedContact(null);
            setEditingContactIndex(null);
        }
    };

    const handleRemoveContact = (index: number) => {
        const contactName = emergencyContacts[index]?.name || "this contact";

        Alert.alert(
            "Remove Contact",
            `Are you sure you want to remove ${contactName} from your emergency list?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => performDelete(index),
                },
            ]
        );
    };

    const performDelete = async (index: number) => {
        const contactToDelete = emergencyContacts[index];
        const updatedList = (emergencyContacts || []).filter((_, i) => i !== index);

        try {
            const payload = {
                id: localuser.id,
                emergency_contacts: updatedList
            };

            const response = await updateUser(payload).unwrap();
            const serverContacts = response.data?.emergency_contacts || response.emergency_contacts;

            if (serverContacts) {
                dispatch(updateUserStore({ emergency_contacts: serverContacts }));
            }

            // Also remove from trusted_contacts table if ID exists
            if (contactToDelete && (contactToDelete as any).id) {
                await removeTrustedContact({ id: (contactToDelete as any).id }).unwrap();
            }

            setEmergencyContacts(updatedList);
            await AsyncStorage.setItem('@emergency_contacts', JSON.stringify(updatedList));
            ToastAndroid.show("Contact removed successfully", ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show("Something Went Wrong!!! Try Later...", ToastAndroid.SHORT);
        }
    };

    const ContactAvatar = ({ name }: { name: string }) => {
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return (
            <View style={[styles.avatarBox, { backgroundColor: appColors.iconBox }]}>
                <Text style={[styles.avatarText, { color: isDark ? appColors.primary : appColors.button }]}>{initials}</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + vS(40) }}
            >
                {/* --- PREMIUM HEADER --- */}
                <View style={styles.premiumHeader}>
                    <View style={styles.headerIconContainer}>
                        <MaterialCommunityIcons name="shield-check" size={mS(48)} color="#FFF" />
                    </View>
                    <Text style={styles.premiumTitle}>Safety Center</Text>
                    <Text style={styles.premiumSubtitle}>
                        Your protection is our priority. Set up your emergency tools for a secure journey.
                    </Text>
                </View>

                {/* --- EMERGENCY CONTACTS SECTION --- */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: appColors.text }]}>Emergency Contacts</Text>
                            <Text style={[styles.sectionSubtitle, { color: appColors.secondaryText }]}>Select up to 5 trusted contacts</Text>
                        </View>
                        <TouchableOpacity
                            disabled={(emergencyContacts || []).length >= 5 || pickerloading}
                            onPress={openContactPicker}
                            activeOpacity={0.7}
                            style={[
                                styles.addIconButton,
                                { backgroundColor: appColors.card, shadowColor: appColors.text },
                                (emergencyContacts.length >= 5 || pickerloading) && { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }
                            ]}
                        >
                            {pickerloading ? (
                                <ActivityIndicator size="small" color="#94A3B8" />
                            ) : (
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={mS(24)}
                                    color={(emergencyContacts || []).length >= 5 ? "#CBD5E1" : isDark ? colors.primary : colors.button}
                                />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.cardWrapper, { backgroundColor: appColors.card, shadowColor: appColors.text }]}>
                        {emergencyContacts.length === 0 ? (
                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={openContactPicker}
                                style={styles.emptyStateBox}
                            >
                                <MaterialCommunityIcons name="account-plus-outline" size={mS(32)} color={appColors.secondaryText} />
                                <Text style={[styles.emptyStateText, { color: appColors.text }]}>No emergency contacts added yet.</Text>
                                <Text style={[styles.emptyStateSubtext, { color: appColors.secondaryText }]}>Tap to add your first contact</Text>
                            </TouchableOpacity>
                        ) : (
                            (emergencyContacts || []).map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.contactActionRow,
                                        { borderBottomColor: appColors.border },
                                        index === emergencyContacts.length - 1 && { borderBottomWidth: 0 }
                                    ]}
                                >
                                    <ContactAvatar name={item.name} />
                                    <View style={[styles.contactInfo, { flex: 1 }]}>
                                        <Text style={[styles.contactNameText, { color: appColors.text }]}>{item.name}</Text>
                                        <Text style={[styles.contactPhoneText, { color: appColors.secondaryText }]}>{item.phone}</Text>
                                        <Text style={[styles.contactRelationshipText, { color: appColors.secondaryText }]}>
                                            <MaterialCommunityIcons name="family-tree" size={mS(12)} /> {item.relationship}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            onPress={() => handleEditContactRelationship(index)}
                                            style={styles.deleteAction}
                                        >
                                            <MaterialCommunityIcons name="pencil-outline" size={mS(20)} color={appColors.secondaryText} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            onPress={() => handleRemoveContact(index)}
                                            style={styles.deleteAction}
                                        >
                                            <MaterialCommunityIcons name="trash-can-outline" size={mS(20)} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    {(emergencyContacts || [])?.length >= 5 && (
                        <View style={styles.limitBanner}>
                            <MaterialCommunityIcons name="information" size={mS(16)} color={isDark ? '#F59E0B' : '#B45309'} />
                            <Text style={[styles.limitText, isDark && { color: '#F59E0B' }]}>Maximum limit reached (5 contacts)</Text>
                        </View>
                    )}
                </View>

                {/* --- SAFETY GUIDANCE SECTION --- */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: appColors.text }]}>Safety Guidance</Text>
                    <Text style={[styles.sectionSubtitle, { marginBottom: vS(16), color: appColors.secondaryText }]}>Best practices for a secure ride</Text>

                    <View style={[styles.guidanceCard, { backgroundColor: appColors.card, shadowColor: appColors.text }]}>
                        <View style={[styles.guideIconBox, { backgroundColor: isDark ? 'rgba(5, 150, 105, 0.15)' : '#ECFDF5' }]}>
                            <MaterialCommunityIcons name="shield-account" size={mS(24)} color="#059669" />
                        </View>
                        <View style={styles.guideContent}>
                            <Text style={[styles.guideTitle, { color: appColors.text }]}>Identify Your Ride</Text>
                            <Text style={[styles.guideDescription, { color: appColors.secondaryText }]}>Always verify the vehicle plate and Captain's photo before boarding.</Text>
                        </View>
                    </View>

                    <View style={[styles.guidanceCard, { backgroundColor: appColors.card, shadowColor: appColors.text }]}>
                        <View style={[styles.guideIconBox, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF' }]}>
                            <MaterialCommunityIcons name="share-variant" size={mS(24)} color={isDark ? '#60A5FA' : '#2563EB'} />
                        </View>
                        <View style={styles.guideContent}>
                            <Text style={[styles.guideTitle, { color: appColors.text }]}>Share Trip Status</Text>
                            <Text style={[styles.guideDescription, { color: appColors.secondaryText }]}>Send your live location to your emergency contacts once the journey starts.</Text>
                        </View>
                    </View>

                    <View style={[styles.guidanceCard, { backgroundColor: appColors.card, shadowColor: appColors.text }]}>
                        <View style={[styles.guideIconBox, { backgroundColor: isDark ? 'rgba(220, 38, 38, 0.15)' : '#FEF2F2' }]}>
                            <MaterialCommunityIcons name="alert-octagon" size={mS(24)} color="#DC2626" />
                        </View>
                        <View style={styles.guideContent}>
                            <Text style={[styles.guideTitle, { color: appColors.text }]}>Emergency SOS</Text>
                            <Text style={[styles.guideDescription, { color: appColors.secondaryText }]}>Use the in-app SOS button to instantly alert local authorities and our support.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* --- RELATIONSHIP SELECTION MODAL --- */}
            <RelationshipSelectionModal
                visible={relationshipModalVisible}
                contact={selectedContact}
                onSelectRelationship={handleRelationshipSelect}
                onClose={() => {
                    setRelationshipModalVisible(false);
                    setSelectedContact(null);
                }}
                suggestions={RELATIONSHIP_SUGGESTIONS}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC'
    },
    premiumHeader: {
        backgroundColor: colors.button,
        paddingTop: vS(50),
        paddingBottom: vS(40),
        paddingHorizontal: hS(30),
        alignItems: 'center',
        borderBottomLeftRadius: mS(40),
        borderBottomRightRadius: mS(40),
    },
    headerIconContainer: {
        width: mS(80),
        height: mS(80),
        borderRadius: mS(40),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(16),
    },
    premiumTitle: {
        color: '#FFF',
        fontSize: mS(24),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    premiumSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: vS(8),
        fontSize: mS(14),
        lineHeight: vS(20),
        paddingHorizontal: hS(10),
    },
    sectionContainer: {
        marginTop: vS(32),
        paddingHorizontal: hS(20),
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(16),
    },
    sectionTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        color: '#1E293B',
    },
    sectionSubtitle: {
        fontSize: mS(13),
        color: '#64748B',
        marginTop: vS(2),
        fontWeight: '500',
    },
    addIconButton: {
        width: mS(44),
        height: mS(44),
        borderRadius: mS(14),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(24),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 4,
        overflow: 'hidden',
    },
    emptyStateBox: {
        padding: vS(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#475569',
        marginTop: vS(12),
    },
    emptyStateSubtext: {
        fontSize: mS(13),
        color: '#94A3B8',
        marginTop: vS(4),
    },
    contactActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: mS(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    avatarBox: {
        width: mS(44),
        height: mS(44),
        borderRadius: mS(15),
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: mS(15),
        fontWeight: '700',
        color: colors.button,
    },
    contactInfo: {
        flex: 1,
        marginLeft: hS(16),
    },
    contactNameText: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#1E293B',
    },
    contactPhoneText: {
        fontSize: mS(13),
        color: '#64748B',
        marginTop: vS(1),
        fontWeight: '500',
    },
    contactRelationshipText: {
        fontSize: mS(12),
        color: '#94A3B8',
        marginTop: vS(2),
        fontWeight: '500',
        fontStyle: 'italic',
    },
    deleteAction: {
        padding: mS(8),
    },
    limitBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: vS(12),
        gap: hS(6),
    },
    limitText: {
        fontSize: mS(12),
        color: '#B45309',
        fontWeight: '600',
    },
    guidanceCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: mS(16),
        borderRadius: mS(20),
        marginBottom: vS(12),
        alignItems: 'center',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    guideIconBox: {
        width: mS(48),
        height: mS(48),
        borderRadius: mS(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideContent: {
        flex: 1,
        marginLeft: hS(16),
    },
    guideTitle: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#1E293B',
    },
    guideDescription: {
        fontSize: mS(13),
        color: '#64748B',
        lineHeight: mS(18),
        marginTop: vS(2),
        fontWeight: '500',
    },
});

export default SafetyScreen;