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
} from "react-native";
import { useTheme, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
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
import { clearActiveTrip, getActiveTripId } from "../../service/utils/tripstorage";
import { useLazyGetByTripIdQuery } from "../../service/userApi";
import GlobalRideCard from "../TripScreen/TripComponents/GlobalRideCard";
import { ActiveTripBadge } from "../TripScreen/TripComponents/LiveRideBadge/ActiveTripBadge";
import { ScheduledTripBadge } from "../TripScreen/TripComponents/ScheduledRideBadge/ScheduledTripBadge";

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

    const [triggerGetTrip] = useLazyGetByTripIdQuery();

    const buttons = [
        { name: 'OneWay', iconName: 'man' },
        { name: 'RoundedTrip', iconName: 'retweet' },
        { name: 'Outstation', iconName: 'enviromento' },
        { name: 'Schedule', iconName: 'profile' },
    ];

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
            case 0: return <OneWayComponent onSelectLocation={() => {}} />;
            case 1: return <RoundedTrip />;
            case 2: return <OutstationComponent />;
            case 3: return <DailyComponent />;
            default: return <OneWayComponent onSelectLocation={() => {}} />;
        }
    };

    return (
        <View style={{ flex: 1 }}>

            <View style={{ flex: 1, backgroundColor: appColors.background, paddingTop: insets.top, paddingHorizontal: insets.left }}>
                <ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    {/* --- SECTION 1: MAP SECTION --- */}
                    <View style={{ height: SCREEN_HEIGHT * 0.5, width: '100%' }}>
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
                    </View>

                    {/* --- SECTION 2: INTERACTIVE SHEET --- */}
                    <View style={[style.contentSheet, { backgroundColor: appColors.card }]}>

                        {/* Mode Selection Buttons */}
                        <View style={style.buttonContainer}>
                            {buttons.map((btn, index) => (
                                <View key={index} style={style.buttonWrapper}>
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
                                </View>
                            ))}
                        </View>

                        {/* Divider Line */}
                        <View style={[style.divider, { backgroundColor: appColors.border }]} />

                        {/* Search Input Bar */}
                        <View style={[style.searchBarWrapper, { backgroundColor: isDark ? appColors.background : appColors.card, borderColor: isDark ? 'transparent' : '#F1F5F9' }]}>
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
                        </View>

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
                                    <View key={index} style={style.stepRow}>
                                        <View style={[style.stepIconContainer, { backgroundColor: isDark ? `${step.color}20` : step.bgColor }]}>
                                            <MaterialCommunityIcons name={step.icon} size={mS(24)} color={step.color} />
                                        </View>
                                        <View style={style.stepTextContainer}>
                                            <Text style={[style.stepTitle, { color: appColors.text }]}>{step.title}</Text>
                                            <Text style={[style.stepDesc, { color: appColors.secondaryText }]}>{step.desc}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Space for bottom safe area */}
                        <View style={{ height: insets.bottom + vS(20) }} />
                    </View>
                </ScrollView>
            </View>

            {/* FLOAT BADGES CONTAINER */}
            <View style={style.badgesRowContainer}>
                <ActiveTripBadge />
                <ScheduledTripBadge />
            </View>
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
});

export default HomeScreen;