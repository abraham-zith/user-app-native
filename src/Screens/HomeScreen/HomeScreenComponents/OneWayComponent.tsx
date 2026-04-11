import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    TextInput,
    Platform,
    ActivityIndicator,
    Alert
} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from "../../../constant/colors";
import { useNavigation } from '@react-navigation/native';
import Config from "react-native-config";
import { useLocation } from "../../../hooks/useLocation";
import { LocationSearch_Nav } from "../../../Navigations/navigations";
import Geolocation from 'react-native-geolocation-service';
import { useAppTheme } from "../../../hooks/useAppTheme";


// Import your responsive utilities
import { hS, vS, mS, SCREEN_HEIGHT } from '../../../lib/responsive';

const GOOGLE_P_API_KEY = Config.GOOGLE_API_KEY;

const CATEGORIES = [
    { name: 'Spiritual', icon: 'hands-pray', types: ['church', 'hindu_temple', 'mosque'], color: '#10B981', bgColor: '#ECFDF5' },
    { name: 'Airport', icon: 'airplane', types: ['airport'], color: '#3B82F6', bgColor: '#EFF6FF' },
    { name: 'Beaches', icon: 'beach', types: ['tourist_attraction'], color: '#F59E0B', bgColor: '#FFFBEB' },
    { name: 'Shopping', icon: 'shopping', types: ['shopping_mall'], color: '#EC4899', bgColor: '#FDF2F8' },
    { name: 'Tech Parks', icon: 'office-building', types: ['corporate_office'], color: '#6366F1', bgColor: '#EEF2FF' },
    { name: 'Dining', icon: 'silverware-fork-knife', types: ['restaurant', 'cafe'], color: '#F43F5E', bgColor: '#FFF1F2' },
    { name: 'Parks', icon: 'pine-tree', types: ['park'], color: '#84CC16', bgColor: '#F7FEE7' },
    { name: 'Museums', icon: 'bank', types: ['museum'], color: '#8B5CF6', bgColor: '#F5F3FF' },
    { name: 'Heritage', icon: 'pillar', types: ['historical_landmark', 'monument'], color: '#D97706', bgColor: '#FEF3C7' },
];

interface OneWayProps {
    onSelectLocation: (name: string, address: string, lat: number, lng: number) => void;
}

