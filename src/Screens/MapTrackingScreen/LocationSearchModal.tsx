import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ScrollView, Platform, Pressable,
    ActivityIndicator,
    Alert,
    ToastAndroid,
    StyleSheet
} from 'react-native';
import Config from 'react-native-config';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { saveToRecents } from '../../service/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedLocation } from '../../service/utils/storage';
import { useLocation } from '../../hooks/useLocation';
import { useUpdateUserMutation } from '../../service/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateUserStore } from '../../redux/userSlice';
import CustomAlert from '../../Components/CustomAlert';
import colors from '../../constant/colors';
import { useAppTheme } from '../../hooks/useAppTheme';

const RECENT_LOCATIONS_KEY = '@recent_locations';
const GOOGLE_P_API_KEY = Config.GOOGLE_API_KEY;

// ============ UTILITY FUNCTIONS ============

/**
 * Debounce function to limit API calls
 */
const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Geocode address using Google Geocoding API
 * Use as fallback when Places Autocomplete doesn't find detailed address
 */
const geocodeAddress = async (address: string) => {
    try {
        const url = 'https://maps.googleapis.com/maps/api/geocode/json';
        const params = new URLSearchParams({
            address: address,
            components: 'country:IN',
            key: GOOGLE_P_API_KEY || '',
        });

        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            return {
                formatted_address: result.formatted_address,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                address_components: result.address_components,
                source: 'geocoding'
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

/**
 * Reverse geocode coordinates to get formatted address
 */
const reverseGeocode = async (lat: number, lng: number) => {
    try {
        const url = 'https://maps.googleapis.com/maps/api/geocode/json';
        const params = new URLSearchParams({
            latlng: `${lat},${lng}`,
            key: GOOGLE_P_API_KEY || '',
        });

        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].formatted_address;
        }

        return 'Address not found';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return 'Address not found';
    }
};

/**
 * Parse address components to extract detailed information
 */
const parseAddressComponents = (components: any[]) => {
    const address: Record<string, string> = {};

    components.forEach(component => {
        const types = component.types;

        if (types.includes('street_number')) {
            address.streetNumber = component.long_name;
        }
        if (types.includes('route')) {
            address.street = component.long_name;
        }
        if (types.includes('locality')) {
            address.city = component.long_name;
        }
        if (types.includes('administrative_area_level_2')) {
            address.district = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
            address.state = component.short_name;
        }
        if (types.includes('postal_code')) {
            address.postalCode = component.long_name;
        }
        if (types.includes('country')) {
            address.country = component.long_name;
        }
    });

    return address;
};

/**
 * Check if search query is detailed (likely a full address)
 */
const isDetailedAddress = (query: string) => {
    const hasMultipleSpaces = (query.match(/\s/g) || []).length >= 2;
    const hasNumbers = /\d/.test(query);
    const hasCommas = /,/.test(query);

    return (hasMultipleSpaces && hasNumbers) || hasCommas;
};

// ============ STYLES ============

const styles = StyleSheet.create({
    limitReachedContainer: {
        padding: 16,
        marginTop: 10,
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FEF3C7'
    },
    limitReachedText: {
        color: '#B45309',
        fontSize: 13,
        fontWeight: '500'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        minHeight: 400,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
    addressLabel: { fontSize: 13, marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
    nameInput: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginBottom: 15
    },
    suggestionContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
    },
    chipText: { fontSize: 13, fontWeight: '600' },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
    cancelBtn: {},
    saveBtn: {},
    saveBtnText: { color: 'white', fontWeight: '700' },
    cancelBtnText: { fontWeight: '700' },
    // New styles for address confirmation
    confirmationContainer: {
        padding: 16,
        marginVertical: 12,
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
        elevation: 1,
    },
    confirmationText: {
        fontSize: 14,
        color: '#92400E',
        fontWeight: '600',
        lineHeight: 20,
        marginBottom: 12,
    },
    confirmBtn: {
        backgroundColor: '#2563EB',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
    },
    searchingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    searchingText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '500'
    }
});

interface LocationSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: string, address: string, lat: number, lng: number) => void;
    type: "start" | "destination";
    onSetNext: (data: boolean) => void;
    advancebooking: boolean
}

