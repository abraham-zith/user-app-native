
import { ActivityIndicator, Animated, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from "../../../Components";
import { Styles } from "../../../lib/styles";
import fonts from "../../../constant/fonts";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown } from 'react-native-element-dropdown';
import DatePicker from "../../../Components/DatePicker";
import { BookedTripScreen_Nav, RideDetails_Nav, RideDetailsEdit_Nav } from "../../../Navigations/navigations";
import colors, { darkColors } from "../../../constant/colors";
import formatDate from "../../../Components/FormatDate";
import { useGetAllTripsQuery, useGetTripQuery } from "../../../service/userApi";
import { Trip } from "../../../types/trip";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import Skeleton from "../../../Components/Skeleton";
import { useAppTheme } from "../../../hooks/useAppTheme";

const ActivityCardSkeleton = ({ isDark, appColors }: any) => (
    <View style={{
        backgroundColor: appColors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
            android: { elevation: 3 },
        }),
    }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Skeleton width={48} height={48} borderRadius={12} />
            <View style={{ marginLeft: 14, flex: 1, gap: 8 }}>
                <Skeleton width="80%" height={16} />
                <Skeleton width="60%" height={12} />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                    <Skeleton width={40} height={14} />
                    <Skeleton width={60} height={14} borderRadius={4} />
                </View>
            </View>
        </View>
        <Skeleton width={20} height={20} borderRadius={10} />
    </View>
);

const AnimatedListItem = ({ index, children }: { index: number, children: React.ReactNode }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Cap the delay so items further down the list don't wait forever to appear
        const staggerDelay = Math.min(index, 8) * 100;
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: staggerDelay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: staggerDelay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {children}
        </Animated.View>
    );
};

