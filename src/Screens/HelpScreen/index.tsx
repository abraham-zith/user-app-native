import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, TextInput, Linking, Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FAQDetailsScreen_Nav } from '../../Navigations/navigations';
import { useNavigation } from '@react-navigation/native';
import colors from '../../constant/colors';
import { useAppTheme } from '../../hooks/useAppTheme';
import { hS, mS, vS } from '../../lib/responsive';

const FAQ_CATEGORIES = [
    {
        id: 'ride',
        title: 'Ride Related Queries',
        icon: 'car-connected',
        faqs: [
            { id: 'r1', question: 'How do I track my Vdrive?', answer: 'You can track your ride in real-time from the active bookings tab.' },
            { id: 'r2', question: 'Can I change my destination mid-ride?', answer: 'Yes, you can update the destination in-app during an active ride.' }
        ]
    },
    {
        id: 'driver',
        title: 'Driver Related Queries',
        icon: 'account-tie',
        faqs: [
            { id: 'd1', question: 'How to rate my driver?', answer: 'Once the trip ends, a rating star screen will automatically appear.' },
            { id: 'd2', question: 'What if my driver is late?', answer: 'You can call the driver via the app or cancel the ride if they exceed the ETA.' }
        ]
    },
    {
        id: 'payment',
        title: 'Payment Related Queries',
        icon: 'credit-card-outline',
        faqs: [
            { id: 'p1', question: 'What are the payment methods?', answer: 'We accept Credit/Debit cards, UPI, and digital wallets like Paytm.' },
            { id: 'p2', question: 'Is my payment secure?', answer: 'Yes, all transactions are encrypted and follow PCI-DSS standards.' }
        ]
    }
];

