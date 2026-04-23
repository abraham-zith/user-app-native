import React, { useEffect, useState } from 'react';
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
    const { colors, isDark } = useAppTheme();
    const user = useSelector((state: RootState) => state.userSlice.user);
    console.log("user", user);
    const dispatch = useDispatch()
    const [updateUser] = useUpdateUserMutation();

    const [search, setSearch] = useState("");
    const [savedRecents, setSavedRecents] = useState<SavedLocation[]>([]);

    const { getCurrentLocation, getAddressFromCoords, loading } = useLocation();
    const [favoriteLocations, setFavoriteLocations] = useState<SavedLocation[]>(user?.favourite_places || []);
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
    const [alertMode, setAlertMode] = useState<'add' | 'remove'>('add');
    const [pendingLocation, setPendingLocation] = useState<any>(null); // Temporary storage
    const [isFavModalVisible, setIsFavModalVisible] = useState(false);
    const [customName, setCustomName] = useState('');
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

    const clearRecents = async () => {
        try {
            await AsyncStorage.removeItem(RECENT_LOCATIONS_KEY);
            setSavedRecents([]);
        } catch (e) {
            Alert.alert('Error Clearing Recents!!!', 'Try Again Later');
            // console.error("Error clearing recents", e);
        }
    };

    const handlePress = async () => {
        try {
            const position = await getCurrentLocation();
            const { latitude, longitude } = position.coords;
            const address = await getAddressFromCoords(latitude, longitude)

            // Note: You can add Reverse Geocoding here to get the street name
            onSelect("Current Location", address?.formatted, latitude, longitude);
            onClose()
        } catch (error) {
        }
    };

    const handleToggleFavoriteFromSearch = async (data: any) => {

        try {
            const idToFind = data.place_id || data.id;
            const isExist = favoriteLocations.find(f => f.id === idToFind);


            if (isExist) {
                // If it exists, we just remove it (no API call needed)
                onToggleFavorite(isExist);
                return;
            }

            // If it's a NEW favorite, fetch coordinates from Google
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
                // If it exists, we trigger the removal confirmation
                onToggleFavorite(isExist);
            } else {
                // If it's NEW, open the naming modal
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
            // Sanitize data to avoid validation errors on backend (e.g. removing 'icon')
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

        // Use selectedLocation (which now has the custom name)
        const updated = alertMode === 'remove'
            ? favoriteLocations.filter(f => f.id !== selectedLocation.id)
            : [...favoriteLocations, selectedLocation];



        setAlertVisible(false);
        await handleSync(updated);

        // Clear everything
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

        // Prepare the final object with the user-defined name
        const finalFav = {
            ...pendingLocation,
            showname: customName.trim(),
        };

        setIsFavModalVisible(false);

        // Set this as the 'selected' item so confirmToggle knows what to add
        setSelectedLocation(finalFav);
        setAlertMode('add');
        setAlertVisible(true);
    };

    const allSuggestions = ["Home", "Work", "Gym", "Office"];

    const filteredSuggestions = allSuggestions.filter((suggestion) => {
        // Check if this label is already taken in your favorites list
        const isAlreadyUsed = favoriteLocations.some(
            (fav) =>
                fav.showname?.toLowerCase() === suggestion.toLowerCase() ||
                fav.name?.toLowerCase() === suggestion.toLowerCase()
        );
        return !isAlreadyUsed; // Only keep suggestions NOT in the favorites list
    });


    useEffect(() => {
        if (user?.favourite_places) {
            setFavoriteLocations(user.favourite_places);
        }
    }, [user?.favourite_places]);

    return (
        <Modal statusBarTranslucent navigationBarTranslucent visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
            {/* BACKDROP */}
            <Pressable
                onPress={onClose}
                style={{ flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
            >
                {/* SHEET CONTAINER */}
                <View
                    onStartShouldSetResponder={() => true} // Prevents taps on sheet from closing modal
                    style={{
                        backgroundColor: colors.card,
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
                    <View style={{ width: 40, height: 5, backgroundColor: isDark ? colors.border : '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 }} />

                    {/* HEADER */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
                            {type === "start" ? "Set Pickup" : "Set Drop-off"}
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{ backgroundColor: colors.iconBox, padding: 8, borderRadius: 25 }}
                        >
                            <MaterialCommunityIcons name="close" size={20} color={colors.secondaryText} />
                        </TouchableOpacity>
                    </View>

                    {/* SEARCH INPUT BOX */}

                    <View style={{ flex: 1, paddingHorizontal: 20 }}>
                        <GooglePlacesAutocomplete
                            placeholder={type === "start" ? "Search Pickup Location" : "Search Destination"}
                            textInputProps={{
                                placeholderTextColor: '#999',
                            }}
                            minLength={2}
                            fetchDetails={true} // Important to get lat/lng if needed
                            onPress={async (data, details = null) => {


                                const locationName = details?.name || data.structured_formatting.main_text;
                                const address = data.description;
                                const lat = details?.geometry?.location?.lat ?? 0;
                                const lng = details?.geometry?.location?.lng ?? 0;

                                const newRecent = {
                                    id: data.place_id, // Use Google's unique ID
                                    name: locationName,
                                    address: address,
                                    lat: lat,
                                    lng: lng,
                                    icon: "clock-outline"
                                };

                                // 2. Save to Storage (Helper function below)
                                await saveToRecents(newRecent);

                                onSelect(locationName, address, lat, lng);
                                onClose();
                            }}

                            query={{
                                key: GOOGLE_P_API_KEY,
                                language: 'en',
                                components: 'country:in', // Optional: Limit to India
                            }}
                            styles={{
                                container: { flex: 0, marginBottom: 10 },
                                textInput: {
                                    height: 56,
                                    backgroundColor: isDark ? colors.background : '#F8FAFC',
                                    borderRadius: 16,
                                    paddingHorizontal: 15,
                                    fontSize: 16,
                                    color: colors.text,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    fontWeight: '500',
                                },
                                listView: { backgroundColor: colors.card },
                                row: { paddingVertical: 10, flexDirection: 'row', backgroundColor: colors.card },
                                description: { fontWeight: '700', color: colors.text },
                                separator: { height: 1, backgroundColor: colors.border }
                            }}
                            // Customizing the row icons to match your theme
                            renderRow={(data) => {
                                const isFav = favoriteLocations.some(f => f.id === data.place_id);
                                return (
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: '100%',
                                        paddingVertical: 8 // Added for better touch spacing
                                    }}>
                                        {/* 1. Left Icon: Fixed width by content */}
                                        <MaterialCommunityIcons
                                            name="map-marker-outline"
                                            size={22}
                                            color={colors.secondaryText}
                                            style={{ marginRight: 15 }}
                                        />

                                        {/* 2. Middle Text Area: Fills all remaining space */}
                                        <View style={{ flex: 1, overflow: 'hidden' }}>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={{ fontSize: 15, fontWeight: '700', color: colors.text }}
                                            >
                                                {data.structured_formatting.main_text}
                                            </Text>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={{ fontSize: 12, color: colors.secondaryText }}
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

                        <Modal statusBarTranslucent navigationBarTranslucent visible={isFavModalVisible} transparent animationType="slide">
                            <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
                                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>Add to Favorites</Text>
                                    <Text style={[styles.addressLabel, { color: colors.secondaryText }]}>{pendingLocation?.address}</Text>

                                    <TextInput
                                        style={[styles.nameInput, { backgroundColor: isDark ? colors.background : '#F8FAFC', borderColor: colors.border, color: colors.text }]}
                                        value={customName}
                                        onChangeText={setCustomName}
                                        placeholder="Give it a name (e.g., Home)"
                                        placeholderTextColor={colors.secondaryText}
                                        autoFocus
                                    />
                                    <Text style={[{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.button }]}>SAVE LOCATION AS</Text>
                                    {/* Suggestions */}
                                    <View style={styles.suggestionContainer}>
                                        {filteredSuggestions.map((name) => (
                                            <TouchableOpacity
                                                key={name}
                                                style={[styles.chip, { backgroundColor: isDark ? colors.iconBox : '#F1F5F9', borderColor: colors.border }]}
                                                onPress={() => setCustomName(name)}
                                            >
                                                <Text style={[styles.chipText, { color: colors.text }]}>{name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={[styles.modalBtn, styles.cancelBtn, { backgroundColor: isDark ? colors.background : '#F1F5F9', borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}
                                            onPress={() => setIsFavModalVisible(false)}
                                        >
                                            <Text style={[styles.cancelBtnText, { color: colors.secondaryText }]}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.modalBtn, styles.saveBtn, { backgroundColor: isDark ? colors.text : '#1E293B' }]}
                                            onPress={handleConfirmSave}
                                        >
                                            <Text style={[styles.saveBtnText, { color: isDark ? colors.card : 'white' }]}>Save Favorite</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>

                        <ScrollView contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 40 }}>
                            {favoriteLocations.length > 0 && (
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    // marginTop: 10,
                                    marginBottom: 10
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.secondaryText, letterSpacing: 1 }}>
                                        FAVOURITES
                                    </Text>
                                    {/* <TouchableOpacity onPress={clearRecents}>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB' }}>
                                            Clear All
                                        </Text>
                                    </TouchableOpacity> */}
                                </View>
                            )}
                            {favoriteLocations.length === 0 ? (
                                <View style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 40,
                                }}>
                                    <Text style={{ color: colors.secondaryText }}>No favorite places yet. Start searching to add some!</Text>
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
                                            backgroundColor: colors.iconBox,
                                            borderRadius: 8,
                                            paddingHorizontal: 12,
                                            paddingVertical: 8,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                        }} key={item.id || index}
                                            onPress={() => handleSelectFavourites(item)}
                                        >
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: '600',
                                                color: colors.text,
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
                                        borderColor: colors.primary
                                    }}
                                >
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 20,
                                        backgroundColor: colors.primary, alignItems: 'center',
                                        justifyContent: 'center', marginRight: 15
                                    }}>
                                        {loading ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <MaterialCommunityIcons name="crosshairs-gps" size={22} color="white" />
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary }}>
                                            {loading ? "Locating..." : "Use Current Location"}
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            )}

                            {/* RECENT SECTION HEADER */}
                            {savedRecents.length > 0 && search.length === 0 && (
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: 20,
                                    marginBottom: 10
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.secondaryText, letterSpacing: 1 }}>
                                        RECENT
                                    </Text>
                                    <TouchableOpacity onPress={clearRecents}>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                                            Clear All
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* RECENT LIST ITEMS */}
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
                                        borderBottomColor: colors.border
                                    }}
                                >
                                    <View style={{
                                        width: 44, height: 44, borderRadius: 22,
                                        backgroundColor: colors.iconBox, alignItems: 'center',
                                        justifyContent: 'center', marginRight: 15
                                    }}>
                                        <MaterialCommunityIcons name="clock-outline" size={22} color={colors.secondaryText} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                                            {item.name}
                                        </Text>
                                        <Text numberOfLines={1} style={{ fontSize: 13, color: colors.secondaryText, marginTop: 2 }}>
                                            {item.address}
                                        </Text>
                                    </View>

                                    {/* Favorite Toggle for Recents */}
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
                                            color={favoriteLocations.some(f => f.id === item.id) ? "#FF0000" : colors.border}
                                        />
                                    </TouchableOpacity>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

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
                            onConfirm={confirmToggle} // Logic runs here
                            onCancel={() => {
                                setAlertVisible(false);
                                setSelectedLocation(null); // Clean up
                            }}
                        />

                    </View>

                </View>
            </Pressable>
        </Modal>
    );
};


export default LocationSearchModal;