const ActivityScreenSkeleton = ({ appColors, isDark }: any) => (
    <View style={{ flex: 1, backgroundColor: appColors.background }}>
        {/* Search & Filter Skeleton */}
        <View style={{
            backgroundColor: appColors.card,
            paddingTop: 10,
            paddingBottom: 20,
            paddingHorizontal: 16,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Skeleton width="35%" height={48} borderRadius={12} />
                <Skeleton width="62%" height={48} borderRadius={12} />
            </View>
        </View>

        {/* Tab Switcher Skeleton */}
        <View style={{
            flexDirection: 'row',
            marginHorizontal: 16,
            marginVertical: 20,
        }}>
            <Skeleton width="100%" height={48} borderRadius={14} />
        </View>

        {/* Ride List Skeleton */}
        <View style={{ paddingHorizontal: 16 }}>
            {[1, 2, 3, 4, 5].map(i => <ActivityCardSkeleton key={i} isDark={isDark} appColors={appColors} />)}
        </View>
    </View>
);

const Activity: React.FC<ScreenProps> = ({ navigation }) => {
    // const { data: trips, isLoading, isFetching, refetch } = useGetAllTripsQuery();
    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const dispatch = useDispatch()
    const { colors: appColors, isDark } = useAppTheme();
    const [searchBy, setSearchBy] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScreenLoading, setIsScreenLoading] = useState(true);
    const [filteredData, setFilteredData] = useState<Trip[]>([]);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('completed');
    const [activeLimit, setActiveLimit] = useState<number | undefined>(5);
    const [selectedRideType, setSelectedRideType] = useState<string | null>(null);
    const rideTypeOptions = [
        { label: 'One Way', value: 'ONE_WAY' },
        { label: 'Round Trip', value: 'ROUND_TRIP' },
        { label: 'Outstation', value: 'OUTSTATION' },
        { label: 'Scheduled', value: 'SCHEDULED' },
    ];

    const searchOptions = [
        { label: 'Date', value: 'date' },
        { label: 'Location', value: 'location' },
        { label: 'Ride Type', value: 'rideType' },
    ];

    const [locations, setLocations] = useState<{ label: string; value: string }[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    const hasActiveFilters = Boolean(searchQuery.trim() !== '' || selectedLocation !== null || startDate !== null || endDate !== null || selectedRideType !== null);
    const limitToUse = hasActiveFilters ? undefined : activeLimit;

    const { data: trips, isLoading, isFetching, refetch } = useGetTripQuery({ id: localuser?.id, limit: limitToUse, tab: activeTab }, {
        skip: !localuser?.id, // Don't run if we don't have a user ID yet
    });

    const [rideHistory, setRideHistory] = useState<Trip[]>(trips?.data?.data ? trips.data.data : []);


    const onRefresh = useCallback(async () => {
        // No need to set a local "refreshing" state if you use isFetching from RTK Query
        await refetch();
    }, [refetch]);

    // ==================== ANIMATIONS ====================
    const screenFadeAnim = useRef(new Animated.Value(0)).current;
    const screenSlideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsScreenLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Trigger animations only after the skeleton has finished loading
    useEffect(() => {
        if (!isScreenLoading) {
            Animated.parallel([
                Animated.timing(screenFadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(screenSlideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]).start();
        }
    }, [isScreenLoading, screenFadeAnim, screenSlideAnim]);

    // useFocusEffect(
    //     useCallback(() => {
    //         // This runs every time the screen is focused
    //         refetch();
    //     }, [refetch])
    // );

    useEffect(() => {
        // This will now run every time 'trips' changes (from undefined to data)
        if (trips?.success && trips?.data?.data) {
            setRideHistory(trips.data.data);
        }
    }, [trips, isFetching]);


    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0

    useEffect(() => {
        if (rideHistory && rideHistory.length > 0) {
            const uniqueAreas = new Set<string>();
            rideHistory.forEach((trip: Trip) => {
                if (trip.drop_address) {
                    const parts = trip.drop_address.split(',').map(p => p.trim());
                    // Heuristic: In many address formats, the area is the 3rd or 4th component from the end.
                    // If address is "House, Street, Area, City, State, Country", parts.length = 6.
                    // Area (index 2) is parts[parts.length - 4].
                    // If it's shorter "Area, City", parts.length = 2. index 0 is parts[0].

                    let area = null;
                    if (parts.length >= 4) {
                        area = parts[parts.length - 4];
                    } else if (parts.length >= 2) {
                        area = parts[0];
                    } else if (parts.length === 1) {
                        area = parts[0];
                    }

                    if (area && area.length > 2 && !/^\d+$/.test(area)) { // Avoid house numbers/pincodes if possible
                        uniqueAreas.add(area);
                    }
                }
            });

            const dynamicLocations = Array.from(uniqueAreas).map(area => ({
                label: area,
                value: area
            }));
            setLocations(dynamicLocations);
        }
    }, [rideHistory]);

    useEffect(() => {
        if (isLoading || (isFetching && rideHistory.length === 0)) {
            // 1. Wait 500ms, then fade in over 300ms
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                delay: 500,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading, isFetching, rideHistory.length]);



    useEffect(() => {
        // 1. First, pick the base data based on tab
        let baseData = [...rideHistory];

        // The backend now filters by `activeTab` so we don't need to do it here.

        // 2. Apply Text Search if it exists
        if (searchQuery) {
            baseData = baseData.filter(item =>
                item.drop_address.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 3. Apply Location Filter if it exists
        if (selectedLocation) {
            baseData = baseData.filter(item =>
                item.drop_address.toLowerCase().includes(selectedLocation.toLowerCase())
            );
        }

        // 4. Apply Date Range Filter if it exists
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            baseData = baseData.filter(ride => {
                const rideDate = new Date(ride.scheduled_start_time || ride.original_scheduled_start_time);
                return rideDate >= start && rideDate <= end;
            });
        }

        // 5. Apply Ride Type Filter if it exists
        if (selectedRideType) {
            baseData = baseData.filter(item => {
                if (selectedRideType === 'OUTSTATION') {
                    return item.ride_type === 'OUTSTATION_ONE_WAY' || item.ride_type === 'OUTSTATION_ROUND_TRIP';
                }
                return item.ride_type === selectedRideType;
            });
        }

        setFilteredData(baseData);
    }, [activeTab, searchQuery, selectedLocation, startDate, endDate, selectedRideType, rideHistory]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);

    };

    const handleLocationFilter = (loc: string) => {
        setSelectedLocation(loc);

    };


    const filterRidesByRange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        setSelectedRideType(null);
    };


    const clearAllFilters = () => {
        setSearchBy(null);
        setSelectedLocation(null);
        setSearchQuery('');
        setStartDate(null);
        setEndDate(null);
        setSelectedRideType(null);
    };

    const formatDateToDMY = (dateStr: string | null) => {
        if (!dateStr) return '';
        return dateStr.split('-').reverse().join('-');
    };

    if (isScreenLoading) {
        return <ActivityScreenSkeleton appColors={appColors} isDark={isDark} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: appColors.background }}>
            <Animated.View style={{ flex: 1, opacity: screenFadeAnim, transform: [{ translateY: screenSlideAnim }] }}>
                {/* ───────────────────── SEARCH & FILTER SECTION ───────────────────── */}
                <View style={{
                backgroundColor: appColors.card,
                paddingTop: 10,
                paddingBottom: 20,
                paddingHorizontal: 16,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                ...Platform.select({
                    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
                    android: { elevation: 4 },
                }),
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {/* Filter Type Dropdown */}
                    <Dropdown
                        style={{
                            width: '35%',
                            backgroundColor: appColors.background,
                            borderRadius: 12,
                            paddingHorizontal: 10,
                            height: 48,
                        }}
                        containerStyle={{ backgroundColor: appColors.card, borderColor: isDark ? 'transparent' : '#E2E8F0', borderRadius: 8 }}
                        itemTextStyle={{ color: appColors.text, fontSize: 13 }}
                        activeColor={isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}
                        placeholderStyle={{ color: appColors.lightTextColor, fontSize: 13 }}
                        selectedTextStyle={{ color: appColors.text, fontSize: 13, fontWeight: '600' }}
                        data={searchOptions}
                        labelField="label"
                        valueField="value"
                        value={searchBy}
                        onChange={(item) => {
                            setSearchBy(item.value);
                            setSearchQuery('');
                            setSelectedLocation(null);
                            setSelectedRideType(null);
                            // Removing manual setFilteredData to let useEffect handle it
                        }}
                    />

                    {/* Dynamic Search Box */}
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: appColors.background,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        height: 48,
                    }}>
                        <MaterialCommunityIcons
                            name={"magnify"}
                            size={20}
                            color={appColors.lightTextColor}
                        />

                        {searchBy === 'location' ? (
                            <Dropdown
                                style={{ flex: 1, height: 48, marginLeft: 8 }}
                                containerStyle={{ backgroundColor: appColors.card, borderColor: isDark ? 'transparent' : '#E2E8F0', borderRadius: 8 }}
                                itemTextStyle={{ color: appColors.text, fontSize: 14 }}
                                activeColor={isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}
                                placeholder="Select Location"
                                placeholderStyle={{ color: appColors.lightTextColor, fontSize: 14 }}
                                selectedTextStyle={{ color: appColors.text, fontSize: 14, fontWeight: '600' }}
                                data={locations}
                                labelField="label"
                                valueField="value"
                                value={selectedLocation}
                                onChange={(item) => handleLocationFilter(item.value)}
                            />
                        ) : searchBy === 'rideType' ? (
                            <Dropdown
                                style={{ flex: 1, height: 48, marginLeft: 8 }}
                                containerStyle={{ backgroundColor: appColors.card, borderColor: isDark ? 'transparent' : '#E2E8F0', borderRadius: 8 }}
                                itemTextStyle={{ color: appColors.text, fontSize: 14 }}
                                activeColor={isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}
                                placeholder="Select Ride Type"
                                placeholderStyle={{ color: appColors.lightTextColor, fontSize: 14 }}
                                selectedTextStyle={{ color: appColors.text, fontSize: 14, fontWeight: '600' }}
                                data={rideTypeOptions}
                                labelField="label"
                                valueField="value"
                                value={selectedRideType}
                                onChange={(item) => setSelectedRideType(item.value)}
                            />
                        ) : searchBy === 'date' ? (
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={{ flex: 1, marginLeft: 8, height: 48, justifyContent: 'center' }}
                            >
                                <TextInput
                                    placeholder="Tap calendar icon..."
                                    placeholderTextColor={appColors.lightTextColor}
                                    style={{ fontSize: 14, color: appColors.text, paddingVertical: 0 }}
                                    value={startDate && endDate ? `${formatDateToDMY(startDate)} to ${formatDateToDMY(endDate)}` : ''}
                                    editable={false}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>
                        ) : (
                            <TextInput
                                placeholder="Search destination..."
                                placeholderTextColor={appColors.lightTextColor}
                                style={{ flex: 1, marginLeft: 8, fontSize: 14, color: appColors.text }}
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                        )}

                        {searchBy === 'date' && (
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <MaterialCommunityIcons name="calendar-search" size={20} color="#2563EB" />
                            </TouchableOpacity>
                        )}

                    </View>

                </View>

                {/* CLEAR ALL FILTERS BUTTON */}
                {hasActiveFilters && (
                    <TouchableOpacity
                        onPress={clearAllFilters}
                        style={{
                            alignSelf: 'flex-end',
                            marginTop: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'
                        }}
                    >
                        <Text style={{
                            color: isDark ? '#60A5FA' : '#2563EB',
                            fontSize: 13,
                            fontWeight: '700',
                            textDecorationLine: 'underline'
                        }}>
                            Clear All Filters
                        </Text>
                    </TouchableOpacity>
                )}

                {/* DATE PICKER MODAL */}
                {showDatePicker ? (
                    <DatePicker
                        mode="range"
                        visible={showDatePicker}
                        onRangeSelect={(start, end) => {
                            filterRidesByRange(start, end);
                        }}
                        onClose={() => setShowDatePicker(false)} />
                ) : null}
            </View>

            {/* ───────────────────── MODERN TAB SWITCHER ───────────────────── */}
            <View style={{
                flexDirection: 'row',
                backgroundColor: isDark ? appColors.iconBox : '#E2E8F0',
                marginHorizontal: 16,
                marginVertical: 20,
                borderRadius: 14,
                padding: 4,
            }}>
                <TouchableOpacity
                    onPress={() => setActiveTab('completed')}
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        borderRadius: 10,
                        backgroundColor: activeTab === 'completed' ? appColors.card : 'transparent',

                        ...(Platform.OS === 'ios'
                            ? (activeTab === 'completed' ? { shadowColor: isDark ? '#000' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 } : {})
                            : (activeTab === 'completed' ? { elevation: 3 } : {})
                        )
                    }}
                >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === 'completed' ? (isDark ? appColors.text : colors.button) : appColors.lightTextColor }}>
                        Completed
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('cancelled')}
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        borderRadius: 10,
                        backgroundColor: activeTab === 'cancelled' ? appColors.card : 'transparent',

                        ...(Platform.OS === 'ios'
                            ? (activeTab === 'cancelled' ? { shadowColor: isDark ? '#000' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 } : {})
                            : (activeTab === 'cancelled' ? { elevation: 3 } : {})
                        )
                    }}
                >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === 'cancelled' ? (isDark ? appColors.text : colors.button) : appColors.lightTextColor }}>
                        Cancelled
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('upcoming')}
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        borderRadius: 10,
                        backgroundColor: activeTab === 'upcoming' ? appColors.card : 'transparent',
                        ...(Platform.OS === 'ios'
                            ? (activeTab === 'upcoming' ? { shadowColor: isDark ? '#000' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 } : {})
                            : (activeTab === 'upcoming' ? { elevation: 3 } : {})
                        )
                    }}
                >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === 'upcoming' ? (isDark ? appColors.text : colors.button) : appColors.lightTextColor }}>
                        Upcoming
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ───────────────────── SEE ALL / SHOW LESS BUTTON ───────────────────── */}
            {!isLoading && !isFetching && !hasActiveFilters && trips?.data?.total && trips.data.total > 5 ? (
                <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 10 }}>
                    <TouchableOpacity
                        onPress={() => {
                            if (activeLimit === 5) {
                                setActiveLimit(undefined);
                            } else {
                                setActiveLimit(5);
                            }
                        }}
                    >
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: isDark ? appColors.primary : colors.button,
                        }}>
                            {activeLimit === 5 ? "See All" : "Show Less"}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* ───────────────────── RIDE LIST ───────────────────── */}
            {(isLoading || (isFetching && rideHistory.length === 0)) ? (
                <ScrollView style={{ paddingHorizontal: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isFetching}
                            onRefresh={onRefresh}
                            colors={[colors.button]}
                            tintColor={colors.button}
                        />
                    }
                >
                    <View>
                        {[1, 2, 3, 4, 5].map(i => <ActivityCardSkeleton key={i} isDark={isDark} appColors={appColors} />)}
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    style={{ paddingHorizontal: 16 }}
                    data={filteredData}
                    keyExtractor={(item) => item.trip_id.toString()}
                    removeClippedSubviews={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    refreshControl={
                        <RefreshControl
                            refreshing={isFetching}
                            onRefresh={onRefresh}
                            colors={[colors.button]}
                            tintColor={colors.button}
                        />
                    }
                    ListEmptyComponent={
                        <View style={{ marginTop: 60, alignItems: 'center', paddingHorizontal: 40 }}>
                            <MaterialCommunityIcons
                                name={searchQuery || selectedLocation ? "database-search-outline" : "car-off"}
                                size={70}
                                color={appColors.lightTextColor}
                            />
                            <Text style={{
                                color: appColors.text,
                                fontSize: 16,
                                fontWeight: '600',
                                marginTop: 15,
                                textAlign: 'center'
                            }}>
                                {searchQuery || selectedLocation ? "No matches found" : "No rides yet"}
                            </Text>
                            <Text style={{ color: appColors.lightTextColor, textAlign: 'center', marginTop: 8 }}>
                                {searchQuery || selectedLocation
                                    ? "Try adjusting your filters or search terms."
                                    : activeTab === 'upcoming'
                                        ? "You don't have any scheduled trips."
                                        : "Your completed trips will appear here."}
                            </Text>
                            {(searchQuery || selectedLocation) && (
                                <TouchableOpacity
                                    onPress={clearAllFilters}
                                    style={{
                                        marginTop: 20,
                                        backgroundColor: appColors.iconBox,
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        borderRadius: 10
                                    }}
                                >
                                    <Text style={{ color: isDark ? appColors.text : colors.button, fontWeight: '700' }}>Reset Filters</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                    ListFooterComponent={
                        isFetching && activeLimit === undefined && rideHistory.length > 5 ? (
                            <View style={{ alignItems: 'center', marginVertical: 20 }}>
                                <ActivityIndicator size="small" color={colors.button} />
                            </View>
                        ) : null
                    }
                    renderItem={({ item, index }) => (
                        <AnimatedListItem index={index}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                const status = item.trip_status.toUpperCase();
                                if (activeTab === 'upcoming') {
                                    if (status === 'REQUESTED' || status === 'ACCEPTED') {
                                        navigation.navigate(RideDetailsEdit_Nav, { rideData: item });
                                    } else if (status === 'ARRIVING' || status === 'ARRIVED') {
                                        navigation.navigate(BookedTripScreen_Nav, item);
                                    } else {
                                        navigation.navigate(RideDetails_Nav, { rideData: item });
                                    }
                                } else {
                                    if (status === 'REQUESTED') {
                                        navigation.navigate(RideDetailsEdit_Nav, { rideData: item });
                                    } else {
                                        navigation.navigate(RideDetails_Nav, { rideData: item });
                                    }
                                }
                            }}
                            style={{
                                backgroundColor: appColors.card,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                ...Platform.select({
                                    ios: { shadowColor: isDark ? '#000' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
                                    android: { elevation: 3 },
                                }),
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                {/* Icon changes based on booking type */}
                                <View style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    backgroundColor: isDark
                                        ? (item.booking_type === 'SCHEDULED' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(59, 130, 246, 0.1)')
                                        : (item.booking_type === 'SCHEDULED' ? '#FFF7ED' : '#EFF6FF'),
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <MaterialCommunityIcons
                                        name={item.booking_type === 'SCHEDULED' ? "calendar-clock" : "car-connected"}
                                        size={26}
                                        color={item.booking_type === 'SCHEDULED' && item.trip_status === 'REQUESTED' ? "#EA580C" : (isDark ? appColors.text : colors.button)}
                                    />
                                </View>

                                <View style={{ marginLeft: 14, flex: 1 }}>
                                    <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '700', color: appColors.text }}>
                                        {item.drop_address}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: appColors.lightTextColor, marginTop: 2 }}>
                                        {item.booking_type.toUpperCase()} • {
                                            item?.scheduled_start_time || item?.original_scheduled_start_time ? (
                                                <>
                                                    {formatDate(new Date(item?.scheduled_start_time || item?.original_scheduled_start_time))}
                                                    {" • "}
                                                    {new Date(item?.scheduled_start_time || item?.original_scheduled_start_time).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </>
                                            ) : 'N/A'
                                        }
                                    </Text>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: appColors.text }}>
                                            ₹{Number(item.total_fare)}
                                        </Text>

                                        {/* DYNAMIC STATUS COLORS */}
                                        <View style={{
                                            marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2,
                                            borderRadius: 4,
                                            backgroundColor:
                                                item.trip_status.toLowerCase() === 'completed' ? (isDark ? 'rgba(22, 101, 52, 0.2)' : '#DCFCE7') :
                                                    (item.trip_status.toLowerCase() === 'requested' || item.trip_status.toLowerCase() === 'accepted') ? (isDark ? 'rgba(154, 52, 18, 0.2)' : '#FFEDD5') : (isDark ? 'rgba(153, 27, 27, 0.2)' : '#FEE2E2')
                                        }}>
                                            <Text style={{
                                                fontSize: 10, fontWeight: '700',
                                                color:
                                                    item.trip_status.toLowerCase() === 'completed' ? (isDark ? '#4ADE80' : '#166534') :
                                                        (item.trip_status.toLowerCase() === 'requested' || item.trip_status.toLowerCase() === 'accepted') ? (isDark ? '#FB923C' : '#9A3412') : (isDark ? '#F87171' : '#991B1B')
                                            }}>
                                                {item.trip_status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
                        </TouchableOpacity>
                        </AnimatedListItem>
                    )}
                />
            )}
            </Animated.View>
        </View>
    );
};


export default Activity;
