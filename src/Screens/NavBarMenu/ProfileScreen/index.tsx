import { View, ActivityIndicator, TouchableOpacity, Dimensions, Modal, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Platform, Alert, ToastAndroid, Pressable } from "react-native"
import { Text } from "../../../Components"
import { Styles } from "../../../lib/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    ProfilescreenComponents_Nav,
    RatingScreen_Nav,
    HelpScreen_Nav,
    PaymentScreen_Nav,
    ActivityScreen_Nav,
    ReferAndEarnScreen_Nav,
    SettingsScreen_Nav,
    ProfileUpdateScreen_Nav
} from "../../../Navigations/navigations";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from "../../../Components/Button";
import fonts from "../../../constant/fonts";
import { useEffect, useState } from "react";
import { RootState } from '../../../redux/store';
import { useDispatch, useSelector } from "react-redux";
// import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import ImagePicker from "react-native-image-crop-picker";
import { useDeleteDocumentMutation, useGetUploadUrlMutation, useUploadImageToS3Mutation } from '../../../service/userApi';
import { useUpdateUserMutation } from '../../../service/userApi';
import { updateUserStore } from '../../../redux/userSlice';
import Config from 'react-native-config';
import { useCameraPermission } from "../../../hooks/useCamera";
import { hS, mS, vS } from "../../../lib/responsive";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getLoggedUser } from "../../../service/validation";
import Skeleton from "../../../Components/Skeleton";
import FastImage from "react-native-fast-image";
import { useAppTheme } from "../../../hooks/useAppTheme";