export const OneWayComponent: React.FC<OneWayProps> = ({ onSelectLocation }) => {
    const navigation = useNavigation<any>();
    const { getCurrentLocation } = useLocation();
    const { colors: appColors, isDark } = useAppTheme();

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalTitle, setModalTitle] = useState("");

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    const handleCategoryPress = async (category: any) => {
        setModalTitle(category.name);
        setIsOpen(true);
        setIsLoading(true);
        setModalData([]);
        const { coords } = await getCurrentLocation();


        try {
            const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_P_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
                } as any,
                body: JSON.stringify({
                    includedTypes: category.types,
                    maxResultCount: 15,
                    locationRestriction: {
                        circle: {
                            center: { latitude: coords.latitude, longitude: coords.longitude },
                            radius: 5000.0
                        }
                    }
                })
            });

            const data = await response.json();
            setIsLoading(false);

            if (data && data.places) {
                const formatted = data.places.map((p: any) => ({
                    id: p.id,
                    name: p.displayName?.text || "Unknown",
                    address: p.formattedAddress || "No Address",
                    lat: p.location.latitude,
                    lng: p.location.longitude,
                    dist: p.location ? getDistance(coords.latitude, coords.longitude, p.location.latitude, p.location.longitude) + " km" : "N/A"
                }));
                setModalData(formatted);
            }
        } catch (error) {
            setIsLoading(false);
            Alert.alert('Something Went Wrong!!!', 'Try Again Later');
            // console.error(error);
        }
    };

    const handleSelectPlace = (place: any) => {
        const fullAddress = `${place.name}, ${place.address}`;
        onSelectLocation(place.name, place.address, place.lat, place.lng);
        navigation.navigate(LocationSearch_Nav, {
            selectedDropOff: fullAddress,
            dropoffLocation: { dropLat: place.lat, dropLng: place.lng }
        });
        setIsOpen(false);
        setSearch("");
    };

    const filteredResults = modalData.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <Text style={[styles.sectionTitle, { color: appColors.text }]}>Popular Routes</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
            >
                {CATEGORIES.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleCategoryPress(item)}
                        style={[styles.catCard, { backgroundColor: appColors.card, borderColor: appColors.border }]}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: isDark ? `${item.color}20` : item.bgColor }]}>
                            <MaterialCommunityIcons name={item.icon} size={mS(26)} color={item.color} />
                        </View>
                        <Text numberOfLines={1} style={[styles.catText, { color: appColors.text }]}>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal visible={isOpen} animationType="slide" transparent statusBarTranslucent navigationBarTranslucent onRequestClose={() => setIsOpen(false)}>
                <View style={styles.backdrop}>
                    <View style={[styles.sheetContainer, { backgroundColor: appColors.card }]}>
                        <View style={[styles.handle, { backgroundColor: appColors.border }]} />

                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: appColors.text }]}>{modalTitle} Near You</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)} style={[styles.closeBtn, { backgroundColor: appColors.iconBox }]}>
                                <MaterialCommunityIcons name="close" size={mS(20)} color={appColors.lightTextColor} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: appColors.background, borderColor: isDark ? 'transparent' : '#E2E8F0' }]}>
                            <MaterialCommunityIcons name="magnify" size={mS(22)} color={appColors.secondaryText} />
                            <TextInput
                                style={[styles.input, { color: appColors.text }]}
                                placeholder={`Search ${modalTitle.toLowerCase()}...`}
                                placeholderTextColor={appColors.secondaryText}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.button} style={{ marginTop: vS(40) }} />
                        ) : (
                            <ScrollView contentContainerStyle={styles.listPadding}>
                                {filteredResults.map((place) => (
                                    <TouchableOpacity
                                        key={place.id}
                                        onPress={() => handleSelectPlace(place)}
                                        style={[styles.placeItem, { borderBottomColor: appColors.border }]}
                                    >
                                        <View style={[styles.iconContainer, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.2)' }]}>
                                            <MaterialCommunityIcons name="map-marker-outline" size={mS(20)} color={isDark ? '#60A5FA' : '#2563EB'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.placeName, { color: appColors.text }]}>{place.name}</Text>
                                            <Text numberOfLines={1} style={[styles.placeAddress, { color: appColors.secondaryText }]}>{place.address}</Text>
                                        </View>
                                        <View style={[styles.distanceBadge, { backgroundColor: appColors.iconBox }]}>
                                            <Text style={[styles.distanceText, { color: appColors.secondaryText }]}>{place.dist}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: hS(20),
        paddingVertical: vS(10)
    },
    sectionTitle: {
        fontSize: mS(16),
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: vS(10)
    },
    horizontalScroll: {
        paddingRight: hS(20),
        paddingBottom: hS(20)
    },
    catCard: {
        width: hS(90),
        height: vS(105),
        backgroundColor: '#FFFFFF',
        borderRadius: mS(16),
        marginRight: hS(16),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9', // subtle border
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 4 }
        })
    },
    iconCircle: {
        width: hS(48),
        height: hS(48),
        borderRadius: hS(24),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: vS(10)
    },
    catText: {
        fontSize: mS(12),
        fontWeight: '700',
        color: '#334155',
        paddingHorizontal: hS(4),
        textAlign: 'center',
    },

    // Modal Styles
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: mS(25),
        borderTopRightRadius: mS(25),
        height: SCREEN_HEIGHT * 0.85,
        paddingTop: vS(12)
    },
    handle: {
        width: hS(40),
        height: vS(5),
        backgroundColor: '#E2E8F0',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: vS(15)
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: hS(20),
        marginBottom: vS(15)
    },
    modalTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        color: '#1E293B'
    },
    closeBtn: {
        backgroundColor: '#F1F5F9',
        padding: hS(8),
        borderRadius: mS(20)
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        marginHorizontal: hS(20),
        paddingHorizontal: hS(15),
        borderRadius: mS(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: vS(48),
        marginBottom: vS(15)
    },
    input: {
        flex: 1,
        fontSize: mS(14),
        color: '#1E293B',
        marginLeft: hS(10),
        paddingVertical: 0
    },
    listPadding: {
        paddingHorizontal: hS(20),
        paddingBottom: vS(40)
    },
    placeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(15),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    iconContainer: {
        width: hS(40),
        height: hS(40),
        borderRadius: mS(10),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: hS(12)
    },
    placeName: {
        fontSize: mS(14),
        fontWeight: '700',
        color: '#1E293B'
    },
    placeAddress: {
        fontSize: mS(11),
        color: '#64748B',
        marginTop: vS(2)
    },
    distanceBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: mS(6)
    },
    distanceText: {
        fontSize: mS(10),
        color: '#64748B',
        fontWeight: '600'
    }
});