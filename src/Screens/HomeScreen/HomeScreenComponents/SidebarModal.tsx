import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { hS, vS, mS } from '../../../lib/responsive';
import { ActiveTripBadge } from '../../TripScreen/TripComponents/LiveRideBadge/ActiveTripBadge';
import { ScheduledTripBadge } from '../../TripScreen/TripComponents/ScheduledRideBadge/ScheduledTripBadge';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import Config from 'react-native-config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HelpContactScreen_Nav } from '../../../Navigations/navigations';


const { width } = Dimensions.get('window');

interface SidebarModalProps {
    visible: boolean;
    onClose: () => void;
    appColors: any;
    isDark: boolean;
}

const SidebarModal: React.FC<SidebarModalProps> = ({ visible, onClose, appColors, isDark }) => {
    const localUser = useSelector((state: RootState) => state?.userSlice?.user);
    const BASE_URL = `${Config.DEV_BACKEND_URL}/api`;
    const imageSource = localUser?.profile_url;
    const proxiedImageSource = imageSource ? (imageSource.startsWith('http') ? `${BASE_URL}/media/proxy?url=${encodeURIComponent(imageSource)}` : imageSource) : null;
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1} />

                <View style={[
                    styles.sidebarContainer,
                    {
                        backgroundColor: appColors.background,
                        paddingTop: Math.max(insets.top, vS(15)),
                        paddingBottom: Math.max(insets.bottom, vS(15))
                    }
                ]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <AntDesign name="close" size={mS(24)} color={appColors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileSection}>
                        <Image
                            source={{ uri: proxiedImageSource || 'https://via.placeholder.com/150' }}
                            style={styles.profileImage}
                        />
                        <Text style={[styles.profileName, { color: appColors.text }]}>
                            {localUser?.full_name || localUser?.name || 'User'}
                        </Text>
                        <Text style={[styles.profilePhone, { color: appColors.secondaryText }]}>
                            {localUser?.phone_number || ''}
                        </Text>
                        <Text style={[styles.profileEmail, { color: appColors.secondaryText }]}>
                            {localUser?.email || ''}
                        </Text>

                        <View style={styles.ratingContainer}>
                            <AntDesign name="star" size={mS(14)} color="#F59E0B" />
                            <Text style={[styles.ratingText, { color: appColors.text }]}>
                                {localUser?.rating || '4.0'}
                                <Text style={{ color: appColors.secondaryText }}> ({localUser?.total_rides || '0'} rides)</Text>
                            </Text>
                        </View>
                    </View>

                    <View style={styles.badgesSection}>
                        <ActiveTripBadge />
                        <ScheduledTripBadge />
                    </View>

                    <View style={[styles.divider, { backgroundColor: appColors.border }]} />

                    <View style={styles.menuSection}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { 
                            onClose();
                            navigation.navigate(HelpContactScreen_Nav); 
                        }}>
                            <MaterialCommunityIcons name="help-circle-outline" size={mS(24)} color={appColors.text} />
                            <Text style={[styles.menuText, { color: appColors.text }]}>Help Center</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        flex: 1,
    },
    sidebarContainer: {
        width: width * 0.75,
        height: '100%',
        paddingHorizontal: hS(20),
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        alignItems: 'flex-end',
        marginBottom: vS(10),
    },
    closeBtn: {
        padding: mS(5),
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: vS(20),
    },
    profileImage: {
        width: hS(80),
        height: hS(80),
        borderRadius: hS(40),
        marginBottom: vS(10),
    },
    profileName: {
        fontSize: mS(18),
        fontWeight: 'bold',
        marginBottom: vS(5),
    },
    profilePhone: {
        fontSize: mS(14),
        marginBottom: vS(2),
    },
    profileEmail: {
        fontSize: mS(14),
        marginBottom: vS(10),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(5),
    },
    ratingText: {
        fontSize: mS(14),
        fontWeight: '600',
    },
    badgesSection: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: hS(10),
        justifyContent: 'center',
        marginBottom: vS(20),
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: vS(20),
    },
    menuSection: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(15),
        paddingVertical: vS(12),
    },
    menuText: {
        fontSize: mS(16),
        fontWeight: '500',
    },
});

export default SidebarModal;
