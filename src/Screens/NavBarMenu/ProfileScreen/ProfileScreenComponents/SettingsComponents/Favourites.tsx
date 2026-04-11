import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Modal,
    Pressable,
    Alert,
    Platform,
    ToastAndroid,
    TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../redux/store';
import colors from '../../../../../constant/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SavedLocation } from '../../../../../service/utils/storage';
import { useUpdateUserMutation } from '../../../../../service/userApi';
import { updateUserStore } from '../../../../../redux/userSlice';
// 👈 Import your responsive utilities
import { hS, vS, mS } from '../../../../../lib/responsive';
import { useAppTheme } from "../../../../../hooks/useAppTheme";

const Favourites = () => {
    const insets = useSafeAreaInsets();
    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const [savedPlaces, setSavedPlaces] = useState(localuser?.favourite_places || []);
    const dispatch = useDispatch();
    const [updateUser] = useUpdateUserMutation();
    const { colors: appColors, isDark } = useAppTheme();

    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [renameVisible, setRenameVisible] = useState(false);
    const [newName, setNewName] = useState('');

    const handleOpenOptions = (item: any) => {
        setSelectedItem(item);
        setOptionsVisible(true);
    };

    const handleCloseOptions = () => {
        setOptionsVisible(false);
        setSelectedItem(null);
    };

    const handleSync = async (updatedArray: SavedLocation[]) => {
        setSavedPlaces(updatedArray);
        try {
            const payload = {
                id: localuser.id,
                favourite_places: updatedArray
            };
            const response = await updateUser(payload).unwrap();
            if (response.success) {
                dispatch(updateUserStore({ favourite_places: response.data.favourite_places }));
                ToastAndroid.show("Favorites updated successfully", ToastAndroid.SHORT);
            }
        } catch (error) {
            setSavedPlaces(localuser?.favourite_places || []);
            Alert.alert('Limit Reached! Delete a Location to Add!');
        }
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        const updated = savedPlaces.filter((f: SavedLocation) => f.id !== selectedItem.id);
        handleCloseOptions();
        await handleSync(updated);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Place",
            `Are you sure you want to remove "${selectedItem?.showname || selectedItem?.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: confirmDelete }
            ]
        );
    };

    const handleRename = () => {
        setNewName(selectedItem?.showname || selectedItem?.name || '');
        setOptionsVisible(false);
        setRenameVisible(true);
    };

    const confirmRename = async () => {
        if (!newName.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }
        const updated = savedPlaces.map((f: SavedLocation) =>
            f.id === selectedItem.id ? { ...f, showname: newName.trim() } : f
        );
        setRenameVisible(false);
        await handleSync(updated);
    };

    const getIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'home': return 'home-outline';
            case 'work': return 'briefcase-outline';
            default: return 'map-marker-outline';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: appColors.card, borderColor: appColors.border }]} activeOpacity={0.8}>
            <View style={styles.cardLeft}>
                <View style={[styles.iconContainer, { backgroundColor: item.showname?.toLowerCase() === 'home' ? (isDark ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E9') : item.showname?.toLowerCase() === 'work' ? (isDark ? 'rgba(33, 150, 243, 0.15)' : '#E3F2FD') : appColors.iconBox }]}>
                    <MaterialCommunityIcons
                        name={getIcon(item.showname)}
                        size={mS(24)}
                        color={item.showname?.toLowerCase() === 'home' ? '#4CAF50' : item.showname?.toLowerCase() === 'work' ? '#2196F3' : colors.icon}
                    />
                </View>
                <View style={styles.textGroup}>
                    <Text style={[styles.titleText, { color: appColors.text }]}>{item?.showname || item?.name || 'Other'}</Text>
                    <Text style={[styles.addressText, { color: appColors.secondaryText }]} numberOfLines={1}>
                        {item.address || 'No address provided'}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.moreButton}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                onPress={() => handleOpenOptions(item)}
            >
                <MaterialCommunityIcons name="dots-vertical" size={mS(20)} color={appColors.secondaryText} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const EmptyList = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: appColors.iconBox }]}>
                <MaterialCommunityIcons name="map-marker-star-outline" size={mS(80)} color={appColors.secondaryText} />
            </View>
            <Text style={[styles.emptyText, { color: appColors.text }]}>No Saved Places</Text>
            <Text style={[styles.emptySubText, { color: appColors.secondaryText }]}>Save your favorite destinations for a faster booking experience.</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={appColors.background} />
            <View style={styles.content}>
                <FlatList
                    data={savedPlaces}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={EmptyList}
                />
            </View>

            {/* Options Bottom Sheet Modal */}
            <Modal statusBarTranslucent navigationBarTranslucent visible={optionsVisible} transparent={true} animationType="slide">
                <Pressable style={styles.modalOverlay} onPress={handleCloseOptions}>
                    <View style={[styles.optionsCard, { backgroundColor: appColors.card }]}>
                        <View style={[styles.indicator, { backgroundColor: appColors.border }]} />
                        <View style={styles.modalHeader}>
                            <Text style={[styles.optionsHeader, { color: appColors.secondaryText }]}>Location Options</Text>
                            <Text style={[styles.selectedItemName, { color: appColors.text }]} numberOfLines={1}>{selectedItem?.showname || selectedItem?.name}</Text>
                        </View>

                        <TouchableOpacity style={styles.optionRow} onPress={handleRename}>
                            <View style={[styles.optionIconContainer, { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.15)' : '#F0F7FF' }]}>
                                <MaterialCommunityIcons name="pencil-outline" size={mS(20)} color={isDark ? '#60A5FA' : '#007AFF'} />
                            </View>
                            <Text style={[styles.optionText, { color: appColors.text }]}>Rename Location</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionRow} onPress={handleDelete}>
                            <View style={[styles.optionIconContainer, { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : '#FFF0F0' }]}>
                                <MaterialCommunityIcons name="trash-can-outline" size={mS(20)} color="#FF3B30" />
                            </View>
                            <Text style={[styles.optionText, { color: '#FF3B30' }]}>Remove from Favorites</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.cancelActionBtn, { backgroundColor: appColors.iconBox }]} onPress={handleCloseOptions}>
                            <Text style={[styles.cancelActionText, { color: appColors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Rename Modal */}
            <Modal statusBarTranslucent navigationBarTranslucent visible={renameVisible} transparent={true} animationType="fade">
                <View style={[styles.renameOverlay, isDark && { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                    <View style={[styles.renameCard, { backgroundColor: appColors.card }]}>
                        <Text style={[styles.renameTitle, { color: appColors.text }]}>Rename Favorite</Text>
                        <Text style={[styles.renameSubtitle, { color: appColors.secondaryText }]}>Give your location a recognizable name</Text>

                        <View style={[styles.inputWrapper, { backgroundColor: appColors.background, borderColor: appColors.border }]}>
                            <TextInput
                                style={[styles.textInput, { color: appColors.text }]}
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="e.g., My Favorite Cafe"
                                autoFocus={true}
                                placeholderTextColor={appColors.secondaryText}
                            />
                            {newName.length > 0 && (
                                <TouchableOpacity onPress={() => setNewName('')}>
                                    <MaterialCommunityIcons name="close-circle" size={mS(18)} color="#CCC" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn, { backgroundColor: appColors.card, borderColor: appColors.border }]} onPress={() => setRenameVisible(false)}>
                                <Text style={[styles.cancelBtnText, { color: appColors.text }]}>Discard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.saveBtn, !newName.trim() && { opacity: 0.6 }]}
                                onPress={confirmRename}
                                disabled={!newName.trim()}
                            >
                                <Text style={styles.saveBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: hS(20),
        paddingTop: vS(15),
        paddingBottom: vS(30),
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: mS(16),
        borderRadius: mS(20),
        marginBottom: vS(16),
        borderWidth: 1,
        borderColor: '#F0F0F0',
        // Premium subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: mS(48),
        height: mS(48),
        borderRadius: mS(14),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(16),
    },
    textGroup: {
        flex: 1,
    },
    titleText: {
        fontSize: mS(17),
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: vS(2),
    },
    addressText: {
        fontSize: mS(13),
        color: '#808080',
        lineHeight: mS(18),
    },
    moreButton: {
        padding: mS(8),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: vS(80),
    },
    emptyIconWrapper: {
        width: mS(120),
        height: mS(120),
        borderRadius: mS(60),
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(24),
    },
    emptyText: {
        fontSize: mS(20),
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: vS(8),
    },
    emptySubText: {
        fontSize: mS(15),
        color: '#666666',
        textAlign: 'center',
        paddingHorizontal: hS(40),
        lineHeight: mS(22),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    optionsCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: mS(32),
        borderTopRightRadius: mS(32),
        paddingHorizontal: hS(24),
        paddingBottom: Platform.OS === 'ios' ? vS(40) : vS(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    indicator: {
        width: hS(36),
        height: vS(4),
        backgroundColor: '#E5E5E5',
        borderRadius: mS(2),
        alignSelf: 'center',
        marginTop: vS(12),
        marginBottom: vS(24),
    },
    modalHeader: {
        marginBottom: vS(20),
    },
    optionsHeader: {
        fontSize: mS(14),
        fontWeight: '600',
        color: '#999999',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    selectedItemName: {
        fontSize: mS(20),
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: vS(4),
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(16),
    },
    optionIconContainer: {
        width: mS(40),
        height: mS(40),
        borderRadius: mS(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(16),
    },
    optionText: {
        fontSize: mS(16),
        fontWeight: '600',
        color: '#333333',
    },
    cancelActionBtn: {
        marginTop: vS(8),
        paddingVertical: vS(16),
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: mS(16),
    },
    cancelActionText: {
        fontSize: mS(16),
        fontWeight: '700',
        color: '#666666',
    },
    renameOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: hS(24),
    },
    renameCard: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderRadius: mS(28),
        padding: mS(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 10,
    },
    renameTitle: {
        fontSize: mS(22),
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: vS(8),
    },
    renameSubtitle: {
        fontSize: mS(14),
        color: '#666666',
        marginBottom: vS(24),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: mS(16),
        paddingHorizontal: hS(16),
        borderWidth: 1,
        borderColor: '#E9ECEF',
        marginBottom: vS(24),
    },
    textInput: {
        flex: 1,
        height: vS(56),
        fontSize: mS(16),
        color: '#1A1A1A',
        fontWeight: '600',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: hS(12),
    },
    modalBtn: {
        flex: 1,
        height: vS(56),
        borderRadius: mS(18),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    saveBtn: {
        backgroundColor: colors.button,
    },
    cancelBtnText: {
        fontSize: mS(16),
        fontWeight: '700',
        color: '#666666',
    },
    saveBtnText: {
        fontSize: mS(16),
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default Favourites;