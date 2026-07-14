import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    SectionList,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ALL_CARS, CarModel, INDIAN_CAR_DATABASE } from '../../../constant/cars';
import { TransmissionType, VehicleType } from '../../../enums/trip.enum';
import { hS, mS, vS } from '../../../lib/responsive';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface SearchableCarPickerProps {
    onSelect: (car: CarModel, transmission: TransmissionType) => void;
    placeholder?: string;
    value?: CarModel | null;
    initialTransmission?: TransmissionType;
    hasError?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SearchableCarPicker: React.FC<SearchableCarPickerProps> = ({ onSelect, placeholder, value, initialTransmission, hasError }) => {
    const { colors, isDark } = useAppTheme();
    const [search, setSearch] = useState('');
    const [selectedCar, setSelectedCar] = useState<CarModel | null>(value || null);
    const [transmission, setTransmission] = useState<TransmissionType>(initialTransmission || TransmissionType.MANUAL);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (value) {
            setSelectedCar(value);
        }
        if (initialTransmission) {
            setTransmission(initialTransmission);
        }
    }, [value, initialTransmission]);

    // Filter results
    const filteredSections = useMemo(() => {
        const searchLower = search.toLowerCase();
        const sections: { title: string; data: CarModel[] }[] = [];

        Object.entries(INDIAN_CAR_DATABASE).forEach(([brand, models]) => {
            const BrandModels = models
                .filter(m => m.model.toLowerCase().includes(searchLower) || brand.toLowerCase().includes(searchLower))
                .map(m => ({ brand, model: m.model, type: m.type }));

            if (BrandModels.length > 0) {
                sections.push({ title: brand, data: BrandModels });
            }
        });

        if (search.trim().length > 0) {
            sections.push({
                title: "Custom Vehicle",
                data: [{ brand: "Custom Entry", model: search.trim(), type: VehicleType.CAR }]
            });
        }

        return sections;
    }, [search]);

    const handleSelectCar = (car: CarModel) => {
        setSelectedCar(car);
        setIsOpen(false);
        onSelect(car, transmission);
    };

    const handleTransmissionChange = (type: TransmissionType) => {
        setTransmission(type);
        if (selectedCar) {
            onSelect(selectedCar, type);
        }
    };

    return (
        <View style={styles.outerContainer}>
            {/* Main Selection Area */}
            <View style={[
                styles.inputBox,
                { backgroundColor: colors.card, borderColor: hasError ? '#EF4444' : colors.border }
            ]}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsOpen(true)}
                    style={styles.searchButton}
                >
                    <View style={styles.searchIconOuter}>
                        <MaterialCommunityIcons name="car-select" size={mS(22)} color={colors.primary} />
                    </View>
                    <View style={styles.searchTextContainer}>
                        <Text style={[styles.label, { color: colors.secondaryText }]}>VEHICLE</Text>
                        <Text style={[styles.value, { color: selectedCar ? colors.text : colors.secondaryText }]}>
                            {selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : (placeholder || "Search for your car")}
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={mS(20)} color={colors.secondaryText} />
                </TouchableOpacity>

                {/* Transmission Switch */}
                <View style={[styles.transmissionContainer, { borderTopColor: colors.border }]}>
                    {([TransmissionType.MANUAL, TransmissionType.AUTOMATIC, TransmissionType.SEMI_AUTOMATIC] as TransmissionType[]).map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => handleTransmissionChange(type)}
                            style={[
                                styles.transmissionTab,
                                transmission === type && {
                                    backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : '#EFF6FF',
                                    borderColor: colors.primary
                                }
                            ]}
                        >
                            <Text
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                style={[
                                    styles.transmissionText,
                                    { color: colors.secondaryText },
                                    transmission === type && { color: colors.primary, fontWeight: '700' }
                                ]}
                            >
                                {type === TransmissionType.SEMI_AUTOMATIC ? 'SEMI-AUTO' : type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Selection Modal */}
            <Modal statusBarTranslucent navigationBarTranslucent                 visible={isOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsOpen(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <Pressable style={styles.modalBackdrop} onPress={() => setIsOpen(false)} />
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <View style={styles.dragHandle} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Vehicle</Text>
                            
                            <View style={[styles.searchInputContainer, { backgroundColor: isDark ? colors.background : '#F8FAFC', borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                                <MaterialCommunityIcons name="magnify" size={mS(20)} color={colors.secondaryText} />
                                <TextInput
                                    style={[styles.searchInput, { color: colors.text }]}
                                    placeholder="Search brand or model..."
                                    placeholderTextColor={colors.secondaryText}
                                    value={search}
                                    onChangeText={setSearch}
                                    autoFocus
                                />
                                {search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch('')}>
                                        <MaterialCommunityIcons name="close-circle" size={mS(18)} color={colors.secondaryText} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <SectionList
                            sections={filteredSections}
                            keyExtractor={(item, index) => item.brand + item.model + index}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.carItem, { borderBottomColor: colors.border }]}
                                    onPress={() => handleSelectCar(item)}
                                >
                                    <View style={styles.carItemText}>
                                        <Text style={[styles.carModelText, { color: colors.text }]}>{item.model}</Text>
                                        <Text style={[styles.carBrandText, { color: colors.secondaryText }]}>{item.brand}</Text>
                                    </View>
                                    <View style={[styles.typeBadge, { backgroundColor: colors.iconBox }]}>
                                        <Text style={[styles.typeText, { color: colors.secondaryText }]}>{item.type}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            renderSectionHeader={({ section: { title } }) => (
                                <View style={[styles.sectionHeader, { backgroundColor: isDark ? colors.background : '#F1F5F9', borderBottomWidth: isDark ? 1 : 0, borderBottomColor: colors.border }]}>
                                    <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{title}</Text>
                                </View>
                            )}
                            stickySectionHeadersEnabled={true}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name="car-off" size={mS(48)} color={colors.border} />
                                    <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No cars found</Text>
                                </View>
                            )}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        marginHorizontal: hS(16),
        marginVertical: vS(8),
    },
    inputBox: {
        borderRadius: mS(16),
        borderWidth: 1.5,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: mS(16),
    },
    searchIconOuter: {
        width: mS(44),
        height: mS(44),
        borderRadius: mS(12),
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(14),
    },
    searchTextContainer: {
        flex: 1,
    },
    label: {
        fontSize: mS(10),
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: vS(2),
    },
    value: {
        fontSize: mS(15),
        fontWeight: '600',
    },
    transmissionContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        padding: mS(8),
        gap: mS(8),
    },
    transmissionTab: {
        flex: 1,
        height: vS(36),
        borderRadius: mS(8),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    transmissionText: {
        fontSize: mS(13),
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
    },
    modalContent: {
        height: SCREEN_HEIGHT * 0.75,
        borderTopLeftRadius: mS(32),
        borderTopRightRadius: mS(32),
        overflow: 'hidden',
    },
    modalHeader: {
        paddingTop: vS(12),
        paddingHorizontal: hS(24),
        paddingBottom: vS(16),
    },
    dragHandle: {
        width: hS(40),
        height: vS(5),
        backgroundColor: '#E2E8F0',
        borderRadius: mS(10),
        alignSelf: 'center',
        marginBottom: vS(16),
    },
    modalTitle: {
        fontSize: mS(20),
        fontWeight: '800',
        marginBottom: vS(16),
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(14),
        height: vS(50),
        borderRadius: mS(14),
        gap: hS(10),
    },
    searchInput: {
        flex: 1,
        fontSize: mS(16),
        fontWeight: '500',
    },
    sectionHeader: {
        paddingHorizontal: hS(24),
        paddingVertical: vS(8),
    },
    sectionTitle: {
        fontSize: mS(12),
        fontWeight: '800',
        letterSpacing: 1,
    },
    carItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: vS(16),
        paddingHorizontal: hS(24),
        borderBottomWidth: 1,
    },
    carItemText: {
        flex: 1,
    },
    carModelText: {
        fontSize: mS(16),
        fontWeight: '600',
    },
    carBrandText: {
        fontSize: mS(13),
        marginTop: vS(2),
    },
    typeBadge: {
        paddingHorizontal: hS(10),
        paddingVertical: vS(4),
        borderRadius: mS(6),
    },
    typeText: {
        fontSize: mS(10),
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: vS(40),
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: vS(60),
    },
    emptyText: {
        fontSize: mS(16),
        marginTop: vS(12),
        fontWeight: '500',
    },
});

export default SearchableCarPicker;
