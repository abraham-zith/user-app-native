import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../constant/colors';
import { useAppTheme } from '../../hooks/useAppTheme';
import { hS, mS, vS } from '../../lib/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FAQDetails = ({ route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors: appColors, isDark } = useAppTheme();
    const { title, questions } = route.params;
    // Track which question is expanded
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            {/* --- MODERN HEADER --- */}
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: appColors.card, shadowColor: isDark ? '#000' : '#64748B' }]}>
                <Text style={[styles.headerTitle, { color: appColors.text }]}>{title}</Text>
                <Text style={[styles.headerSubtitle, { color: appColors.lightTextColor }]}>Find answers to the most common questions</Text>
            </View>

            <FlatList
                data={questions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const isExpanded = expandedId === item.id;
                    return (
                        <View style={[
                            styles.faqCard,
                            { backgroundColor: appColors.card, borderColor: appColors.border, shadowColor: isDark ? '#000' : '#64748B' },
                            isExpanded && (isDark ? { borderColor: appColors.lightTextColor + '40' } : styles.faqCardExpanded)
                        ]}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.questionRow}
                                onPress={() => toggleExpand(item.id)}
                            >
                                <Text style={[
                                    styles.questionText,
                                    { color: appColors.text },
                                    isExpanded && (isDark ? { color: appColors.text } : styles.questionTextActive)
                                ]}>
                                    {item.question}
                                </Text>
                                <View style={[
                                    styles.iconCircle,
                                    { backgroundColor: appColors.iconBox },
                                    isExpanded && (isDark ? { backgroundColor: appColors.lightTextColor + '40' } : styles.iconCircleActive)
                                ]}>
                                    <MaterialCommunityIcons
                                        name={isExpanded ? "minus" : "plus"}
                                        size={mS(20)}
                                        color={isExpanded ? "#FFF" : (isDark ? appColors.text : colors.button)}
                                    />
                                </View>
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.answerRow}>
                                    <View style={[styles.answerContent, { backgroundColor: appColors.background }]}>
                                        <Text style={[styles.answerText, { color: appColors.lightTextColor }]}>{item.answer}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC'
    },
    header: {
        paddingHorizontal: hS(24),
        paddingBottom: vS(20),
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: mS(30),
        borderBottomRightRadius: mS(30),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 3,
    },
    headerTitle: {
        fontSize: mS(22),
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: mS(14),
        color: '#64748B',
        marginTop: vS(4),
        fontWeight: '500',
    },
    listPadding: {
        padding: mS(20),
        paddingTop: vS(24),
    },
    faqCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(20),
        marginBottom: vS(16),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
    },
    faqCardExpanded: {
        borderColor: colors.button + '40', // 25% opacity of theme color
    },
    questionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: mS(20)
    },
    questionText: {
        flex: 1,
        fontSize: mS(15),
        fontWeight: '700',
        color: '#334155',
        lineHeight: mS(20),
    },
    questionTextActive: {
        color: colors.button,
    },
    iconCircle: {
        width: mS(32),
        height: mS(32),
        borderRadius: mS(16),
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: hS(12),
    },
    iconCircleActive: {
        backgroundColor: colors.button,
    },
    answerRow: {
        paddingBottom: vS(20),
        paddingHorizontal: hS(20),
    },
    answerContent: {
        padding: mS(16),
        backgroundColor: '#F8FAFC',
        borderRadius: mS(14),
    },
    answerText: {
        fontSize: mS(14),
        color: '#64748B',
        lineHeight: mS(22),
        fontWeight: '500',
    }
});

export default FAQDetails;