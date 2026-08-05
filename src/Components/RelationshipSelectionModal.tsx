import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { hS, mS, vS } from '../lib/responsive';
import colors from '../constant/colors';
import { useAppTheme } from '../hooks/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ContactData {
    name: string;
    phone: string;
}

interface RelationshipSelectionModalProps {
    visible: boolean;
    contact: ContactData | null;
    onSelectRelationship: (relationship: string) => void;
    onClose: () => void;
    suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
    'Mother',
    'Father',
    'Sister',
    'Brother',
    'Spouse',
    'Friend',
    'Colleague',
    'Guardian',
];

const RelationshipSelectionModal: React.FC<RelationshipSelectionModalProps> = ({
    visible,
    contact,
    onSelectRelationship,
    onClose,
    suggestions = DEFAULT_SUGGESTIONS,
}) => {
    const { colors: appColors, isDark } = useAppTheme();
    const insets = useSafeAreaInsets();
    const [customRelationship, setCustomRelationship] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);

    useEffect(() => {
        if (!visible) {
            setCustomRelationship('');
            setFilteredSuggestions(suggestions);
        }
    }, [visible, suggestions]);

    const handleCustomInputChange = (text: string) => {
        setCustomRelationship(text);
        if (text.trim()) {
            const filtered = suggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions(suggestions);
        }
    };

    const handleSelectRelationship = (relationship: string) => {
        onSelectRelationship(relationship);
        setCustomRelationship('');
        setFilteredSuggestions(suggestions);
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
                <Text style={[styles.avatarText, { color: isDark ? appColors.primary : appColors.button }]}>
                    {initials}
                </Text>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
            navigationBarTranslucent
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: appColors.card, paddingBottom: vS(24) + insets.bottom }]}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: appColors.text }]}>
                            Select Relationship
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <MaterialCommunityIcons
                                name="close"
                                size={mS(24)}
                                color={appColors.text}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Contact Preview */}
                    {contact && (
                        <View style={[styles.contactPreviewBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderWidth: isDark ? 1 : 0, borderColor: appColors.border }]}>
                            <ContactAvatar name={contact.name} />
                            <View style={{ marginLeft: hS(12), flex: 1 }}>
                                <Text style={[styles.previewName, { color: appColors.text }]}>
                                    {contact.name}
                                </Text>
                                <Text style={[styles.previewPhone, { color: appColors.secondaryText }]}>
                                    {contact.phone}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Custom Input */}
                    <TextInput
                        style={[
                            styles.customInput,
                            {
                                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                                color: appColors.text,
                                borderColor: appColors.border,
                            }
                        ]}
                        placeholder="Or type custom relationship"
                        placeholderTextColor={appColors.secondaryText}
                        value={customRelationship}
                        onChangeText={handleCustomInputChange}
                        maxLength={30}
                    />

                    {/* Suggestions List */}
                    <ScrollView
                        scrollEnabled={filteredSuggestions.length > 4}
                        style={styles.suggestionsContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={[styles.suggestionsLabel, { color: appColors.secondaryText }]}>
                            Quick suggestions
                        </Text>

                        {filteredSuggestions.length > 0 ? (
                            filteredSuggestions.map((suggestion, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleSelectRelationship(suggestion)}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.suggestionButton,
                                        { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="account-check"
                                        size={mS(18)}
                                        color={isDark ? appColors.primary : colors.button}
                                        style={{ marginRight: hS(10) }}
                                    />
                                    <Text style={[styles.suggestionText, { color: appColors.text }]}>
                                        {suggestion}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={[styles.noResultsText, { color: appColors.secondaryText }]}>
                                No matching suggestions
                            </Text>
                        )}

                        {/* Custom Relationship Button */}
                        {customRelationship.trim() && !suggestions.includes(customRelationship) && (
                            <TouchableOpacity
                                onPress={() => handleSelectRelationship(customRelationship)}
                                activeOpacity={0.7}
                                style={[
                                    styles.customRelationshipButton,
                                    { backgroundColor: colors.button }
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name="plus-circle"
                                    size={mS(18)}
                                    color="#FFF"
                                    style={{ marginRight: hS(10) }}
                                />
                                <Text style={styles.customRelationshipText}>
                                    Add "{customRelationship}"
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: mS(28),
        borderTopRightRadius: mS(28),
        paddingTop: vS(20),
        paddingHorizontal: hS(20),
        paddingBottom: vS(24),
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(20),
        paddingBottom: vS(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        color: '#1E293B',
    },
    closeButton: {
        padding: mS(8),
        marginRight: hS(-8),
    },
    contactPreviewBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: mS(16),
        borderRadius: mS(16),
        marginBottom: vS(20),
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
    previewName: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#1E293B',
    },
    previewPhone: {
        fontSize: mS(13),
        color: '#64748B',
        marginTop: vS(2),
    },
    customInput: {
        borderWidth: 1,
        borderRadius: mS(14),
        paddingHorizontal: hS(16),
        paddingVertical: vS(12),
        marginBottom: vS(20),
        fontSize: mS(14),
        fontWeight: '500',
    },
    suggestionsContainer: {
        maxHeight: vS(300),
    },
    suggestionsLabel: {
        fontSize: mS(13),
        fontWeight: '600',
        color: '#64748B',
        marginBottom: vS(12),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    suggestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(16),
        paddingVertical: vS(14),
        borderRadius: mS(12),
        marginBottom: vS(8),
        backgroundColor: '#F1F5F9',
    },
    suggestionText: {
        fontSize: mS(15),
        fontWeight: '600',
        color: '#1E293B',
    },
    customRelationshipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(16),
        paddingVertical: vS(14),
        borderRadius: mS(12),
        marginTop: vS(8),
        marginBottom: vS(8),
        backgroundColor: colors.button,
    },
    customRelationshipText: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#FFF',
    },
    noResultsText: {
        fontSize: mS(14),
        fontWeight: '500',
        textAlign: 'center',
        marginTop: vS(16),
    },
});

export default RelationshipSelectionModal;