const LocationSearchModal = ({ isOpen, onClose, onSelect, type, onSetNext, advancebooking }: LocationSearchModalProps) => {
    const { colors: themeColors, isDark } = useAppTheme();
    const user = useSelector((state: RootState) => state.userSlice.user);
    const dispatch = useDispatch()
    const [updateUser] = useUpdateUserMutation();

    const [search, setSearch] = useState("");
    const [savedRecents, setSavedRecents] = useState<SavedLocation[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const { getCurrentLocation, getAddressFromCoords, loading } = useLocation();
    const [favoriteLocations, setFavoriteLocations] = useState<SavedLocation[]>(user?.favourite_places || []);
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
    const [alertMode, setAlertMode] = useState<'add' | 'remove'>('add');
    const [pendingLocation, setPendingLocation] = useState<any>(null);
    const [isFavModalVisible, setIsFavModalVisible] = useState(false);
    const [customName, setCustomName] = useState('');

    // New state for search confirmation
    const [searchConfirmation, setSearchConfirmation] = useState<{
        show: boolean;
        searched: string;
        found: string;
        location: any;
    } | null>(null);

    const googlePlacesRef = useRef(null);
    const searchCache = useRef<Record<string, any>>({});

    const suggestedNames = ["Home", "Work", "Gym", "Parent's House"];

    useEffect(() => {
        const loadRecents = async () => {
            const data = await AsyncStorage.getItem(RECENT_LOCATIONS_KEY);
            if (data) setSavedRecents(JSON.parse(data));
        };

        if (isOpen) {
            loadRecents();
        }
    }, [isOpen]);

    // ============ SEARCH WITH FALLBACK ============

    /**
     * Attempt to geocode if Places Autocomplete fails for detailed address
     */
    const handleDetailedAddressSearch = useCallback(
        debounce(async (query) => {
            console.log('Starting detailed search for:', query);
            if (query.length < 5 || !isDetailedAddress(query)) {
                console.log('Search query not detailed enough');
                return;
            }

            setIsSearching(true);

            try {
                // Check cache first
                if (searchCache.current[query]) {
                    const cached = searchCache.current[query];
                    showSearchConfirmation(query, cached);
                    setIsSearching(false);
                    return;
                }

                // Call Geocoding API
                const result = await geocodeAddress(query);

                if (result) {
                    console.log('Detailed result found:', result.formatted_address);
                    // Cache the result
                    searchCache.current[query] = result;
                    showSearchConfirmation(query, result);
                } else {
                    console.log('No results from geocoding API for query:', query);
                }

                setIsSearching(false);
            } catch (error) {
                console.error('Detailed search error:', error);
                setIsSearching(false);
            }
        }, 800),
        []
    );

    /**
     * Show confirmation when address is found differently than searched
     */
    const showSearchConfirmation = (searched: string, found: any) => {
        const match = searched.toLowerCase().includes(found.address_components?.[0]?.long_name?.toLowerCase());

        setSearchConfirmation({
            show: true,
            searched,
            found: found.formatted_address,
            location: found
        });
    };

    /**
     * Clear recents
     */
    const clearRecents = async () => {
        try {
            await AsyncStorage.removeItem(RECENT_LOCATIONS_KEY);
            setSavedRecents([]);
        } catch (e) {
            Alert.alert('Error Clearing Recents!!!', 'Try Again Later');
        }
    };

    /**
     * Get current location
     */
    const handlePress = async () => {
        try {
            const position = await getCurrentLocation();
            const { latitude, longitude } = position.coords;
            const address = await getAddressFromCoords(latitude, longitude)

            onSelect("Current Location", address?.formatted, latitude, longitude);
            onClose()
        } catch (error) {
            console.error('Current location error:', error);
        }
    };

    /**
     * Handle location selection from search results
     */
    const handleLocationSelect = async (data: any, details: any) => {
        try {
            const locationName = details?.name || data.structured_formatting.main_text;
            const address = data.description;
            const lat = details?.geometry?.location?.lat ?? 0;
            const lng = details?.geometry?.location?.lng ?? 0;

            const newRecent = {
                id: data.place_id,
                name: locationName,
                address: address,
                lat: lat,
                lng: lng,
                icon: "clock-outline"
            };

            await saveToRecents(newRecent);

            // Clear search confirmation if visible
            setSearchConfirmation(null);

            onSelect(locationName, address, lat, lng);
            onClose();
        } catch (error) {
            console.error('Selection error:', error);
            Alert.alert('Error', 'Failed to select location');
        }
    };

    /**
     * Handle confirmation of geocoded address
     */
    const handleConfirmGeocoded = () => {
        if (!searchConfirmation) return;

        const location = searchConfirmation.location;
        const locationName = location.formatted_address;
        const address = location.formatted_address;
        const lat = location.lat;
        const lng = location.lng;

        const newRecent = {
            id: `${lat}-${lng}`,
            name: locationName,
            address: address,
            lat: lat,
            lng: lng,
            icon: "map-marker"
        };

        saveToRecents(newRecent);
        setSearchConfirmation(null);

        onSelect(locationName, address, lat, lng);
        onClose();
    };

    // ============ FAVORITE LOCATION HANDLING ============

    const handleToggleFavoriteFromSearch = async (data: any) => {
        try {
            const idToFind = data.place_id || data.id;
            const isExist = favoriteLocations.find(f => f.id === idToFind);

            if (isExist) {
                onToggleFavorite(isExist);
                return;
            }

            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${data.place_id}&key=${GOOGLE_P_API_KEY}`;
            const response = await fetch(detailsUrl);
            const json = await response.json();

            if (json.status === 'OK') {
                const details = json.result;
                const newFav = {
                    id: data.place_id,
                    name: data.structured_formatting.main_text,
                    showname: customName,
                    address: data.description,
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng,
                };
                setPendingLocation(newFav)
                setCustomName(data.structured_formatting.main_text);
                setIsFavModalVisible(true);
                onToggleFavorite(newFav);
            }
        } catch (error) {
            Alert.alert('Error Fetching Place Details!!!', 'Try Again Later');
        }
    };

    const handleToggleFavoriteFromRecents = async (item: SavedLocation) => {
        try {
            const isExist = favoriteLocations.find(f => f.id === item.id);
            if (isExist) {
                onToggleFavorite(isExist);
            } else {
                setPendingLocation(item);
                setCustomName(item.name);
                setIsFavModalVisible(true);
            }
        } catch (error) {
            Alert.alert('Error handling favorite', 'Try again later');
        }
    };

    const handleSync = async (updatedArray: SavedLocation[]) => {
        setFavoriteLocations(updatedArray);

        try {
            if (!user) {
                console.warn("handleSync: user is null, skipping sync");
                return;
            }

            const sanitizedArray = updatedArray.map(({ icon, ...rest }) => rest);
            const payload = {
                id: user.id,
                favourite_places: sanitizedArray
            };

            const response = await updateUser(payload).unwrap();
            if (response.success) {
                dispatch(updateUserStore({ favourite_places: response.data.favourite_places }));
                ToastAndroid.show("Favorites updated successfully", ToastAndroid.SHORT);
            }
        } catch (error: any) {
            setFavoriteLocations(user?.favourite_places || []);
            const errorMessage = error?.data?.message || error?.message || "Could not sync favorites with the server.";
            Alert.alert("Error", errorMessage);
        }
    };

    const onToggleFavorite = async (location: SavedLocation) => {
        const isExist = favoriteLocations.find(f => f.id === location.id);

        setSelectedLocation(location);
        if (isExist) {
            setAlertMode('remove');
            setAlertVisible(true);
        }
    };

    const confirmToggle = async () => {
        if (!selectedLocation) return;

        const updated = alertMode === 'remove'
            ? favoriteLocations.filter(f => f.id !== selectedLocation.id)
            : [...favoriteLocations, selectedLocation];

        setAlertVisible(false);
        await handleSync(updated);

        setPendingLocation(null);
        setSelectedLocation(null);
        setCustomName('');
    };

    const handleSelectFavourites = (data: SavedLocation) => {
        onSelect(data.name, data.address, data.lat, data.lng)
        onClose()
    }

    const handleConfirmSave = () => {
        if (!customName.trim()) {
            Alert.alert("Error", "Please enter a name for this location");
            return;
        }

        const finalFav = {
            ...pendingLocation,
            showname: customName.trim(),
        };

        setIsFavModalVisible(false);
        setSelectedLocation(finalFav);
        setAlertMode('add');
        setAlertVisible(true);
    };

    const allSuggestions = ["Home", "Work", "Gym", "Office"];

    const filteredSuggestions = allSuggestions.filter((suggestion) => {
        const isAlreadyUsed = favoriteLocations.some(
            (fav) =>
                fav.showname?.toLowerCase() === suggestion.toLowerCase() ||
                fav.name?.toLowerCase() === suggestion.toLowerCase()
        );
        return !isAlreadyUsed;
    });

    useEffect(() => {
        if (user?.favourite_places) {
            setFavoriteLocations(user.favourite_places);
        }
    }, [user?.favourite_places]);

    return (
        <Modal statusBarTranslucent navigationBarTranslucent visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
            <Pressable
                onPress={onClose}
                style={{ flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
            >
                <View
                    onStartShouldSetResponder={() => true}
                    style={{
                        backgroundColor: themeColors.card,
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                        height: '90%',
                        paddingTop: 12,
                        ...(Platform.OS === 'ios'
                            ? { shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 }
                            : { elevation: 25 }
                        ),
                    }}
                >
                    {/* GRAB HANDLE */}
                    <View style={{ width: 40, height: 5, backgroundColor: isDark ? themeColors.border : '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 }} />

                    {/* HEADER */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: themeColors.text }}>
                            {type === "start" ? "Set Pickup" : "Set Drop-off"}
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{ backgroundColor: themeColors.iconBox, padding: 8, borderRadius: 25 }}
                        >
                            <MaterialCommunityIcons name="close" size={20} color={themeColors.secondaryText} />
                        </TouchableOpacity>
                    </View>

                    {/* MAIN CONTENT */}
                    <View style={{ flex: 1, paddingHorizontal: 20 }}>
                        {/* GOOGLE PLACES AUTOCOMPLETE */}
                        <GooglePlacesAutocomplete
                            ref={googlePlacesRef}
                            placeholder={type === "start" ? "Search Pickup Location" : "Search Destination"}
                            textInputProps={{
                                placeholderTextColor: '#999',
                                onChangeText: (text) => {
                                    setSearch(text);
                                    // Clear previous results while searching
                                    if (searchConfirmation) setSearchConfirmation(null);

                                    if (text.length > 5 && isDetailedAddress(text)) {
                                        setIsSearching(true); // Instant feedback
                                        handleDetailedAddressSearch(text);
                                    }
                                }
                            }}
                            minLength={2}
                            fetchDetails={true}
                            onPress={handleLocationSelect}
                            onFail={(error) => console.error(error)}
                            query={{
                                key: GOOGLE_P_API_KEY,
                                language: 'en',
                                components: 'country:in',
                            }}
                            styles={{
                                container: { flex: 0, marginBottom: 10, zIndex: 1001 },
                                textInput: {
                                    height: 56,
                                    backgroundColor: isDark ? themeColors.background : '#F8FAFC',
                                    borderRadius: 16,
                                    paddingHorizontal: 15,
                                    fontSize: 16,
                                    color: themeColors.text,
                                    borderWidth: 1,
                                    borderColor: themeColors.border,
                                    fontWeight: '500',
                                },
                                listView: {
                                    backgroundColor: 'transparent', // Flatten the list
                                    maxHeight: 280,
                                    marginTop: 5,
                                },
                                row: {
                                    paddingVertical: 12,
                                    flexDirection: 'row',
                                    backgroundColor: 'transparent',
                                    borderBottomWidth: 1,
                                    borderBottomColor: themeColors.border,
                                },
                                description: { fontWeight: '700', color: themeColors.text },
                                separator: { height: 1, backgroundColor: themeColors.border }
                            }}
                            renderRow={(data) => {
                                const isFav = favoriteLocations.some(f => f.id === data.place_id);
                                return (
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '100%',
                                        paddingVertical: 8
                                    }}>
                                        <MaterialCommunityIcons
                                            name="map-marker-outline"
                                            size={22}
                                            color={themeColors.secondaryText}
                                            style={{ marginRight: 15 }}
                                        />

                                        <View style={{ flex: 1, overflow: 'hidden' }}>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={{ fontSize: 15, fontWeight: '700', color: themeColors.text }}
                                            >
                                                {data.structured_formatting.main_text}
                                            </Text>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={{ fontSize: 12, color: themeColors.secondaryText }}
                                            >
                                                {data.structured_formatting.secondary_text}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => handleToggleFavoriteFromSearch(data)}
                                            style={{
                                                paddingLeft: 15,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name={isFav ? "heart" : "heart-outline"}
                                                size={24}
                                                color={isFav ? "#FF0000" : "#CBD5E1"}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )
                            }}
                            enablePoweredByContainer={false}
                        />

                        {/* SEARCHING INDICATOR */}
                        {isSearching && (
                            <View style={styles.searchingIndicator}>
                                <ActivityIndicator size="small" color={themeColors.primary} />
                                <Text style={[styles.searchingText, { color: themeColors.text }]}>
                                    Searching detailed addresses...
                                </Text>
                            </View>
                        )}

                        {/* SEARCH CONFIRMATION */}
                        {searchConfirmation?.show && (
                            <View style={styles.confirmationContainer}>
                                <Text style={styles.confirmationText}>
                                    Found: <Text style={{ color: '#000' }}>{searchConfirmation.found}</Text>
                                </Text>
                                <TouchableOpacity
                                    onPress={handleConfirmGeocoded}
                                    style={styles.confirmBtn}
                                >
                                    <Text style={styles.confirmBtnText}>Use This Address</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* FAV LOCATION MODAL */}
                        <Modal statusBarTranslucent navigationBarTranslucent visible={isFavModalVisible} transparent animationType="slide">
                            <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
                                <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
                                    <Text style={[styles.modalTitle, { color: themeColors.text }]}>Add to Favorites</Text>
                                    <Text style={[styles.addressLabel, { color: themeColors.secondaryText }]}>{pendingLocation?.address}</Text>

                                    <TextInput
                                        style={[styles.nameInput, { backgroundColor: isDark ? themeColors.background : '#F8FAFC', borderColor: themeColors.border, color: themeColors.text }]}
                                        value={customName}
                                        onChangeText={setCustomName}
                                        placeholder="Give it a name (e.g., Home)"
                                        placeholderTextColor={themeColors.secondaryText}
                                        autoFocus
                                    />
                                    <Text style={[{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: themeColors.button }]}>SAVE LOCATION AS</Text>
                                    {/* Suggestions */}
                                    <View style={styles.suggestionContainer}>
                                        {filteredSuggestions.map((name) => (
                                            <TouchableOpacity
                                                key={name}
                                                style={[styles.chip, { backgroundColor: isDark ? themeColors.iconBox : '#F1F5F9', borderColor: themeColors.border }]}
                                                onPress={() => setCustomName(name)}
                                            >
                                                <Text style={[styles.chipText, { color: themeColors.text }]}>{name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={[styles.modalBtn, styles.cancelBtn, { backgroundColor: isDark ? themeColors.background : '#F1F5F9', borderColor: themeColors.border, borderWidth: isDark ? 1 : 0 }]}
                                            onPress={() => setIsFavModalVisible(false)}
                                        >
                                            <Text style={[styles.cancelBtnText, { color: themeColors.secondaryText }]}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.modalBtn, styles.saveBtn, { backgroundColor: isDark ? themeColors.text : '#1E293B' }]}
                                            onPress={handleConfirmSave}
                                        >
                                            <Text style={[styles.saveBtnText, { color: isDark ? themeColors.card : 'white' }]}>Save Favorite</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>

                        {/* SCROLLABLE CONTENT */}
                        <ScrollView contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 40 }}>
                            {/* FAVORITES SECTION */}
                            {favoriteLocations.length > 0 && (
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 10
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.secondaryText, letterSpacing: 1 }}>
                                        FAVOURITES
                                    </Text>
                                </View>
                            )}

                            {favoriteLocations.length === 0 ? (
                                <View style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 40,
                                }}>
                                    <Text style={{ color: themeColors.secondaryText }}>No favorite places yet. Start searching to add some!</Text>
                                </View>
                            ) : (
                                <View style={{
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: 10,
                                    padding: 10,
                                }}>
                                    {favoriteLocations.map((item: SavedLocation, index: number) => (
                                        <TouchableOpacity style={{
                                            backgroundColor: themeColors.iconBox,
                                            borderRadius: 8,
                                            paddingHorizontal: 12,
                                            paddingVertical: 8,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: themeColors.border,
                                        }} key={item.id || index}
                                            onPress={() => handleSelectFavourites(item)}
                                        >
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: '600',
                                                color: themeColors.text,
                                                marginRight: 6,
                                            }} numberOfLines={2}>
                                                {item.showname ? item.showname : item.name}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => onToggleFavorite(item)}
                                            >
                                                <MaterialCommunityIcons
                                                    name={"heart"}
                                                    size={20}
                                                    color={"#FF0000"}
                                                />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))}
                                    {favoriteLocations.length >= 10 ? (
                                        <View style={styles.limitReachedContainer}>
                                            <Text style={styles.limitReachedText}>
                                                Limit reached. Delete a favorite location to add a new one.
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            )}

                            {/* CURRENT LOCATION BUTTON */}
                            {type === 'start' && (
                                <TouchableOpacity
                                    onPress={handlePress}
                                    disabled={loading}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 14,
                                        backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#EFF6FF',
                                        borderRadius: 12,
                                        marginVertical: 10,
                                        paddingHorizontal: 12,
                                        borderWidth: isDark ? 1 : 0,
                                        borderColor: themeColors.primary
                                    }}
                                >
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 20,
                                        backgroundColor: themeColors.primary, alignItems: 'center',
                                        justifyContent: 'center', marginRight: 15
                                    }}>
                                        {loading ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <MaterialCommunityIcons name="crosshairs-gps" size={22} color="white" />
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '800', color: themeColors.primary }}>
                                            {loading ? "Locating..." : "Use Current Location"}
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={themeColors.primary} />
                                </TouchableOpacity>
                            )}

                            {/* RECENT LOCATIONS SECTION */}
                            {savedRecents.length > 0 && search.length === 0 && (
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: 20,
                                    marginBottom: 10
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.secondaryText, letterSpacing: 1 }}>
                                        RECENT
                                    </Text>
                                    <TouchableOpacity onPress={clearRecents}>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: themeColors.primary }}>
                                            Clear All
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* RECENT LOCATIONS LIST */}
                            {search.length === 0 && savedRecents.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        onSelect(item.name, item.address, item.lat, item.lng);
                                        onClose();
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: themeColors.border
                                    }}
                                >
                                    <View style={{
                                        width: 44, height: 44, borderRadius: 22,
                                        backgroundColor: themeColors.iconBox, alignItems: 'center',
                                        justifyContent: 'center', marginRight: 15
                                    }}>
                                        <MaterialCommunityIcons name="clock-outline" size={22} color={themeColors.secondaryText} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: themeColors.text }}>
                                            {item.name}
                                        </Text>
                                        <Text numberOfLines={1} style={{ fontSize: 13, color: themeColors.secondaryText, marginTop: 2 }}>
                                            {item.address}
                                        </Text>
                                    </View>

                                    {/* Favorite Toggle */}
                                    <TouchableOpacity
                                        onPress={() => handleToggleFavoriteFromRecents(item)}
                                        style={{
                                            paddingHorizontal: 10,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={favoriteLocations.some(f => f.id === item.id) ? "heart" : "heart-outline"}
                                            size={24}
                                            color={favoriteLocations.some(f => f.id === item.id) ? "#FF0000" : themeColors.border}
                                        />
                                    </TouchableOpacity>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={themeColors.border} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* CONFIRMATION ALERT */}
                    <CustomAlert
                        visible={isAlertVisible}
                        title={alertMode === 'remove' ? "Remove Favorite" : "Add Favorite"}
                        message={
                            alertMode === 'remove'
                                ? `Are you sure you want to remove "${selectedLocation?.name}" from your favorites?`
                                : `Do you want to save "${selectedLocation?.name}" to your favorite places?`
                        }
                        type={alertMode === 'remove' ? 'danger' : 'info'}
                        confirmText={alertMode === 'remove' ? 'Remove' : 'Save'}
                        onConfirm={confirmToggle}
                        onCancel={() => {
                            setAlertVisible(false);
                            setSelectedLocation(null);
                        }}
                    />
                </View>
            </Pressable>
        </Modal>
    );
};

export default LocationSearchModal;