import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Dimensions,
    Platform,
    TouchableOpacity,
    Animated,
    Image,
} from "react-native";
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useTheme, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Config from 'react-native-config';
import { useAppTheme } from "../../hooks/useAppTheme";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Components & Constants
import { Styles } from "../../lib/styles";
import colors from "../../constant/colors";
import { hS, vS, mS, SCREEN_HEIGHT } from '../../lib/responsive';
import { GoogleNameIcon, IIcon } from '../../assets/svg';
import Button from "../../Components/Button";
import MapViewComponent from '../MapTrackingScreen/MapViewComponent';
import { LocationSearch_Nav } from "../../Navigations/navigations";

// Tab Components
import { OneWayComponent } from './HomeScreenComponents/OneWayComponent';
import { RoundedTrip } from "./HomeScreenComponents/RoundedTripComponent";
import { OutstationComponent } from './HomeScreenComponents/OutStationcomponent';
import { DailyComponent } from './HomeScreenComponents/DailyComponent';
import AsyncStorage from "@react-native-async-storage/async-storage";
import GlobalRideCard from "../TripScreen/TripComponents/GlobalRideCard";
import { ActiveTripBadge } from "../TripScreen/TripComponents/LiveRideBadge/ActiveTripBadge";
import { ScheduledTripBadge } from "../TripScreen/TripComponents/ScheduledRideBadge/ScheduledTripBadge";
import { BookedTripScreen_Nav } from "../../Navigations/navigations";
import { useLazyGetByTripIdQuery } from "../../service/tripApi";
import Skeleton from "../../Components/Skeleton";
import SidebarModal from "./HomeScreenComponents/SidebarModal";

let initialLoadChecked = false;

const HomeScreenSkeleton = ({ insets, appColors, isDark }: any) => {
    return (
        <View style={{ flex: 1, backgroundColor: appColors.background, paddingTop: insets.top, paddingHorizontal: insets.left }}>
            {/* Header Skeleton */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: hS(20), paddingTop: vS(10), paddingBottom: vS(10) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: hS(10) }}>
                    <Skeleton width={mS(45)} height={mS(45)} borderRadius={mS(22.5)} />
                    <View style={{ gap: vS(4) }}>
                        <Skeleton width={120} height={16} />
                        <Skeleton width={80} height={14} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: hS(10) }}>
                    <Skeleton width={mS(40)} height={mS(40)} borderRadius={mS(20)} />
                    <Skeleton width={mS(40)} height={mS(40)} borderRadius={mS(10)} />
                </View>
            </View>

            {/* Map Skeleton */}
            <View style={{ height: SCREEN_HEIGHT * 0.45, width: '100%', paddingHorizontal: hS(10) }}>
                <Skeleton width="100%" height="100%" borderRadius={24} />
            </View>

            {/* Tabs Skeleton */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: vS(20) }}>
                {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={{ alignItems: 'center', gap: vS(8) }}>
                        <Skeleton width={hS(65)} height={hS(65)} borderRadius={hS(16)} />
                        <Skeleton width={50} height={12} />
                    </View>
                ))}
            </View>

            {/* Dynamic Content Area Skeleton */}
            <View style={{ paddingHorizontal: hS(20), gap: vS(16) }}>
                <Skeleton width="100%" height={hS(50)} borderRadius={25} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: hS(10) }}>
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={{ flex: 1, gap: vS(8) }}>
                            <Skeleton width="100%" height={hS(100)} borderRadius={16} />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};


const bookingSteps = [
    {
        icon: 'car-select',
        title: 'Choose Service',
        desc: 'Select from One-Way, Round-Trip, Outstation, or Schedule rides.',
        color: '#3B82F6', // Blue
        bgColor: '#EFF6FF'
    },
    {
        icon: 'map-marker-path',
        title: 'Enter Locations',
        desc: 'Provide your precise pickup and drop-off points.',
        color: '#10B981', // Green
        bgColor: '#ECFDF5'
    },
    {
        icon: 'account-tie',
        title: 'Select Driver',
        desc: 'Review available drivers, check ratings, and compare fares.',
        color: '#F59E0B', // Amber
        bgColor: '#FFFBEB'
    },
    {
        icon: 'check-decagram',
        title: 'Confirm & Go',
        desc: 'Confirm your booking and track your driver to your doorstep.',
        color: '#8B5CF6', // Purple
        bgColor: '#F5F3FF'
    }
];

