// import React, { useEffect, useState } from 'react';
// import {
//     View, Text, FlatList, TextInput, StyleSheet,
//     TouchableOpacity, ActivityIndicator, PermissionsAndroid, Platform
// } from 'react-native';
// import Contacts from 'react-native-contacts';
// import { hS, mS, vS } from '../../lib/responsive';
// import colors from '../../constant/colors';

// const ContactListScreen = ({ navigation, route }: any) => {
//     const [contacts, setContacts] = useState<any[]>([]);
//     const { onSelectContact } = route.params;
//     const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');

//     useEffect(() => {
//         loadContacts();
//     }, []);

//     const openCreateContactForm = () => {
//         const newPerson = {
//             givenName: "", // You can pre-fill this if you want
//             phoneNumbers: [{ label: "mobile", number: "" }],
//         };

//         Contacts.openContactForm(newPerson).then((contact) => {
//             // This is called when the user saves the contact
//             if (contact) {
//                 loadContacts(); // Refresh your list to show the new contact
//             }
//         }).catch(err => console.warn(err));
//     };

//     const loadContacts = async () => {
//         try {
//             if (Platform.OS === 'android') {
//                 const granted = await PermissionsAndroid.request(
//                     PermissionsAndroid.PERMISSIONS.READ_CONTACTS
//                 );
//                 if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
//             }

//             const allContacts = await Contacts.getAll();
//             // Sort alphabetically
//             const sorted = allContacts.sort((a, b) =>
//                 (a.displayName || "").localeCompare(b.displayName || "")
//             );
//             setContacts(sorted);
//             setFilteredContacts(sorted);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSearch = (text: string) => {
//         setSearch(text);
//         const filtered = contacts.filter(c =>
//             c.displayName?.toLowerCase().includes(text.toLowerCase()) ||
//             c.phoneNumbers.some((p: any) => p.number.includes(text))
//         );
//         setFilteredContacts(filtered);
//     };

//     const renderItem = ({ item }: any) => {
//         const phone = item.phoneNumbers[0]?.number || "No number";
//         const initials = item.displayName ? item.displayName[0] : "?";

//         return (
//             <TouchableOpacity
//                 style={styles.contactCard}
//                 onPress={() => onSelectContact({ name: item.displayName, phone })}
//             >
//                 <View style={styles.avatar}><Text style={styles.avatarText}>{initials.toUpperCase()}</Text></View>
//                 <View>
//                     <Text style={styles.name}>{item.displayName}</Text>
//                     <Text style={styles.phone}>{phone}</Text>
//                 </View>
//             </TouchableOpacity>
//         );
//     };

//     if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

//     return (
//         <View style={[styles.container, {
//             paddingVertical: vS(20)
//         }]}>

