import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../../redux/store';
import { Styles } from '../../../lib/styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import colors from '../../../constant/colors';
import { BookedTripScreen_Nav, userMapTest_nav } from '../../../Navigations/navigations';
import { clearActiveTrip } from '../../../redux/tripSlice';

const { width } = Dimensions.get('window');

const GlobalRideCard = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const activeTrip = useSelector((state: RootState) => state.tripSlice.activeTrip);


    // Animation value for sliding up
    const slideAnim = useRef(new Animated.Value(150)).current;

    useEffect(() => {
        if (activeTrip) {
            // Slide UP when trip exists
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            // Slide DOWN when trip is cleared
            Animated.timing(slideAnim, {
                toValue: 150,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [activeTrip]);

    const handleClose = (e: any) => {
        // Prevent the parent TouchableOpacity (navigation) from firing
        e.stopPropagation();
        dispatch(clearActiveTrip());
    };

    if (!activeTrip) return null;

    const getStatusMessage = () => {
        switch (activeTrip.trip_status) {
            case 'REQUESTED': return 'Finding your captain...';
            // case 'ACCEPTED': return 'Captain is on the way';
            // case 'ARRIVING': return 'Captain has arrived';
            case 'LIVE': return 'Trip in progress';
            default: return 'View trip details';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] }
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate(BookedTripScreen_Nav,
                    activeTrip
                )}
                style={styles.card}
            >
                <View style={[
                    Styles.flexRow,
                    Styles.justifyContentCenter,
                    Styles.alignItemsCenter
                ]}>
                    {/* Status Icon */}
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                            name={activeTrip.trip_status === 'REQUESTED' ? 'magnify' : 'car-connected'}
                            size={24}
                            color={colors.primary}
                        />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.statusText}>{getStatusMessage()}</Text>
                        {/* {activeTrip.driver_name && (
                            <Text style={styles.subText}>{activeTrip.driver_name} • {activeTrip.plate_number}</Text>
                        )} */}
                    </View>
                    <TouchableOpacity
                        // onPress={handleClose}
                        style={styles.closeButton}
                    >
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

            </TouchableOpacity>
        </Animated.View>
    );
};

export default GlobalRideCard;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50, // Floating near the top
        width: width,
        paddingHorizontal: 15,
        zIndex: 9999,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        paddingHorizontal: 15,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    closeButton: {
        padding: 5,
        marginLeft: 10,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222',
    },
});