const HelpScreen: React.FC<ScreenProps> = () => {
    const [search, setSearch] = useState('');
    const navigation = useNavigation<any>();
    const { colors: appColors, isDark } = useAppTheme();

    const handleCall = () => {
        Linking.openURL('tel:+1234567890').catch(() =>
            Alert.alert('Error', 'Call feature is not supported on this device')
        );
    };

    const handleEmail = () => {
        Linking.openURL('mailto:support@vdrive.com?subject=Help Request').catch(() =>
            Alert.alert('Error', 'Email feature is not supported on this device')
        );
    };

    const filteredCategories = FAQ_CATEGORIES.filter(cat =>
        cat.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* --- MODERN SUPPORT HEADER --- */}
                <View style={[styles.supportHeader, { backgroundColor: appColors.card, shadowColor: isDark ? '#000' : '#64748B' }]}>
                    <Text style={[styles.headerTitle, { color: appColors.text }]}>How can we help you?</Text>
                    <Text style={[styles.headerSubtitle, { color: appColors.lightTextColor }]}>Our team is here to support you 24/7</Text>

                    <View style={styles.contactRow}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={[styles.contactCard, { backgroundColor: appColors.card, borderColor: appColors.border, shadowColor: isDark ? '#000' : '#64748B' }]}
                            onPress={handleCall}
                        >
                            <View style={[styles.contactIconCircle, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
                                <MaterialCommunityIcons name="phone" size={mS(24)} color="#10B981" />
                            </View>
                            <Text style={[styles.contactLabel, { color: appColors.text }]}>Call Us</Text>
                            <Text style={[styles.contactSublabel, { color: appColors.lightTextColor }]}>Instant Support</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={[styles.contactCard, { backgroundColor: appColors.card, borderColor: appColors.border, shadowColor: isDark ? '#000' : '#64748B' }]}
                            onPress={handleEmail}
                        >
                            <View style={[styles.contactIconCircle, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
                                <MaterialCommunityIcons name="email" size={mS(24)} color="#3B82F6" />
                            </View>
                            <Text style={[styles.contactLabel, { color: appColors.text }]}>Email Us</Text>
                            <Text style={[styles.contactSublabel, { color: appColors.lightTextColor }]}>Within 24 hours</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- POLISHED SEARCH BAR --- */}
                <View style={styles.searchWrapper}>
                    <View style={[styles.searchContainer, { backgroundColor: appColors.card, borderColor: appColors.border, shadowColor: isDark ? '#000' : '#64748B' }]}>
                        <MaterialCommunityIcons name="magnify" size={mS(22)} color={appColors.lightTextColor} />
                        <TextInput
                            placeholder="Search help topics..."
                            placeholderTextColor={appColors.lightTextColor}
                            style={[styles.searchInput, { color: appColors.text }]}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {/* --- FAQ CATEGORIES SECTION --- */}
                <View style={styles.faqSection}>
                    <Text style={[styles.sectionTitle, { color: appColors.text }]}>Browse Categories</Text>
                    <View style={[styles.cardContainer, { backgroundColor: appColors.card, shadowColor: isDark ? '#000' : '#64748B' }]}>
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat, index) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.categoryActionRow,
                                        { borderBottomColor: appColors.border },
                                        index === filteredCategories.length - 1 && { borderBottomWidth: 0 }
                                    ]}
                                    onPress={() =>
                                        navigation.navigate(FAQDetailsScreen_Nav, {
                                            title: cat.title,
                                            questions: cat.faqs
                                        })
                                    }
                                >
                                    <View style={[styles.categoryIconBox, { backgroundColor: appColors.iconBox }]}>
                                        <MaterialCommunityIcons name={cat.icon} size={mS(22)} color={isDark ? appColors.text : colors.button} />
                                    </View>
                                    <View style={styles.categoryContent}>
                                        <Text style={[styles.categoryTitle, { color: appColors.text }]}>{cat.title}</Text>
                                        <Text style={[styles.categorySub, { color: appColors.lightTextColor }]}>{cat.faqs.length} Questions Available</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={mS(20)} color={appColors.border} />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.noResultsBox}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={mS(32)} color={appColors.lightTextColor} />
                                <Text style={[styles.noResultsText, { color: appColors.lightTextColor }]}>No help topics found for "{search}"</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.footerInfo}>
                    <Text style={[styles.footerText, { color: appColors.lightTextColor }]}>Version 1.0.42 (Beta)</Text>
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
    scrollContent: {
        paddingBottom: vS(40)
    },
    supportHeader: {
        paddingTop: vS(8),
        paddingHorizontal: hS(20),
        paddingBottom: vS(32),
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: mS(30),
        borderBottomRightRadius: mS(30),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    headerTitle: {
        fontSize: mS(24),
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: mS(14),
        color: '#64748B',
        marginTop: vS(4),
        fontWeight: '500',
        marginBottom: vS(16),
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: hS(16),
    },
    contactCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: mS(16),
        borderRadius: mS(20),
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    contactIconCircle: {
        width: mS(52),
        height: mS(52),
        borderRadius: mS(26),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(12),
    },
    contactLabel: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#1E293B',
    },
    contactSublabel: {
        fontSize: mS(12),
        color: '#94A3B8',
        marginTop: vS(2),
        fontWeight: '500',
    },
    searchWrapper: {
        marginTop: vS(24),
        paddingHorizontal: hS(20),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: hS(16),
        borderRadius: mS(16),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: vS(54),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: hS(12),
        fontSize: mS(15),
        color: '#1E293B',
        fontWeight: '500',
    },
    faqSection: {
        marginTop: vS(32),
        paddingHorizontal: hS(20),
    },
    sectionTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: vS(16),
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(24),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 4,
        overflow: 'hidden',
    },
    categoryActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: mS(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    categoryIconBox: {
        width: mS(44),
        height: mS(44),
        borderRadius: mS(14),
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(16),
    },
    categoryContent: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#1E293B',
    },
    categorySub: {
        fontSize: mS(12),
        color: '#64748B',
        marginTop: vS(2),
        fontWeight: '500',
    },
    noResultsBox: {
        padding: vS(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    noResultsText: {
        fontSize: mS(14),
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: vS(12),
        textAlign: 'center',
    },
    footerInfo: {
        marginTop: vS(40),
        alignItems: 'center',
    },
    footerText: {
        fontSize: mS(12),
        color: '#94A3B8',
        fontWeight: '500',
    },
});

export default HelpScreen;