const HomeScreen: React.FC<any> = ({ navigation }) => {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { fonts } = useTheme();
    const { colors: appColors, isDark } = useAppTheme();

    const [isHomepage, setIsHomepage] = useState(true);
    const [screenName, setscreenName] = useState('OneWay');
    const [active, setActive] = useState<number>(0);
    const [isScreenLoading, setIsScreenLoading] = useState(true);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const [triggerGetTrip] = useLazyGetByTripIdQuery();

    const localUser = useSelector((state: RootState) => state?.userSlice?.user);
    // console.log("localUser", localUser);

    const imageSource = localUser?.profile_url;
    const BASE_URL = `${Config.DEV_BACKEND_URL}/api`;
    const proxiedImageSource = imageSource ? (imageSource.startsWith('http') ? `${BASE_URL}/media/proxy?url=${encodeURIComponent(imageSource)}` : imageSource) : null;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const buttons = [
        { name: 'OneWay', iconName: 'man' },
        { name: 'RoundedTrip', iconName: 'retweet' },
        { name: 'Outstation', iconName: 'enviromento' },
        { name: 'Schedule', iconName: 'profile' },
    ];


    // ==================== ANIMATIONS ====================
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;

    // Staggered animated values
    const buttonsAnim = React.useRef(buttons.map(() => new Animated.Value(0))).current;
    const stepsAnim = React.useRef(bookingSteps.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        // Reset values for clean entry
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        buttonsAnim.forEach(anim => anim.setValue(0));
        stepsAnim.forEach(anim => anim.setValue(0));

        // Simulate initial skeleton load for heavy map/components
        const timer = setTimeout(() => {
            setIsScreenLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Trigger animations only after the skeleton has finished loading
    useEffect(() => {
        if (!isScreenLoading) {
            // Main entrance
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]).start();

            // Staggered buttons
            const buttonAnims = buttonsAnim.map((anim, i) =>
                Animated.spring(anim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    delay: 300 + (i * 100),
                    useNativeDriver: true,
                })
            );

            // Staggered steps
            const stepAnims = stepsAnim.map((anim, i) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 600,
                    delay: 600 + (i * 150),
                    useNativeDriver: true,
                })
            );

            Animated.parallel([...buttonAnims, ...stepAnims]).start();
        }
    }, [isScreenLoading, fadeAnim, slideAnim, buttonsAnim, stepsAnim]);


    // Inside your Home.tsx or App.tsx
    // useEffect(() => {
    //     const resumeSession = async () => {
    //         const savedId = await getActiveTripId();
    //         if (savedId) {
    //             try {
    //                 const result = await triggerGetTrip(savedId).unwrap();
    //                 // If the trip is still active, jump straight to TripScreen
    //                 if (result.success && (result.data.trip_status === 'LIVE' || result.data.trip_status === 'REQUESTED')) {
    //                     // navigation.replace('TripScreen', { trip_id: savedId });
    //                 } else {
    //                     await clearActiveTrip(); // Clean up if trip ended
    //                 }
    //             } catch (err) {
    //                 console.error("Session Resume Error:", err);
    //             }
    //         }
    //     };
    //     resumeSession();
    // }, []);

    const handleTabChange = (index: number, btn: any) => {
        setIsHomepage(index === 0);
        setActive(index);
        setscreenName(btn.name);
    };

    const renderContent = () => {
        switch (active) {
            case 0: return <OneWayComponent onSelectLocation={() => { }} />;
            case 1: return <RoundedTrip />;
            case 2: return <OutstationComponent />;
            case 3: return <DailyComponent />;
            default: return <OneWayComponent onSelectLocation={() => { }} />;
        }
    };

    if (isScreenLoading) {
        return <HomeScreenSkeleton insets={insets} appColors={appColors} isDark={isDark} />;
    }

    return (
        <View style={{ flex: 1 }}>

            <View style={{ flex: 1, backgroundColor: appColors.background, paddingTop: insets.top, paddingHorizontal: insets.left }}>

                {/* --- HEADER SECTION --- */}
                <View style={[style.headerContainer, { paddingHorizontal: hS(20), paddingTop: vS(10), paddingBottom: vS(10), zIndex: 9999 }]}>
                    <View style={style.headerLeft}>
                        <View style={[style.profileImageContainer, { backgroundColor: isDark ? '#333' : '#E2E8F0' }]}>
                            <Image
                                source={{ uri: proxiedImageSource || 'https://via.placeholder.com/150' }}
                                style={style.profileImage}
                            />
                            <View style={style.onlineDot} />
                        </View>
                        <View style={style.headerTextContainer}>
                            <Text style={[style.greetingText, { color: appColors.text }]}>
                                {getGreeting()}, <Text style={[style.userNameText, { color: appColors.secondaryText }]}>{localUser?.full_name?.split(' ')[0] || localUser?.name?.split(' ')[0] || 'User'}</Text>
                            </Text>
                            <View style={style.ratingContainer}>
                                <AntDesign name="star" size={mS(12)} color="#F59E0B" />
                                <Text style={[style.ratingText, { color: appColors.text }]}>{localUser?.rating || '4.0'} <Text style={[style.ridesText, { color: appColors.secondaryText }]}>({localUser?.total_rides || '0'})</Text></Text>
                                {/* <View style={[style.eliteBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#E0E7FF' }]}>
                                    <MaterialCommunityIcons name="diamond-stone" size={mS(10)} color={isDark ? '#93C5FD' : '#3730A3'} />
                                    <Text style={[style.eliteText, { color: isDark ? '#93C5FD' : '#3730A3' }]}>ELITE</Text>
                                </View> */}
                            </View>
                        </View>
                    </View>

                    <View style={style.headerRight}>
                        <View style={style.badgesContainer}>
                            <ActiveTripBadge />
                            <ScheduledTripBadge />
                        </View>
                        <TouchableOpacity 
                            style={[style.settingsButton, { backgroundColor: isDark ? '#333' : '#F1F5F9' }]}
                            onPress={() => setIsSidebarVisible(true)}
                        >
                            <MaterialCommunityIcons name="menu" size={mS(20)} color={appColors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    {/* --- SECTION 1: MAP SECTION --- */}
                    <Animated.View style={{ height: SCREEN_HEIGHT * 0.45, width: '100%', opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <MapViewComponent />

                        {/* Floating Branding Icon */}
                        <GoogleNameIcon style={style.floatingBrandIcon} />

                        {/* Green Info Banner */}
                        <View style={[style.infoBanner, isDark && { backgroundColor: 'rgba(34, 146, 104, 0.15)', borderColor: 'transparent' }]}>
                            <IIcon width={hS(18)} height={hS(18)} />
                            <Text style={[fonts.regular, style.infoText]}>
                                {isHomepage
                                    ? "In one way, pickup & drop are at ‘different’ location in city"
                                    : "In round trip, Pickup & drop are at same location in city"}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* --- SECTION 2: INTERACTIVE SHEET --- */}
                    <View style={[style.contentSheet, { backgroundColor: appColors.card }]}>

                        {/* Mode Selection Buttons */}
                        <View style={style.buttonContainer}>
                            {buttons.map((btn, index) => (
                                <Animated.View
                                    key={index}
                                    style={[
                                        style.buttonWrapper,
                                        {
                                            opacity: buttonsAnim[index],
                                            transform: [
                                                { translateY: buttonsAnim[index].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                                                { scale: buttonsAnim[index] }
                                            ]
                                        }
                                    ]}
                                >
                                    <Button
                                        onPress={() => handleTabChange(index, btn)}
                                        style={[
                                            style.btnstyle,
                                            {
                                                backgroundColor: active === index ? colors.button : appColors.iconBox,
                                                borderColor: active === index ? colors.button : appColors.border,
                                                borderWidth: isDark && active !== index ? 1 : 0,
                                                elevation: active === index ? 4 : 0,
                                                shadowColor: active === index ? colors.button : 'transparent',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: active === index ? 0.3 : 0,
                                                shadowRadius: 8,
                                            }
                                        ]}
                                    >
                                        <AntDesign
                                            name={btn.iconName}
                                            size={mS(22)}
                                            color={active === index ? '#FFFFFF' : (isDark ? appColors.text : colors.button)}
                                        />
                                    </Button>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            style.btnTxtstyle,
                                            {
                                                color: active === index ? appColors.text : appColors.secondaryText,
                                                fontWeight: active === index ? '700' : '500'
                                            }
                                        ]}
                                    >
                                        {btn.name}
                                    </Text>
                                </Animated.View>
                            ))}
                        </View>

                        {/* Divider Line */}
                        <View style={[style.divider, { backgroundColor: appColors.border }]} />

                        {/* Search Input Bar */}
                        <Animated.View style={[
                            style.searchBarWrapper,
                            {
                                backgroundColor: isDark ? appColors.background : appColors.card,
                                borderColor: isDark ? 'transparent' : '#F1F5F9',
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}>
                            <AntDesign name="search1" size={mS(20)} color={appColors.icon} style={style.searchIcon} />
                            <TextInput
                                style={[style.searchInput, { color: appColors.text }]}
                                placeholder="Where to?"
                                placeholderTextColor={appColors.secondaryText}
                                onFocus={() => navigation.navigate(LocationSearch_Nav, { screenName })}
                            />
                            <TouchableOpacity style={style.nowButton} onPress={() => navigation.navigate(LocationSearch_Nav, { screenName })}>
                                <AntDesign name='clockcircleo' size={mS(12)} color={'#FFFFFF'} />
                                <Text style={style.nowText}>Now</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Dynamic Tab Content Area */}
                        <View style={style.tabContentArea}>
                            {renderContent()}
                        </View>

                        {/* Static Footer Section - Enhanced How to Book */}
                        <View style={[style.howToBookSection, { borderTopColor: appColors.border }]}>
                            <Text style={[style.howToBookTitle, { color: appColors.text }]}>How to Book a Driver</Text>
                            <Text style={[style.howToBookSub, { color: appColors.secondaryText }]}>Follow these simple steps for a safe and comfortable trip.</Text>

                            <View style={style.stepsContainer}>
                                {bookingSteps.map((step, index) => (
                                    <Animated.View
                                        key={index}
                                        style={[
                                            style.stepRow,
                                            {
                                                opacity: stepsAnim[index],
                                                transform: [{ translateX: stepsAnim[index].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
                                            }
                                        ]}
                                    >
                                        <View style={[style.stepIconContainer, { backgroundColor: isDark ? `${step.color}20` : step.bgColor }]}>
                                            <MaterialCommunityIcons name={step.icon} size={mS(24)} color={step.color} />
                                        </View>
                                        <View style={style.stepTextContainer}>
                                            <Text style={[style.stepTitle, { color: appColors.text }]}>{step.title}</Text>
                                            <Text style={[style.stepDesc, { color: appColors.secondaryText }]}>{step.desc}</Text>
                                        </View>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>

                        {/* Space for bottom safe area */}
                        <View style={{ height: insets.bottom + vS(20) }} />
                    </View>
                </ScrollView>
            </View>

            <SidebarModal
                visible={isSidebarVisible}
                onClose={() => setIsSidebarVisible(false)}
                appColors={appColors}
                isDark={isDark}
            />
        </View>
    );
};

const style = StyleSheet.create({
    // Map Styles
    floatingBrandIcon: {
        position: 'absolute',
        bottom: vS(80),
        left: hS(20),
        zIndex: 2,
    },
    infoBanner: {
        flexDirection: 'row',
        width: '90%',
        alignSelf: 'center',
        borderWidth: 0.5,
        borderRadius: mS(20),
        borderColor: '#229268',
        backgroundColor: '#EBF9F4',
        position: 'absolute',
        bottom: vS(40),
        paddingVertical: vS(8),
        paddingHorizontal: hS(10),
        alignItems: 'center',
        zIndex: 2,
    },
    infoText: {
        color: '#229268',
        fontSize: mS(10),
        marginLeft: hS(5),
        flex: 1,
    },

    // Sheet Styles
    contentSheet: {
        flex: 1,
        backgroundColor: colors.card,
        borderTopLeftRadius: mS(30),
        borderTopRightRadius: mS(30),
        marginTop: vS(-30), // Pulls the sheet over the map
        paddingTop: vS(20),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: hS(10),
    },
    buttonWrapper: {
        alignItems: 'center',
        width: '22%',
    },
    btnstyle: {
        width: hS(60),
        height: hS(60),
        borderRadius: hS(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(5),
    },
    btnTxtstyle: {
        fontSize: mS(9),
        textAlign: 'center',
    },
    divider: {
        width: '90%',
        height: 1,
        backgroundColor: colors.divider,
        alignSelf: 'center',
        marginVertical: vS(12),
    },

    // Search Styles
    searchBarWrapper: {
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: mS(25),
        height: vS(50),
        marginTop: vS(5),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            ios: {
                shadowColor: '#64748B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 12
            },
            android: { elevation: 3 },
        }),
    },
    searchInput: {
        flex: 1,
        height: '100%',
        backgroundColor: 'transparent',
        paddingLeft: hS(45),
        paddingRight: hS(75),
        color: '#1E293B',
        fontSize: mS(14),
        fontWeight: '500',
    },
    searchIcon: {
        position: 'absolute',
        left: hS(16),
        zIndex: 2,
    },
    nowButton: {
        position: 'absolute',
        right: hS(8),
        flexDirection: 'row',
        paddingHorizontal: hS(14),
        borderRadius: mS(20),
        justifyContent: 'center',
        alignItems: 'center',
        height: vS(38),
        backgroundColor: colors.button,
    },
    nowText: {
        color: '#FFFFFF',
        fontSize: mS(12),
        fontWeight: '600',
        marginLeft: hS(6),
    },

    // Bottom Content
    tabContentArea: {
        minHeight: vS(170),
        // paddingHorizontal: hS(20),
        marginTop: vS(12),
    },
    howToBookSection: {
        paddingHorizontal: hS(20),
        paddingVertical: vS(24),
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    howToBookTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        color: colors.text,
    },
    howToBookSub: {
        marginTop: vS(4),
        fontSize: mS(14),
        color: colors.secondaryText,
    },
    stepsContainer: {
        marginTop: vS(20),
        marginBottom: vS(10),
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vS(20),
    },
    stepIconContainer: {
        width: hS(50),
        height: hS(50),
        borderRadius: hS(25),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(15),
    },
    stepTextContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: mS(15),
        fontWeight: '700',
        color: colors.text,
        marginBottom: vS(2),
    },
    stepDesc: {
        fontSize: mS(13),
        lineHeight: mS(18),
        color: colors.secondaryText,
    },
    badgesRowContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? vS(60) : vS(50),
        left: hS(20),
        right: hS(20),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end', // Aligns to the right
        gap: hS(12),
        pointerEvents: 'box-none',
        zIndex: 9999,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImageContainer: {
        width: mS(45),
        height: mS(45),
        borderRadius: mS(22.5),
        marginRight: hS(10),
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: mS(22.5),
        resizeMode: 'cover',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: mS(10),
        height: mS(10),
        borderRadius: mS(5),
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerTextContainer: {
        justifyContent: 'center',
    },
    greetingText: {
        fontSize: mS(14),
        fontWeight: 'bold',
        marginBottom: vS(2),
    },
    userNameText: {
        fontWeight: '400',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(4),
    },
    ratingText: {
        fontSize: mS(12),
        fontWeight: 'bold',
    },
    ridesText: {
        fontWeight: '400',
        fontSize: mS(11),
    },
    eliteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(6),
        paddingVertical: vS(2),
        borderRadius: mS(10),
        marginLeft: hS(6),
        gap: hS(2),
    },
    eliteText: {
        fontSize: mS(9),
        fontWeight: 'bold',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(10),
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: hS(8),
    },
    settingsButton: {
        width: mS(36),
        height: mS(36),
        borderRadius: mS(18),
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default HomeScreen;