const ProfileScreenSkeleton = () => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useAppTheme();
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + vS(20) }}
            >
                {/* --- PREMIUM PROFILE CARD SKELETON --- */}
                <View style={[styles.premiumCard, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#64748B' }]}>
                    <View style={styles.headerContent}>
                        <Skeleton width={90} height={90} borderRadius={45} />
                        <View style={{ marginLeft: 20, flex: 1, gap: 10 }}>
                            <Skeleton width="70%" height={24} />
                            <Skeleton width="50%" height={16} />
                            <Skeleton width={100} height={30} borderRadius={20} />
                        </View>
                    </View>
                </View>

                {/* --- MENU SKELETON --- */}
                <View style={[styles.menuContainer, { backgroundColor: colors.card, shadowColor: '#000' }]}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <View key={i} style={[styles.menuItem, { gap: 16, borderBottomColor: colors.border }]}>
                            <Skeleton width={40} height={40} borderRadius={12} />
                            <Skeleton width="60%" height={20} />
                            <View style={{ flex: 1 }} />
                            <Skeleton width={20} height={20} borderRadius={10} />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};


const SCREEN_WIDTH = Dimensions.get('window').width;
const CROP_SIZE = SCREEN_WIDTH * 0.8;

const ProfileScreen: React.FC<ScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useAppTheme();
    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const dispatch = useDispatch()

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [profileUri, setProfileUri] = useState<string | null>(localuser?.profile_url || null);
    const [isUploading, setIsUploading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [isViewVisible, setIsViewVisible] = useState(false);
    const [getUploadUrl] = useGetUploadUrlMutation();
    const [uploadImageToS3] = useUploadImageToS3Mutation();
    const [updateUser] = useUpdateUserMutation();
    const [deleteDocument] = useDeleteDocumentMutation();
    const { requestCameraPermission } = useCameraPermission();

    const imageSource = profileUri || localuser?.profile_url;
    const BASE_URL = `${Config.DEV_BACKEND_URL}/api`;
    const proxiedImageSource = imageSource ? (imageSource.startsWith('http') ? `${BASE_URL}/media/proxy?url=${encodeURIComponent(imageSource)}` : imageSource) : null;

    interface ProfileImagePickerProps {
        isVisible: boolean;
        onClose: () => void;
        onCamera: () => void;
        onGallery: () => void;
        onRemove?: () => void;
    }
    const ProfileImagePicker = ({ isVisible, onClose, onCamera, onGallery, onRemove }: ProfileImagePickerProps) => {
        return (
            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={onClose}
                statusBarTranslucent={true}
                navigationBarTranslucent={true}
            >
                <Pressable style={styles.modaloverlay} onPress={onClose}>
                    <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + vS(20) }]}>
                        <View style={[styles.handle, { backgroundColor: colors.border }]} />
                        <Text style={[styles.title, { color: colors.text }]}>Profile Photo</Text>

                        <View style={styles.optionsRow}>
                            <TouchableOpacity style={styles.option} onPress={onCamera}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.iconBox }]}>
                                    <MaterialCommunityIcons name="camera" size={30} color={colors.primary} />
                                </View>
                                <Text style={[styles.optionLabel, { color: colors.text }]}>Camera</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.option} onPress={onGallery}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.iconBox }]}>
                                    <MaterialCommunityIcons name="image-multiple" size={30} color={colors.primary} />
                                </View>
                                <Text style={[styles.optionLabel, { color: colors.text }]}>Gallery</Text>
                            </TouchableOpacity>

                            {imageSource && (
                                <TouchableOpacity style={styles.option} onPress={onRemove}>
                                    <View style={[styles.iconCircle, { backgroundColor: isDark ? '#450a0a' : '#FEE2E2' }]}>
                                        <MaterialCommunityIcons name="trash-can-outline" size={30} color="#EF4444" />
                                    </View>
                                    <Text style={[styles.optionLabel, { color: colors.text }]}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Bottom filler to ensure no gap is visible */}
                        <View style={{
                            position: 'absolute',
                            bottom: -100,
                            left: 0,
                            right: 0,
                            height: 100,
                            backgroundColor: colors.background
                        }} />
                    </View>
                </Pressable>
            </Modal>
        );
    };

    const FullScreenImageModal = () => {
        return (
            <Modal
                visible={isViewVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsViewVisible(false)}
                statusBarTranslucent={true}
                navigationBarTranslucent={true}
            >
                <View style={styles.fullScreenContainer}>
                    {/* Header Overlay */}
                    <View style={[styles.fullScreenHeader, { paddingTop: insets.top + vS(10) }]}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity
                                onPress={() => setIsViewVisible(false)}
                                style={styles.headerIconButton}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="arrow-left" size={mS(28)} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.fullScreenTitle}>Profile photo</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                setIsViewVisible(false);
                                setTimeout(() => setPickerVisible(true), 300);
                            }}
                            style={styles.headerIconButton}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="pencil" size={mS(24)} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Image Viewer */}
                    <View style={styles.fullScreenImageWrapper}>
                        {imageSource ? (
                            <FastImage
                                source={{ uri: proxiedImageSource || '', priority: FastImage.priority.high }}
                                style={styles.fullScreenImage}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        ) : (
                            <View style={styles.fullScreenPlaceholder}>
                                <FontAwesome name="user" size={mS(150)} color="#475569" />
                                <Text style={styles.noPhotoText}>No profile photo</Text>
                            </View>
                        )}
                    </View>

                    {/* Bottom Gradient/Overlay for depth (Optional) */}
                    <View style={styles.bottomOverlay} />
                </View>
            </Modal>
        );
    };
    const cropperConfig = {
        width: 500,
        height: 500,
        cropping: true,
        cropperCircleOverlay: true, // Makes the cropping UI circular
        compressImageQuality: 0.6,
        mediaType: 'photo' as const,
        cropperStatusBarColor: 'black',
        cropperToolbarColor: 'black',
        cropperToolbarWidgetColor: 'white',
    };

    const deleteOldProfileImage = async () => {
        try {
            if (!localuser?.profile_url) return;

            const filename = localuser.profile_url.split('/').pop();
            if (!filename) return;

            const payload = {
                userId: localuser.id,
                documentType: filename
            };

            console.log('Deleting old image:', payload);
            await deleteDocument(payload).unwrap();
            console.log("Old image deleted successfully");

        } catch (error) {
            console.error("Error deleting old document:", error);
            // We log but don't necessarily block the next step
        }
    };

    const uploadNewProfileImage = async (uri: string, mimeType: string) => {
        try {
            const filename = uri.split('/').pop() || `profile_${Date.now()}`;

            // Get presigned URL
            const payload = {
                userId: localuser.id,
                documentType: `profile_picture_${filename}`,
                contentType: mimeType,
            };

            const response = await getUploadUrl(payload).unwrap();
            const uploadUrl = response.data.uploadUrl || response.data.data.uploadUrl;

            // Fetch and upload image
            const responseFile = await fetch(uri);
            const imageBlob = await responseFile.blob();

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: imageBlob,
                headers: { 'Content-Type': mimeType },
            });

            if (!uploadResponse.ok) {
                throw new Error("Upload failed");
            }

            // Update user profile
            const publicUrl = uploadUrl.split('?')[0];
            const updatePayload = {
                id: localuser.id,
                profile_url: publicUrl
            };

            const updateResponse = await updateUser(updatePayload).unwrap();

            if (updateResponse.success) {
                setProfileUri(publicUrl);
                dispatch(updateUserStore({ profile_url: updateResponse.data.profile_url }));
                if (Platform.OS === 'android') {
                    ToastAndroid.show("Profile updated successfully", ToastAndroid.SHORT);
                }
                Alert.alert("Success", "Profile picture updated!");
            }

        } catch (error) {
            console.error("Error uploading new image:", error);
            throw error;
        }
    };

    const uploadProfileImage = async (uri: string, mimeType: string) => {
        setIsUploading(true);
        try {
            // Step 1: Delete old image if it exists
            await deleteOldProfileImage();

            // Step 2: Upload new image
            await uploadNewProfileImage(uri, mimeType);

        } catch (error) {
            console.error("Upload Error:", error);
            if (Platform.OS === 'android') {
                ToastAndroid.show("Could not save image to server", ToastAndroid.SHORT);
            }
            Alert.alert("Error", "Failed to upload profile picture.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageResult = async (image: any) => {
        console.log('Selected image:', image);
        const uri = image.path;
        const mimeType = image.mime || 'image/jpeg';

        setProfileUri(uri); // Show preview immediately
        await uploadProfileImage(uri, mimeType);
    };

    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();

        if (hasPermission) {
            ImagePicker.openCamera(cropperConfig)
                .then(handleImageResult)
                .catch(() => { });
        } else {
            if (Platform.OS === 'android') {
                ToastAndroid.show('App needs Permission to access camera', ToastAndroid.SHORT);
            }
            Alert.alert('Permission Denied', 'App needs Permission to access camera');
        }
    };

    const openGallery = () => {
        ImagePicker.openPicker(cropperConfig)
            .then(handleImageResult)
            .catch(() => { });
    };

    const handleCamera = () => {
        setPickerVisible(false);
        openCamera();
    };

    const handleGallery = () => {
        setPickerVisible(false);
        openGallery();
    };

    const handleRemove = async () => {
        setPickerVisible(false);
        setIsUploading(true);

        try {
            // Delete old image
            await deleteOldProfileImage();

            // Update user profile
            const payload = {
                id: localuser.id,
                profile_url: ""
            };

            const response = await updateUser(payload).unwrap();
            if (response.success) {
                setProfileUri(null);
                dispatch(updateUserStore({ profile_url: "" }));
                if (Platform.OS === 'android') {
                    ToastAndroid.show("Profile picture removed", ToastAndroid.SHORT);
                }
                Alert.alert("Success", "Profile picture removed!");
            }

        } catch (error) {
            console.error("Remove Error:", error);
            if (Platform.OS === 'android') {
                ToastAndroid.show("Could not remove image", ToastAndroid.SHORT);
            }
            Alert.alert("Error", "Failed to remove profile picture.");
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        async function loadUserData() {
            const json = await getLoggedUser();

            if (json?.data) {
                setUser(json.data);
            }

            setLoading(false);
        }

        loadUserData();
    }, []);


    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (!isUploading) {
                return;
            }

            // Prevent default behavior of leaving the screen
            e.preventDefault();

            if (Platform.OS === 'android') {
                ToastAndroid.show('Please wait while profile is updating...', ToastAndroid.SHORT);
            }
        });

        return unsubscribe;
    }, [navigation, isUploading]);

    if (loading) {
        return <ProfileScreenSkeleton />;
    }

    const buttons = [
        { id: 1, name: `${user?.rating || 0.0} My Rating`, iconName: 'star', component: RatingScreen_Nav },
        { id: 2, name: 'Help', iconName: 'help-circle-outline', component: HelpScreen_Nav },
        { id: 3, name: 'Payment', iconName: 'wallet-outline', component: PaymentScreen_Nav },
        { id: 4, name: 'Activity', iconName: 'clipboard-text-clock-outline', component: ActivityScreen_Nav },
        { id: 5, name: 'Refer and Earn', iconName: 'gift-open-outline', component: ReferAndEarnScreen_Nav },
        { id: 6, name: 'Settings', iconName: 'cog-outline', component: SettingsScreen_Nav },
    ]
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + vS(20) }}
            >
                {/* --- PREMIUM PROFILE CARD --- */}
                <View style={[styles.premiumCard, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#64748B' }]}>
                    <View style={styles.headerContent}>
                        {/* Profile Image with Edit Icon */}
                        <View style={styles.avatarWrapper}>
                            <TouchableOpacity
                                onPress={() => setIsViewVisible(true)}
                                activeOpacity={0.9}
                                style={styles.avatarMainButton}
                            >
                                <View style={[styles.largeAvatarContainer, { backgroundColor: colors.iconBox, borderColor: colors.background }]}>
                                    {imageSource ? (
                                        <>
                                            <FastImage
                                                source={{ uri: proxiedImageSource || '', priority: FastImage.priority.normal }}
                                                style={styles.largeImageStyle}
                                                resizeMode={FastImage.resizeMode.cover}
                                                onLoadStart={() => setIsImageLoading(true)}
                                                onLoadEnd={() => setIsImageLoading(false)}
                                            />
                                            {isImageLoading && (
                                                <View style={[StyleSheet.absoluteFillObject, styles.largePlaceholder, { backgroundColor: colors.iconBox }]}>
                                                    <Skeleton width="100%" height="100%" borderRadius={45} />
                                                </View>
                                            )}
                                        </>
                                    ) : (
                                        <View style={[styles.largePlaceholder, { backgroundColor: colors.iconBox }]}>
                                            <FontAwesome name="user" size={mS(50)} color={isDark ? colors.lightTextColor : '#CBD5E1'} />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setPickerVisible(true)}
                                activeOpacity={0.8}
                                style={[styles.cameraIconBadge, { borderColor: colors.card, backgroundColor: colors.primary }]}
                            >
                                <MaterialCommunityIcons name="camera" size={mS(16)} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.userInfoContainer}>
                            <Text style={[styles.userName, { color: colors.text }]}>{localuser?.full_name}</Text>
                            <Text style={[styles.userPhone, { color: colors.lightTextColor }]}>{localuser?.phone_number}</Text>

                            <TouchableOpacity
                                style={[styles.editProfileBtn, { backgroundColor: colors.iconBox }]}
                                onPress={() => navigation.navigate(ProfilescreenComponents_Nav, { screen: ProfileUpdateScreen_Nav, params: { user } })}
                            >
                                <MaterialCommunityIcons name="pencil" size={mS(14)} color={isDark ? colors.text : '#3B82F6'} />
                                <Text style={[styles.editProfileText, { color: isDark ? colors.text : '#3B82F6' }]}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* --- MENU OPTIONS LIST --- */}
                <View style={[styles.menuContainer, { backgroundColor: colors.card, shadowColor: '#000' }]}>
                    {buttons.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => navigation.navigate(ProfilescreenComponents_Nav, { screen: item.component })}
                            activeOpacity={0.7}
                            style={[
                                styles.menuItem,
                                index === 0 && styles.firstMenuItem,
                                index === buttons.length - 1 && styles.lastMenuItem,
                                { borderBottomColor: colors.border }
                            ]}
                        >
                            <View style={[styles.menuIconBox, { backgroundColor: colors.iconBox }]}>
                                <MaterialCommunityIcons
                                    name={item.iconName}
                                    size={mS(22)}
                                    color={item.iconName === 'star' ? '#F59E0B' : (isDark ? colors.primary : '#64748B')}
                                />
                            </View>

                            <View style={styles.menuLabelContainer}>
                                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.name}</Text>
                                {item.id === 1 && (
                                    <View style={styles.ratingBadge}>
                                        <Text style={styles.ratingBadgeText}>TOP RATED</Text>
                                    </View>
                                )}
                            </View>

                            <MaterialCommunityIcons name="chevron-right" size={mS(20)} color={colors.border} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- APP INFO SECTION --- */}
                <View style={styles.appInfoSection}>
                    <Text style={[styles.versionText, { color: colors.lightTextColor }]}>Version 1.0.42 (Beta)</Text>
                    <Text style={[styles.brandText, { color: colors.lightTextColor }]}>Made with ❤️ for T2Drive Users</Text>
                </View>

            </ScrollView>

            <ProfileImagePicker
                isVisible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onCamera={handleCamera}
                onGallery={handleGallery}
                onRemove={handleRemove}
            />

            <FullScreenImageModal />

            {/* --- UPLOADING OVERLAY --- */}
            {isUploading && (
                <Modal transparent={true} animationType="fade" visible={isUploading} statusBarTranslucent navigationBarTranslucent onRequestClose={() => {}}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <View style={{ backgroundColor: colors.card, padding: hS(24), borderRadius: mS(16), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={{ marginTop: vS(12), color: colors.text, fontSize: mS(16), fontWeight: '600' }}>Updating profile...</Text>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};



const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: hS(20),
        backgroundColor: 'white'
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: hS(15),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: mS(10)
    },
    avatar: {
        width: hS(70),
        height: hS(70), // Keep hS for height to maintain perfect circle
        borderRadius: hS(35)
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007AFF',
        width: hS(24),
        height: hS(24),
        borderRadius: hS(12),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: mS(2),
        borderColor: 'white'
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center'
    },
    modalTitle: {
        color: 'white',
        textAlign: 'center',
        marginBottom: vS(20),
        fontSize: mS(18)
    },
    cropWindow: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH, // Standard square aspect ratio for croppers
        backgroundColor: '#111'
    },
    largeImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        resizeMode: 'contain'
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circleHole: {
        width: CROP_SIZE,
        height: CROP_SIZE,
        borderRadius: CROP_SIZE / 2,
        borderWidth: mS(2),
        borderColor: 'white'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: vS(40)
    },
    cancelBtn: {
        paddingVertical: vS(15),
        width: hS(120),
        alignItems: 'center',
        borderRadius: mS(10),
        backgroundColor: '#444'
    },
    saveBtn: {
        paddingVertical: vS(15),
        width: hS(120),
        alignItems: 'center',
        borderRadius: mS(10),
        backgroundColor: '#007AFF'
    },

    modaloverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: mS(20),
        borderTopRightRadius: mS(20),
        paddingHorizontal: hS(20),
        paddingTop: vS(20),
        paddingBottom: vS(40), // Extra padding for home indicators/navigation bars
        alignItems: 'center',
    },
    handle: {
        width: hS(40),
        height: vS(5),
        backgroundColor: '#CCC',
        borderRadius: mS(3),
        marginBottom: vS(15),
    },
    title: {
        fontSize: mS(18),
        fontWeight: 'bold',
        marginBottom: vS(20),
        color: '#333',
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    option: {
        alignItems: 'center',
        width: hS(100),
    },
    iconCircle: {
        width: hS(60),
        height: hS(60), // Maintain circular aspect ratio
        borderRadius: hS(30),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(10),
    },
    optionLabel: {
        fontSize: mS(14),
        color: '#555',
        fontWeight: '500',
    },
    avatarContainer: {
        width: mS(70),
        height: mS(70),
        borderRadius: mS(35),
        overflow: 'hidden', // Ensures the image stays circular
        backgroundColor: '#E2E8F0', // Light grey background like WhatsApp
    },
    imageStyle: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#B1B3B5', // WhatsApp-like muted grey-blue
        justifyContent: 'center',
        alignItems: 'center',
    },
    // --- NEW PREMIUM STYLES ---
    premiumCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: mS(24),
        marginHorizontal: hS(16),
        marginTop: vS(16),
        paddingHorizontal: hS(20),
        paddingVertical: vS(20),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
    },
    largeAvatarContainer: {
        width: mS(90),
        height: mS(90),
        borderRadius: mS(45),
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        borderWidth: 3,
        borderColor: '#F8FAFC',
    },
    largeImageStyle: {
        width: '100%',
        height: '100%',
    },
    largePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3B82F6',
        width: mS(28),
        height: mS(28),
        borderRadius: mS(14),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 3,
    },
    userInfoContainer: {
        marginLeft: hS(20),
        flex: 1,
    },
    userName: {
        fontSize: mS(22),
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    userPhone: {
        fontSize: mS(14),
        color: '#64748B',
        marginTop: vS(2),
        fontWeight: '500',
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingHorizontal: hS(12),
        paddingVertical: vS(6),
        borderRadius: mS(20),
        marginTop: vS(10),
    },
    editProfileText: {
        fontSize: mS(12),
        color: '#3B82F6',
        fontWeight: '700',
        marginLeft: hS(4),
    },
    menuContainer: {
        marginTop: vS(24),
        marginHorizontal: hS(20),
        backgroundColor: '#FFFFFF',
        borderRadius: mS(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(16),
        paddingHorizontal: hS(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    firstMenuItem: {
        borderTopLeftRadius: mS(20),
        borderTopRightRadius: mS(20),
    },
    lastMenuItem: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: mS(20),
        borderBottomRightRadius: mS(20),
    },
    menuIconBox: {
        width: mS(40),
        height: mS(40),
        borderRadius: mS(12),
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabelContainer: {
        flex: 1,
        marginLeft: hS(16),
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: mS(15),
        fontWeight: '600',
        color: '#334155',
    },
    ratingBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: hS(8),
        paddingVertical: vS(2),
        borderRadius: mS(6),
        marginLeft: hS(8),
    },
    ratingBadgeText: {
        fontSize: mS(8),
        fontWeight: '800',
        color: '#D97706',
    },
    appInfoSection: {
        marginTop: vS(40),
        alignItems: 'center',
        paddingBottom: vS(20),
    },
    versionText: {
        fontSize: mS(12),
        color: '#94A3B8',
        fontWeight: '500',
    },
    brandText: {
        fontSize: mS(11),
        color: '#CBD5E1',
        marginTop: vS(4),
        fontWeight: '400',
    },

    // --- FULL SCREEN VIEWER STYLES ---
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    fullScreenHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: hS(10),
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.4)', // Subtle overlay for header text
        paddingBottom: vS(15),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIconButton: {
        padding: hS(10),
        borderRadius: mS(25),
    },
    fullScreenTitle: {
        color: '#FFFFFF',
        fontSize: mS(19),
        fontWeight: '600',
        marginLeft: hS(8),
    },
    fullScreenImageWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    fullScreenPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    noPhotoText: {
        color: '#94A3B8',
        fontSize: mS(16),
        marginTop: vS(20),
        fontWeight: '500',
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: vS(80),
        backgroundColor: 'transparent',
    },
    avatarMainButton: {
        borderRadius: mS(45),
        overflow: 'hidden',
    },
});

export default ProfileScreen;