//             <TextInput
//                 style={styles.searchBar}
//                 placeholder="Search contacts..."
//                 placeholderTextColor={'#ccc'}
//                 value={search}
//                 onChangeText={handleSearch}
//             />
//             <View style={styles.section}>
//                 <View style={styles.sectionHeader}>
//                     <Text style={styles.sectionTitle}>All Contacts</Text>
//                     <TouchableOpacity style={styles.createButton} onPress={openCreateContactForm}>
//                         <Text style={styles.createButtonText}>+ New</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//             <FlatList
//                 data={filteredContacts}
//                 keyExtractor={(item) => item.recordID || item.rawContactId}
//                 renderItem={renderItem}
//                 initialNumToRender={15}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F8FAFC', // Soft off-white
//     },
//     // Search Bar - Floating effect
//     searchBar: {
//         marginHorizontal: hS(20),
//         marginTop: vS(10),
//         paddingHorizontal: hS(16),
//         paddingVertical: vS(12),
//         borderRadius: mS(14),
//         backgroundColor: '#FFFFFF',
//         fontSize: mS(16),
//         color: '#1E293B',
//         // Shadow for iOS
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 10,
//         // Elevation for Android
//         elevation: 3,
//         borderWidth: Platform.OS === 'android' ? 1 : 0,
//         borderColor: '#E2E8F0',
//     },
//     section: {
//         marginTop: vS(24),
//         paddingHorizontal: hS(20),
//     },
//     sectionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: vS(16),
//     },
//     sectionTitle: {
//         fontSize: mS(20),
//         fontWeight: '800', // Extra bold for a modern look
//         color: '#0F172A',
//         letterSpacing: -0.5,
//     },
//     createButton: {
//         backgroundColor: colors.button || '#007AFF',
//         paddingVertical: vS(8),
//         paddingHorizontal: hS(16),
//         borderRadius: mS(20), // Pill shape
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     createButtonText: {
//         color: '#FFF',
//         fontSize: mS(14),
//         fontWeight: '700',
//     },
//     // Contact Cards
//     contactCard: {
//         flexDirection: 'row',
//         marginHorizontal: hS(20),
//         marginVertical: vS(4), // Slight gap between cards
//         padding: hS(12),
//         alignItems: 'center',
//         backgroundColor: '#FFFFFF',
//         borderRadius: mS(16),
//         // Subtle Border
//         borderWidth: 1,
//         borderColor: '#F1F5F9',
//     },
//     avatar: {
//         width: hS(52),
//         height: hS(52),
//         borderRadius: hS(26),
//         backgroundColor: '#E0F2FE', // Light blue background
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: hS(16),
//     },
//     avatarText: {
//         color: '#007AFF', // Darker blue text
//         fontSize: mS(18),
//         fontWeight: '700',
//     },
//     name: {
//         fontSize: mS(16),
//         fontWeight: '600',
//         color: '#1E293B',
//         marginBottom: vS(2),
//     },
//     phone: {
//         color: '#64748B', // Muted slate color
//         fontSize: mS(13),
//         fontWeight: '400',
//     },
// });

// export default ContactListScreen;

import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, SectionList, TextInput, StyleSheet,
    TouchableOpacity, ActivityIndicator, PermissionsAndroid, Platform,
    Image,
    Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Contacts from 'react-native-contacts';
import { hS, mS, vS } from '../../lib/responsive';
import colors from '../../constant/colors';
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAppTheme } from '../../hooks/useAppTheme';

const ContactListScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useAppTheme();
    const insets = useSafeAreaInsets();
    const [contacts, setContacts] = useState<any[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const { onSelectContact } = route.params;

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
            }

            const allContacts = await Contacts.getAll();
            const sorted = allContacts.sort((a, b) =>
                (a.displayName || "").localeCompare(b.displayName || "")
            );
            setContacts(sorted);
            setFilteredContacts(sorted);
        } catch (err) {
            Alert.alert('Something Went Wrong!!!', 'Try Again Later');
            // console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Group contacts by their first letter
    const formatDataForSections = (data: any[]) => {
        const sectionsMap: { [key: string]: any[] } = {};

        data.forEach(item => {
            const char = item.displayName ? item.displayName[0].toUpperCase() : '#';
            const key = /[A-Z]/.test(char) ? char : '#';
            if (!sectionsMap[key]) sectionsMap[key] = [];
            sectionsMap[key].push(item);
        });

        return Object.keys(sectionsMap)
            .sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
            .map(key => ({
                title: key,
                data: sectionsMap[key],
            }));
    };

    const sections = useMemo(() => formatDataForSections(filteredContacts), [filteredContacts]);

    const handleSearch = (text: string) => {
        setSearch(text);
        const filtered = contacts.filter(c =>
            c.displayName?.toLowerCase().includes(text.toLowerCase()) ||
            c.phoneNumbers.some((p: any) => p.number.replace(/\D/g, '').includes(text))
        );
        setFilteredContacts(filtered);
    };

    const openCreateContactForm = () => {
        const newPerson = {
            givenName: "",
            phoneNumbers: [{ label: "mobile", number: "" }],
        };
        Contacts.openContactForm(newPerson).then((contact) => {
            if (contact) loadContacts();
        }).catch(() => {});
    };

    // const openEditContactForm = (item: any) => {
    //     // The 'item' must be the full contact object returned by Contacts.getAll()
    //     Contacts.openExistingContact(item)
    //         .then((updatedContact) => {
    //             // If the user saves changes, updatedContact is returned
    //             if (updatedContact) {
    //                 loadContacts(); // Refresh list to show new info
    //             }
    //         })
    //         .catch(err => console.warn("Edit failed: ", err));
    // };

    const renderItem = ({ item }: any) => {

        const rawPhone = item.phoneNumbers[0]?.number || "";
        const phone = item.phoneNumbers[0]?.number || "No number";
        // const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
        const initials = item.displayName ? item.displayName[0] : "?";

        return (
            <TouchableOpacity
                style={[styles.contactCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                onPress={() => onSelectContact({ name: item.displayName, phone: phone })}
            >
                <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#152D5E33' }]}>
                    {item.thumbnailPath ? (
                        <Image source={{ uri: item.thumbnailPath }} style={styles.avatarImage} />
                    ) : (
                        <Text style={[styles.avatarText, { color: isDark ? colors.primary : colors.button }]}>{initials.toUpperCase()}</Text>
                    )}
                </View>
                <View style={styles.contactInfo}>
                    <Text style={[styles.name, { color: colors.text }]}>{item.displayName}</Text>
                    <Text style={[styles.phone, { color: colors.secondaryText }]}>{rawPhone}</Text>
                </View>
                {/* <TouchableOpacity onPress={() => openEditContactForm(item)} style={{ padding: 10 }}>
                    <AntDesign name="edit" size={18} color="#94A3B8" />
                </TouchableOpacity> */}
            </TouchableOpacity>
        );
    };

    if (loading) return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
            <ActivityIndicator color={colors.button} size="large" />
        </View>
    );

    return (
        <View style={[styles.container, {
            backgroundColor: colors.background
        }]}>
            {/* Header Area */}
            <View style={[styles.navHeader, { paddingTop: insets.top, backgroundColor: colors.background }]}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialCommunityIcons name="arrow-left" size={mS(24)} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.navTitle, { color: colors.text }]}>Select Contact</Text>
            </View>

            <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.searchSection, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                    <AntDesign name="search1" size={20} color={colors.secondaryText} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchBar, { color: colors.text }]}
                        placeholder="Search contacts..."
                        placeholderTextColor={colors.secondaryText}
                        value={search}
                        onChangeText={handleSearch}
                    />
                </View>
                <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Contacts</Text>
                    <TouchableOpacity style={styles.createButton} onPress={openCreateContactForm}>
                        <Text style={styles.createButtonText}>+ New</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.recordID || item.rawContactId}
                renderItem={renderItem}
                stickySectionHeadersEnabled={true}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={[styles.alphabetHeader, { backgroundColor: isDark ? colors.background : '#F1F5F9' }]}>
                        <Text style={[styles.alphabetText, { color: colors.secondaryText }]}>{title}</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerContainer: {
        paddingTop: vS(10),
        backgroundColor: '#F8FAFC',
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: hS(20),
        marginTop: vS(10),
        borderRadius: mS(12),
        // Shadow Effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    searchIcon: {
        paddingLeft: hS(15),
    },
    searchBar: {
        flex: 1, // Takes up remaining space
        paddingRight: hS(16),
        paddingLeft: hS(10), // Space between icon and text
        paddingVertical: vS(12),
        fontSize: mS(16),
        color: '#152D5E',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: hS(20),
        marginTop: vS(15),
        marginBottom: vS(10),
    },
    sectionTitle: {
        fontSize: mS(22),
        fontWeight: '800',
        color: '#0F172A',
    },
    createButton: {
        backgroundColor: colors.button,
        paddingVertical: vS(6),
        paddingHorizontal: hS(14),
        borderRadius: mS(20),
    },
    createButtonText: {
        color: '#FFF',
        fontSize: mS(14),
        fontWeight: '700',
    },
    alphabetHeader: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: hS(20),
        paddingVertical: vS(4),
    },
    alphabetText: {
        fontSize: mS(13),
        fontWeight: '700',
        color: '#64748B',
    },
    listContent: {
        paddingBottom: vS(30),
    },
    contactCard: {
        flexDirection: 'row',
        marginHorizontal: hS(20),
        marginVertical: vS(4),
        padding: hS(12),
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: mS(16),
        // Subtle Border
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#F1F5F9',
    },
    avatar: {
        width: hS(44),
        height: hS(44),
        borderRadius: hS(22),
        backgroundColor: '#152D5E33',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(16),
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: hS(22),
    },
    avatarText: {
        color: colors.button,
        fontSize: mS(16),
        fontWeight: '700',
    },
    contactInfo: {
        flex: 1,
    },
    name: {
        fontSize: mS(16),
        fontWeight: '600',
        color: '#1E293B',
    },
    phone: {
        color: '#64748B',
        fontSize: mS(13),
        marginTop: vS(2),
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(16),
        paddingVertical: vS(12),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: mS(8),
        marginRight: hS(8),
    },
    navTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        letterSpacing: -0.5,
    },
});

export default ContactListScreen;