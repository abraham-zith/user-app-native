import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../../../../constant/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hS, mS, vS } from '../../../../../lib/responsive';
import { useAppTheme } from '../../../../../hooks/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AboutVDrive = () => {
    const insets = useSafeAreaInsets();
    const { colors: appColors, isDark } = useAppTheme();

    // ==================== ANIMATIONS ====================
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // ==================== COMPONENTS ====================
    const InfoBlock = ({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) => {
        const itemFade = useRef(new Animated.Value(0)).current;
        const itemSlide = useRef(new Animated.Value(20)).current;

        useEffect(() => {
            Animated.parallel([
                Animated.timing(itemFade, {
                    toValue: 1,
                    duration: 600,
                    delay: delay,
                    useNativeDriver: true,
                }),
                Animated.timing(itemSlide, {
                    toValue: 0,
                    duration: 600,
                    delay: delay,
                    useNativeDriver: true,
                }),
            ]).start();
        }, []);

        return (
            <Animated.View style={[
                styles.infoBlock,
                { opacity: itemFade, transform: [{ translateY: itemSlide }] },
                { backgroundColor: appColors.card, borderColor: appColors.border }
            ]}>
                <View style={[styles.iconContainer, { backgroundColor: appColors.iconBox }]}>
                    <MaterialCommunityIcons name={icon} size={mS(24)} color={isDark ? '#38BDF8' : colors.button} />
                </View>
                <Text style={[styles.infoTitle, { color: appColors.text }]}>{title}</Text>
                <Text style={[styles.infoDesc, { color: appColors.secondaryText }]}>{desc}</Text>
            </Animated.View>
        );
    };

    const StatItem = ({ label, value }: { label: string; value: string }) => (
        <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: isDark ? '#38BDF8' : colors.button }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: appColors.secondaryText }]}>{label}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: appColors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. HERO SECTION */}
                <Animated.View style={[
                    styles.heroSection,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    { backgroundColor: isDark ? appColors.background : '#F8FAFC' }
                ]}>
                    <View style={styles.logoBadge}>
                        <MaterialCommunityIcons name="car-limousine" size={mS(50)} color="#FFF" />
                    </View>
                    <Text style={[styles.brandName, { color: appColors.text }]}>T2Drive</Text>
                    <Text style={[styles.tagline, { color: appColors.secondaryText }]}>Redefining Your Daily Commute</Text>

                    <View style={[styles.statsRow, { backgroundColor: isDark ? appColors.card : 'rgba(255, 255, 255, 0.8)', borderColor: appColors.border }]}>
                        <StatItem value="100+" label="Rides" />
                        <View style={[styles.statDivider, { backgroundColor: appColors.border }]} />
                        <StatItem value="50+" label="Drivers" />
                        <View style={[styles.statDivider, { backgroundColor: appColors.border }]} />
                        <StatItem value="4.9" label="Rating" />
                    </View>
                </Animated.View>

                {/* 2. MISSION SECTION */}
                <View style={styles.contentPadding}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.accentLine} />
                        <Text style={[styles.sectionTitle, { color: appColors.text }]}>Our Mission</Text>
                    </View>
                    <Text style={[styles.para, { color: appColors.secondaryText }]}>
                        At T2Drive, we're on a mission to revolutionize urban mobility. We believe that getting from point A to point B should be seamless, safe, and sustainable. By connecting thousands of expert drivers with millions of riders, we're building the future of transportation, one ride at a time.
                    </Text>
                </View>

                {/* 3. FEATURES GRID */}
                <View style={styles.featureGrid}>
                    <InfoBlock
                        delay={400}
                        icon="shield-check-outline"
                        title="Safety First"
                        desc="Advanced SOS & verified drivers for your peace of mind."
                    />
                    <InfoBlock
                        delay={500}
                        icon="wallet-outline"
                        title="Best Prices"
                        desc="Premium service at rates that make sense for everyone."
                    />
                    <InfoBlock
                        delay={600}
                        icon="clock-check-outline"
                        title="Rapid Pickup"
                        desc="Our smart algorithms ensure a ride is always nearby."
                    />
                    <InfoBlock
                        delay={700}
                        icon="star-outline"
                        title="Elite Service"
                        desc="Highly rated drivers providing a top-tier experience."
                    />
                </View>

                {/* 4. FOOTER & SOCIALS */}
                <View style={[styles.footer, { backgroundColor: isDark ? appColors.background : '#F8FAFC' }]}>
                    <Text style={[styles.connectLabel, { color: appColors.secondaryText }]}>Connect With Us</Text>
                    <View style={styles.socialRow}>
                        {['facebook', 'instagram', 'twitter'].map((icon, idx) => (
                            <TouchableOpacity key={idx} style={[styles.socialIcon, { backgroundColor: appColors.card, shadowColor: '#000' }]}>
                                <MaterialCommunityIcons name={icon} size={mS(22)} color={isDark ? '#38BDF8' : colors.button} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.legalLinks}>
                        <Text style={[styles.legalText, { color: appColors.secondaryText }]}>Terms of Service</Text>
                        <View style={[styles.dot, { backgroundColor: appColors.border }]} />
                        <Text style={[styles.legalText, { color: appColors.secondaryText }]}>Privacy Policy</Text>
                    </View>

                    <Text style={[styles.versionText, { color: appColors.secondaryText }]}>
                        Made with ❤️ in India{'\n'}
                        <Text style={{ fontWeight: '700', color: appColors.text }}>Version 1.0.4</Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: vS(40),
        paddingBottom: vS(30),
        backgroundColor: '#F8FAFC',
        borderBottomLeftRadius: mS(40),
        borderBottomRightRadius: mS(40),
    },
    logoBadge: {
        width: mS(100),
        height: mS(100),
        borderRadius: mS(35),
        backgroundColor: colors.button,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: colors.button,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    brandName: {
        fontSize: mS(32),
        fontWeight: '900',
        color: '#1E293B',
        marginTop: vS(20),
        letterSpacing: -1,
    },
    tagline: {
        fontSize: mS(14),
        color: '#64748B',
        marginTop: vS(4),
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vS(30),
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: vS(12),
        paddingHorizontal: hS(20),
        borderRadius: mS(20),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: hS(15),
    },
    statValue: {
        fontSize: mS(18),
        fontWeight: '800',
        color: colors.button,
    },
    statLabel: {
        fontSize: mS(11),
        color: '#94A3B8',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        height: vS(20),
        backgroundColor: '#CBD5E1',
    },
    contentPadding: {
        paddingHorizontal: hS(24),
        paddingTop: vS(30),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vS(12),
    },
    accentLine: {
        width: hS(4),
        height: vS(20),
        backgroundColor: colors.button,
        borderRadius: mS(2),
        marginRight: hS(10),
    },
    sectionTitle: {
        fontSize: mS(20),
        fontWeight: '800',
        color: '#1E293B',
    },
    para: {
        fontSize: mS(15),
        color: '#475569',
        lineHeight: vS(24),
        fontWeight: '400',
    },
    featureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: hS(16),
        paddingVertical: vS(20),
        justifyContent: 'space-between',
    },
    infoBlock: {
        width: (SCREEN_WIDTH - hS(48)) / 2,
        backgroundColor: '#FFFFFF',
        padding: mS(16),
        borderRadius: mS(24),
        marginBottom: vS(16),
        borderWidth: 1,
        borderColor: '#F1F5F9',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconContainer: {
        width: mS(48),
        height: mS(48),
        borderRadius: mS(16),
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(12),
    },
    infoTitle: {
        fontSize: mS(16),
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: vS(4),
    },
    infoDesc: {
        fontSize: mS(12),
        color: '#64748B',
        lineHeight: vS(18),
        fontWeight: '500',
    },
    footer: {
        paddingVertical: vS(40),
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        marginTop: vS(20),
        borderTopLeftRadius: mS(40),
        borderTopRightRadius: mS(40),
    },
    connectLabel: {
        fontSize: mS(14),
        fontWeight: '800',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: vS(20),
    },
    socialRow: {
        flexDirection: 'row',
        gap: hS(15),
        marginBottom: vS(30),
    },
    socialIcon: {
        width: mS(48),
        height: mS(48),
        borderRadius: mS(24),
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    legalLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vS(25),
    },
    legalText: {
        fontSize: mS(13),
        color: '#64748B',
        fontWeight: '600',
    },
    dot: {
        width: mS(4),
        height: mS(4),
        borderRadius: mS(2),
        backgroundColor: '#CBD5E1',
        marginHorizontal: hS(12),
    },
    versionText: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: mS(12),
        lineHeight: vS(20),
    },
});

export default AboutVDrive;