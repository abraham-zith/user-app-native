import { ActivityIndicator, Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, TextInput, ToastAndroid, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import { Text } from "../../../../Components"
import { Styles } from "../../../../lib/styles"
import Button from "../../../../Components/Button"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import fonts from "../../../../constant/fonts";
import { useRoute } from "@react-navigation/native";
import colorsConstant from "../../../../constant/colors";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { useEffect, useState, useRef } from "react";
import BottomSheetInput from "../../../../Components/BottomSheetInput";
import { RootState } from '../../../../redux/store';
import { useDispatch, useSelector } from "react-redux";
import { updateUserStore } from "../../../../redux/userSlice";
import { useUpdateUserMutation } from "../../../../service/userApi";
import DateTimePickerComponent from "../../../../Components/DateTimePicker";
import { hS, mS, vS } from "../../../../lib/responsive";
import { ContactScreen_Nav } from "../../../../Navigations/navigations";
import AsyncStorage from "@react-native-async-storage/async-storage";



const ProfileUpdatescreen: React.FC<ScreenProps> = ({ navigation }) => {
    const { colors, isDark } = useAppTheme();
    const route = useRoute<any>();
    const [updateUser] = useUpdateUserMutation();
    const dispatch = useDispatch()

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);

    const user = useSelector((state: RootState) => state.userSlice.user);



    const [visible, setVisible] = useState(false);
    const [clickedLabel, setClickedLabel] = useState('')
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('')
    const [gender, setGender] = useState('');
    const [emergencyContacts, setEmergencyContacts] = useState<{ name: string, phone: string }[]>([]);


    const slideAnim = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        if (!user) return;
        if (user?.first_name) {
            setFirstName(user.first_name);
        }
        if (user.last_name) {
            setLastName(user.last_name);
        }
        if (user?.email) {
            setEmail(user.email);
        }
        if (user?.gender) {
            setGender(user.gender)
        }
        if (user?.emergency_contacts) {
            setEmergencyContacts(user.emergency_contacts)
        }
    }, [user]);


    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [visible]);


    if (!user) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }


    const formatDate = (date: any) => {
        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };



    const formatDatePretty = (isoString: string) => {
        const d = new Date(isoString);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")
            }/${d.getFullYear()}`;
    };

    const buttons = [
        { id: 1, Label: 'Name', data: user.full_name, iconName: 'account-outline' },
        { id: 2, Label: 'Phone Number', data: user.phone_number, iconName: 'phone-outline' },
        { id: 3, Label: 'Email', data: user.email, iconName: 'email-outline' },
        { id: 4, Label: 'Gender', data: user.gender || 'Add gender', iconName: 'gender-male-female' },
        { id: 5, Label: 'Date of Birth', data: user.date_of_birth, iconName: 'cake-variant-outline' },
        { id: 6, Label: 'Account Since', data: formatDate(user.created_at), iconName: 'history' },
        { id: 7, Label: 'Emergency Contact', data: user.emergency_contacts || 'Add Emergency Contacts', iconName: 'phone-plus-outline' },
    ]


    const handleNameUpdate = async (firstName?: string, lastName?: string) => {
        try {
            const userId = user.id; // from context / redux / api call

            const payload = {
                id: userId,
                first_name: firstName,
                last_name: lastName,
            };


            const result = await updateUser(payload).unwrap();

            if (result.success) {
                dispatch(updateUserStore({ first_name: result.data.first_name, last_name: result.data.last_name, full_name: result.data.full_name }));
                ToastAndroid.show(result.message, ToastAndroid.SHORT);
            }
            else {
                ToastAndroid.show('Something Went Wrong!!!', ToastAndroid.SHORT);
            }

            setVisible(false);

        } catch (error) {
            ToastAndroid.show('Something Went Wrong!!!', ToastAndroid.SHORT);
        }
    };

    const handleEmailUpdate = async (email: string) => {
        try {
            const userId = user.id; // from context / redux / api call

            const payload = {
                id: userId,
                email: email,
            };


            const result = await updateUser(payload).unwrap();

            if (result.success) {
                dispatch(updateUserStore(result.data));
                ToastAndroid.show(result.message, ToastAndroid.SHORT);
            }
            else {
                ToastAndroid.show('Something Went Wrong!!!', ToastAndroid.SHORT);
            }

            setVisible(false);

        } catch (error) {
        }
    };

    const handleDobUpdate = async (selectedDate: Date) => {
        try {
            const userId = user.id;

            // const dob = formatDate(new Date(selectedDate));

            const d = new Date(selectedDate);
            const dob = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;



            const payload = {
                id: userId,
                date_of_birth: dob,   // field name in DB
            };

            const result = await updateUser(payload).unwrap();

            // Update redux store

            if (result.success) {
                dispatch(updateUserStore(result.data));
                ToastAndroid.show(result.message, ToastAndroid.SHORT);
            }
            else {
                ToastAndroid.show('Something Went Wrong!!!', ToastAndroid.SHORT);
            } // adjust if your API returns different

            setClickedLabel("");

        } catch (error) {
        }
    };



    const handleGenderUpdate = async (gender: string) => {
        try {
            const userId = user.id; // from context / redux / api call

            const payload = {
                id: userId,
                gender: gender,
            };


            const result = await updateUser(payload).unwrap();

            if (result.success) {
                dispatch(updateUserStore(result.data));
                ToastAndroid.show(result.message, ToastAndroid.SHORT);
            }
            else {
                ToastAndroid.show('Something Went Wrong!!!', ToastAndroid.SHORT);
            }

            setVisible(false);

        } catch (error) {
        }
    };

    const handleAddEmergencyContact = () => {
        navigation.navigate(ContactScreen_Nav, {
            onSelectContact: async (SelectedContact: any) => {
                if (SelectedContact) {

                    const incomingPhone = SelectedContact.phone?.replace(/[^0-9]/g, '') || '';
                    const cleanphone = SelectedContact.phone?.replace(/\+91|\s/g, '');

                    const isDuplicate = emergencyContacts.some(contact => {
                        const existingPhone = contact.phone?.replace(/[^0-9]/g, '');
                        return existingPhone === cleanphone;
                    });

                    if (isDuplicate) {
                        Alert.alert("Already Added", `${SelectedContact.name} is already in your emergency list.`);
                        return;
                    }

                    const newContact = {
                        name: SelectedContact.name,
                        phone: cleanphone || 'No Number',
                    };


                    const updatedList = [...emergencyContacts, newContact].slice(0, 3);
                    try {
                        const payload = {
                            id: user.id,
                            emergency_contacts: updatedList
                        };

                        const response = await updateUser(payload).unwrap();
                        if (response.success) {
                            dispatch(updateUserStore({ emergency_contacts: response.data.emergency_contacts }));
                            ToastAndroid.show("Emergency contact updated successfully", ToastAndroid.SHORT);
                        }

                        setEmergencyContacts(updatedList);
                        await AsyncStorage.setItem('@emergency_contacts', JSON.stringify(updatedList));
                        // Alert.alert("Success", `${newContact.name} saved to your Emergency Contacts.`);
                    } catch (error) {
                        // console.error("Update failed:", error);
                        ToastAndroid.show("Something Went Wrong!!! Try Later...", ToastAndroid.SHORT);
                        // Alert.alert("Error", "Failed to sync contacts with the server.");
                    }
                    navigation.goBack();
                }
            },
        });
        // navigation.goBack();

    }


    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: vS(30) }}
            >
                {/* --- Section: Personal Details --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.lightTextColor }]}>Personal Information</Text>
                </View>

                <View style={[styles.cardContainer, { backgroundColor: colors.card }, isDark && { shadowColor: colors.text }]}>
                    {buttons.slice(0, 5).map((item, index) => {
                        const isEditable = ['Name', 'Email', 'Date of Birth', 'Gender'].includes(item.Label);
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={isEditable ? 0.7 : 1}
                                style={[
                                    styles.actionRow,
                                    index === 0 && styles.firstRow,
                                    index === 4 && styles.lastRow,
                                    !isEditable && { backgroundColor: isDark ? colors.background : '#F8FAFC' },
                                    { borderBottomColor: colors.divider }
                                ]}
                                onPress={() => {
                                    if (isEditable) {
                                        setClickedLabel(item.Label);
                                        setVisible(true);
                                    }
                                }}
                            >
                                <View style={[styles.rowIconBox, { backgroundColor: colors.iconBox }]}>
                                    <MaterialCommunityIcons
                                        name={item.iconName}
                                        size={mS(20)}
                                        color={isEditable ? (isDark ? colors.primary : colors.button) : colors.lightTextColor}
                                    />
                                </View>

                                <View style={styles.rowContent}>
                                    <Text style={[styles.rowLabel, { color: colors.lightTextColor }]}>{item.Label}</Text>
                                    <Text style={[
                                        styles.rowValue,
                                        { color: colors.text },
                                        !isEditable && { color: colors.lightTextColor }
                                    ]}>
                                        {item.Label === 'Date of Birth' ? formatDatePretty(item.data) : item.data}
                                    </Text>
                                </View>

                                {isEditable && (
                                    <MaterialCommunityIcons name="chevron-right" size={mS(20)} color={colors.border} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* --- Section: Account Details --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.lightTextColor }]}>Account Details</Text>
                </View>

                <View style={[styles.cardContainer, { backgroundColor: colors.card }, isDark && { shadowColor: colors.text }]}>
                    {/* Account Since (Static) */}
                    <View style={[
                        styles.actionRow,
                        styles.firstRow,
                        styles.lastRow,
                        { backgroundColor: isDark ? colors.background : '#F8FAFC' },
                        { borderBottomWidth: 0 }
                    ]}>
                        <View style={[styles.rowIconBox, { backgroundColor: colors.iconBox }]}>
                            <MaterialCommunityIcons name="history" size={mS(20)} color={colors.lightTextColor} />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowLabel, { color: colors.lightTextColor }]}>Account Since</Text>
                            <Text style={[styles.rowValue, { color: colors.lightTextColor }]}>{formatDate(user.created_at)}</Text>
                        </View>
                    </View>
                </View>

                {/* --- Section: Emergency Contacts --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.lightTextColor }]}>Emergency Contacts</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>Up to 3 trusted contacts</Text>
                </View>

                <View style={[styles.cardContainer, { backgroundColor: colors.card }, isDark && { shadowColor: colors.text }]}>
                    <View style={[styles.emergencyContainer, styles.firstRow, styles.lastRow]}>
                        <View style={styles.emergencyHeader}>
                            <View style={styles.emergencyIconTitle}>
                                <MaterialCommunityIcons name="phone-plus-outline" size={mS(20)} color={isDark ? colors.primary : colors.button} />
                                <Text style={[styles.rowLabel, { color: colors.lightTextColor }]}>Emergency Contacts</Text>
                            </View>

                            <TouchableOpacity
                                disabled={emergencyContacts.length >= 3}
                                style={[
                                    styles.addBadge,
                                    { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : '#EFF6FF' },
                                    emergencyContacts.length >= 3 && { backgroundColor: colors.iconBox }
                                ]}
                                onPress={handleAddEmergencyContact}
                            >
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={mS(16)}
                                    color={emergencyContacts.length >= 3 ? colors.border : (isDark ? colors.primary : colors.button)}
                                />
                                <Text style={[
                                    styles.addBadgeText,
                                    { color: isDark ? colors.primary : colors.button },
                                    emergencyContacts.length >= 3 && { color: colors.lightTextColor }
                                ]}>Add</Text>
                            </TouchableOpacity>
                        </View>

                        {emergencyContacts.length > 0 ? (
                            <View style={styles.contactsList}>
                                {emergencyContacts.map((contact, idx) => (
                                    <View key={idx} style={[styles.contactItem, { backgroundColor: isDark ? colors.iconBox : '#F8FAFC' }]}>
                                        <View style={[styles.contactAvatar, { backgroundColor: isDark ? colors.primary : colors.button }]}>
                                            <Text style={styles.contactInitial}>{contact.name.charAt(0)}</Text>
                                        </View>
                                        <View style={styles.contactInfo}>
                                            <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                                            <Text style={[styles.contactPhone, { color: colors.lightTextColor }]}>{contact.phone}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.noContactsBox}>
                                <Text style={[styles.noContactsText, { color: colors.lightTextColor }]}>No emergency contacts added yet.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* --- Modals / Bottom Sheets --- */}
            {clickedLabel === 'Name' &&
                <BottomSheetInput
                    visible={visible}
                    label="Edit Name"
                    fields={[
                        {
                            key: "firstName",
                            placeholder: "First Name",
                            value: firstName,
                            icon: "account"
                        },
                        {
                            key: "lastName",
                            placeholder: "Last Name",
                            value: lastName,
                            icon: "account"
                        }
                    ]}
                    onChange={(key, value) => {
                        if (key === "firstName") setFirstName(value);
                        if (key === "lastName") setLastName(value);
                    }}
                    onSave={() => handleNameUpdate(firstName, lastName)}
                    onClose={() => setVisible(false)}
                    backgroundColor={colors.background}
                />
            }

            {clickedLabel === 'Email' &&
                <BottomSheetInput
                    visible={visible}
                    label="Edit Email"
                    fields={[
                        {
                            key: "email",
                            placeholder: "Email",
                            value: email,
                            icon: "account"
                        }
                    ]}
                    onChange={(key, value) => {
                        if (key === "email") setEmail(value);
                    }}
                    onSave={() => handleEmailUpdate(email)}
                    onClose={() => setVisible(false)}
                    backgroundColor={colors.background}
                />
            }

            {clickedLabel === 'Gender' && (
                <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
                    <Pressable style={localStyles.modalOverlay} onPress={() => setVisible(false)}>
                        <Animated.View
                            style={[
                                localStyles.genderSheet,
                                { backgroundColor: colors.background }
                            ]}
                        >
                            <View style={localStyles.dragHandle} />
                            <Text style={[localStyles.genderSheetTitle, { color: colors.text }]}>Select Gender</Text>

                            <View style={localStyles.optionsWrapper}>
                                {['Male', 'Female', 'Other'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        activeOpacity={0.7}
                                        style={[
                                            localStyles.genderOption,
                                            { backgroundColor: colors.card, borderColor: colors.border },
                                            gender === option.toLowerCase() && { borderColor: isDark ? colors.primary : colors.button, backgroundColor: isDark ? colors.iconBox : '#F8FAFC' }
                                        ]}
                                        onPress={() => setGender(option.toLowerCase())}
                                    >
                                        <View style={localStyles.optionLabelGroup}>
                                            <View style={[
                                                localStyles.optionIconBox,
                                                { backgroundColor: colors.iconBox },
                                                gender === option.toLowerCase() && { backgroundColor: isDark ? colors.background : '#EFF6FF' }
                                            ]}>
                                                <MaterialCommunityIcons
                                                    name={option === 'Male' ? 'gender-male' : option === 'Female' ? 'gender-female' : 'gender-non-binary'}
                                                    size={mS(22)}
                                                    color={gender === option.toLowerCase() ? isDark ? colors.primary : colors.button : colors.lightTextColor}
                                                />
                                            </View>
                                            <Text style={[
                                                localStyles.optionText,
                                                { color: colors.text },
                                                gender === option.toLowerCase() && { color: isDark ? colors.primary : colors.button, fontWeight: '800' }
                                            ]}>
                                                {option}
                                            </Text>
                                        </View>

                                        <View style={[
                                            localStyles.customRadio,
                                            { borderColor: colors.border },
                                            gender === option.toLowerCase() && { borderColor: isDark ? colors.primary : colors.button }
                                        ]}>
                                            {gender === option.toLowerCase() && <View style={[localStyles.radioDot, { backgroundColor: isDark ? colors.primary : colors.button }]} />}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[localStyles.genderSaveBtn, { backgroundColor: isDark ? colors.primary : colors.button, shadowColor: isDark ? colors.primary : colors.button }]}
                                onPress={() => {
                                    handleGenderUpdate(gender);
                                    setVisible(false);
                                }}
                            >
                                <Text style={localStyles.genderSaveBtnText}>Save Changes</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Pressable>
                </Modal>
            )}

            {clickedLabel === 'Date of Birth' &&
                <DateTimePickerComponent
                    value={new Date()}
                    mode={'date'}
                    isVisible={clickedLabel === 'Date of Birth'}
                    onChange={handleDobUpdate}
                    onClose={() => setClickedLabel('')}
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                    minimumDate={minDate}
                />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        marginTop: vS(24),
        marginHorizontal: hS(20),
        marginBottom: vS(8),
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: mS(14),
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionSubtitle: {
        fontSize: mS(11),
        color: '#94A3B8',
        fontWeight: '500',
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
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(16),
        paddingHorizontal: hS(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    firstRow: {
        borderTopLeftRadius: mS(20),
        borderTopRightRadius: mS(20),
    },
    lastRow: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: mS(20),
        borderBottomRightRadius: mS(20),
    },
    disabledRow: {
        backgroundColor: '#F8FAFC',
    },
    rowIconBox: {
        width: mS(40),
        height: mS(40),
        borderRadius: mS(12),
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowContent: {
        flex: 1,
        marginLeft: hS(16),
    },
    rowLabel: {
        fontSize: mS(13),
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: vS(2),
    },
    rowValue: {
        fontSize: mS(15),
        color: '#334155',
        fontWeight: '700',
    },
    disabledText: {
        color: '#94A3B8',
    },
    emergencyContainer: {
        padding: hS(16),
    },
    emergencyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(16),
    },
    emergencyIconTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(12),
    },
    addBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: hS(12),
        paddingVertical: vS(6),
        borderRadius: mS(20),
        gap: hS(4),
    },
    addBadgeDisabled: {
        backgroundColor: '#F1F5F9',
    },
    addBadgeText: {
        fontSize: mS(13),
        fontWeight: '700',
        color: colorsConstant.button,
    },
    addBadgeTextDisabled: {
        color: '#94A3B8',
    },
    contactsList: {
        gap: vS(12),
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: mS(12),
        borderRadius: mS(12),
    },
    contactAvatar: {
        width: mS(36),
        height: mS(36),
        borderRadius: mS(18),
        backgroundColor: colorsConstant.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactInitial: {
        color: 'white',
        fontWeight: '800',
        fontSize: mS(14),
    },
    contactInfo: {
        marginLeft: hS(12),
    },
    contactName: {
        fontSize: mS(14),
        fontWeight: '700',
        color: '#334155',
    },
    contactPhone: {
        fontSize: mS(12),
        color: '#64748B',
        marginTop: vS(2),
    },
    noContactsBox: {
        paddingVertical: vS(20),
        alignItems: 'center',
    },
    noContactsText: {
        color: '#94A3B8',
        fontSize: mS(14),
        fontStyle: 'italic',
    },
});

export default ProfileUpdatescreen;

const localStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    genderSheet: {
        borderTopLeftRadius: mS(32),
        borderTopRightRadius: mS(32),
        paddingHorizontal: hS(24),
        paddingBottom: vS(40),
        paddingTop: vS(12),
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    dragHandle: {
        width: hS(40),
        height: vS(5),
        backgroundColor: '#E2E8F0',
        borderRadius: mS(10),
        alignSelf: 'center',
        marginBottom: vS(24),
    },
    genderSheetTitle: {
        fontSize: mS(20),
        fontWeight: '800',
        // color: '#1E293B',
        marginBottom: vS(20),
    },
    optionsWrapper: {
        gap: vS(12),
    },
    genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: mS(14),
        borderRadius: mS(16),
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    activeOption: {
        borderColor: colorsConstant.button,
        backgroundColor: '#F8FAFC',
    },
    optionLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIconBox: {
        width: mS(44),
        height: mS(44),
        borderRadius: mS(12),
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(14),
    },
    optionText: {
        fontSize: mS(16),
        fontWeight: '600',
        color: '#475569',
    },
    customRadio: {
        height: mS(22),
        width: mS(22),
        borderRadius: mS(11),
        borderWidth: 2,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        height: mS(10),
        width: mS(10),
        borderRadius: mS(5),
        backgroundColor: colorsConstant.button,
    },
    genderSaveBtn: {
        backgroundColor: colorsConstant.button,
        marginTop: vS(24),
        height: vS(60),
        borderRadius: mS(20),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colorsConstant.button,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    genderSaveBtnText: {
        color: '#FFF',
        fontSize: mS(17),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});