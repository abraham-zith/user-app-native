import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { useAppTheme } from '../../../../hooks/useAppTheme';
import { hS, mS, vS } from '../../../../lib/responsive';
import colors from '../../../../constant/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RatingInfoScreen = () => {
    const insets = useSafeAreaInsets();
    const { colors: appColors, isDark } = useAppTheme();
    const steps = [
        {
            id: 1,
            title: "Drivers rate you",
            desc: "After every ride, the Captain rates your trip from 1 to 5 stars based on behavior and punctuality.",
            icon: "star-shooting-outline",
            color: "#F59E0B",
            delay: 300
        },
        {
            id: 2,
            title: "Anonymity is key",
            desc: "Your rating is private. Captains cannot see individual ratings you give them, and they can't see who gave you a score.",
            icon: "shield-account",
            color: "#6366F1",
            delay: 500
        },
        {
            id: 3,
            title: "Mathematical Average",
            desc: "We take the sum of all your star points and divide it by the total number of rated trips.",
            icon: "calculator-variant-outline",
            color: "#10B981",
            delay: 700
        },
        {
            id: 4,
            title: "Rolling 500 Trips",
            desc: "To keep things fair, only your last 500 rated trips count. Old scores won't haunt you forever.",
            icon: "history",
            color: "#3B82F6",
            delay: 900
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + vS(40) }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* PREMIUM HERO SECTION */}
                <Animated.View entering={FadeInDown.duration(800)} style={styles.heroSection}>
                    <View style={[styles.heroCard, { shadowColor: isDark ? '#000' : colors.button }]}>
                        <View style={styles.heroIconBox}>
                            <Icon name="star-face" size={mS(48)} color="#FFF" />
                        </View>
                        <Text style={styles.heroTitle}>Your Community Reputation</Text>
                        <Text style={styles.heroSubtitle}>Understanding how ratings empower the T2Drive network</Text>
                    </View>
                </Animated.View>

                {/* INSIGHT TIMELINE */}
                <View style={styles.timelineContainer}>
                    {steps.map((step, index) => (
                        <Animated.View
                            key={step.id}
                            entering={FadeInLeft.delay(step.delay).duration(600)}
                            style={styles.stepItem}
                        >
                            <View style={styles.timelineAnchor}>
                                <View style={[styles.outerDot, { borderColor: step.color + '40', backgroundColor: appColors.background }]}>
                                    <View style={[styles.innerDot, { backgroundColor: step.color }]} />
                                </View>
                                {index !== steps.length - 1 && <View style={[styles.verticalLine, { backgroundColor: appColors.border }]} />}
                            </View>

                            <View style={[styles.stepCard, { backgroundColor: appColors.card, shadowColor: isDark ? '#000' : '#000' }]}>
                                <View style={[styles.stepIconBox, { backgroundColor: step.color + '15' }]}>
                                    <Icon name={step.icon} size={mS(24)} color={step.color} />
                                </View>
                                <View style={styles.stepTextContent}>
                                    <Text style={[styles.stepTitle, { color: appColors.text }]}>{step.title}</Text>
                                    <Text style={[styles.stepDesc, { color: appColors.lightTextColor }]}>{step.desc}</Text>
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* FORMULA CARD */}
                <Animated.View entering={FadeInUp.delay(1100).duration(800)} style={styles.formulaSection}>
                    <View style={[styles.formulaCard, { backgroundColor: isDark ? appColors.card : '#1E293B', borderWidth: isDark ? 1 : 0, borderColor: appColors.border }]}>
                        <View style={styles.formulaHeader}>
                            <Icon name="function-variant" size={mS(20)} color={isDark ? appColors.lightTextColor : "#64748B"} />
                            <Text style={[styles.formulaHeaderText, { color: isDark ? appColors.lightTextColor : "#94A3B8" }]}>HOW WE CALCULATE</Text>
                        </View>
                        <View style={styles.formulaBody}>
                            <Text style={styles.formulaText}>
                                Average = <Text style={[styles.boldWhite, { color: isDark ? appColors.text : '#FFF' }]}>Total Points</Text> ÷ <Text style={[styles.boldWhite, { color: isDark ? appColors.text : '#FFF' }]}>Rated Trips</Text>
                            </Text>
                        </View>
                        <View style={[styles.formulaBadge, isDark && { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                            <Icon name="check-decagram" size={mS(14)} color="#10B981" />
                            <Text style={styles.badgeText}>Verified Fairness Model</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: hS(20),
        paddingTop: vS(10),
    },
    heroSection: {
        marginBottom: vS(32),
    },
    heroCard: {
        backgroundColor: colors.button,
        borderRadius: mS(24),
        padding: mS(24),
        alignItems: 'center',
        shadowColor: colors.button,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    heroIconBox: {
        width: mS(80),
        height: mS(80),
        borderRadius: mS(40),
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(16),
    },
    heroTitle: {
        fontSize: mS(22),
        fontWeight: '900',
        color: '#FFF',
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: mS(14),
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginTop: vS(6),
        lineHeight: mS(20),
    },
    timelineContainer: {
        paddingLeft: hS(10),
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: vS(4),
    },
    timelineAnchor: {
        width: hS(40),
        alignItems: 'center',
    },
    outerDot: {
        width: mS(20),
        height: mS(20),
        borderRadius: mS(10),
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        zIndex: 2,
    },
    innerDot: {
        width: mS(10),
        height: mS(10),
        borderRadius: mS(5),
    },
    verticalLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: vS(-2),
    },
    stepCard: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: mS(20),
        padding: mS(16),
        marginBottom: vS(24),
        marginLeft: hS(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    stepIconBox: {
        width: mS(48),
        height: mS(48),
        borderRadius: mS(14),
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepTextContent: {
        flex: 1,
        marginLeft: hS(16),
    },
    stepTitle: {
        fontSize: mS(16),
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: vS(4),
    },
    stepDesc: {
        fontSize: mS(13),
        color: '#64748B',
        lineHeight: mS(20),
    },
    formulaSection: {
        marginTop: vS(8),
    },
    formulaCard: {
        backgroundColor: '#1E293B',
        borderRadius: mS(20),
        padding: mS(20),
        alignItems: 'center',
    },
    formulaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(8),
        marginBottom: vS(12),
    },
    formulaHeaderText: {
        fontSize: mS(11),
        fontWeight: '900',
        color: '#94A3B8',
        letterSpacing: 1.5,
    },
    formulaBody: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: hS(16),
        paddingVertical: vS(12),
        borderRadius: mS(12),
        marginBottom: vS(16),
        width: '100%',
        alignItems: 'center',
    },
    formulaText: {
        fontSize: mS(15),
        color: '#CBD5E1',
        fontStyle: 'italic',
    },
    boldWhite: {
        color: '#FFF',
        fontWeight: '800',
    },
    formulaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(6),
        backgroundColor: '#F0FDF4',
        paddingHorizontal: hS(12),
        paddingVertical: vS(4),
        borderRadius: mS(100),
    },
    badgeText: {
        fontSize: mS(11),
        fontWeight: '700',
        color: '#10B981',
    }
});

export default RatingInfoScreen;