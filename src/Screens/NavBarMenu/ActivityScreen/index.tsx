
import { ActivityIndicator, Animated, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from "../../../Components";
import { Styles } from "../../../lib/styles";
import fonts from "../../../constant/fonts";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown } from 'react-native-element-dropdown';
import DatePicker from "../../../Components/DatePicker";
import { BookedTripScreen_Nav, RideDetails_Nav, RideDetailsEdit_Nav } from "../../../Navigations/navigations";
import colors from "../../../constant/colors";
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

const Activity: React.FC<ScreenProps> = ({ navigation }) => {
    // const { data: trips, isLoading, isFetching, refetch } = useGetAllTripsQuery();
    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const dispatch = useDispatch()
    const { colors: appColors, isDark } = useAppTheme();
    const { data: trips, isLoading, isFetching, refetch } = useGetTripQuery(localuser.id, {
        skip: !localuser?.id, // Don't run if we don't have a user ID yet
    });
    // console.log(trips, "trips");

    const [rideHistory, setRideHistory] = useState<Trip[]>(trips?.data ? trips.data : []);
    const [searchBy, setSearchBy] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState<Trip[]>([]);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('completed');
    // console.log(rideHistory.map(t => t.trip_status), "rideHistory");

    const searchOptions = [
        { label: 'Date', value: 'date' },
        { label: 'Location', value: 'location' },
    ];

    const [locations, setLocations] = useState<{ label: string; value: string }[]>([]);

    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const onRefresh = useCallback(async () => {
        // No need to set a local "refreshing" state if you use isFetching from RTK Query
        await refetch();
    }, [refetch]);

    useFocusEffect(
        useCallback(() => {
            // This runs every time the screen is focused
            refetch();
        }, [refetch])
    );

    useEffect(() => {
        // This will now run every time 'trips' changes (from undefined to data)
        if (trips?.success && trips?.data) {
            setRideHistory(trips.data);
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
        let baseData: Trip[] = [];
        if (activeTab === 'upcoming') {
            // First, let's see what statuses we actually have
            const scheduledTrips = rideHistory.filter(item =>
                item?.booking_type?.toUpperCase() === 'SCHEDULED'
            );
            const allowedStatuses = ['REQUESTED', 'ACCEPTED', 'ARRIVING', 'ARRIVED'];
            baseData = scheduledTrips.filter(item =>
                allowedStatuses.includes(item.trip_status.toUpperCase())
            );
        } else if (activeTab === 'completed') {
            baseData = rideHistory.filter(item => item.trip_status.toUpperCase() === 'COMPLETED');
        } else if (activeTab === 'cancelled') {
            baseData = rideHistory.filter(item => item.trip_status.toUpperCase() === 'CANCELLED' || item.trip_status.toUpperCase() === 'MID_CANCELLED');
        }

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

        setFilteredData(baseData);
    }, [activeTab, searchQuery, selectedLocation, startDate, endDate, rideHistory]);

    const hasActiveFilters = Boolean(searchQuery.trim() !== '' || selectedLocation !== null || startDate !== null || endDate !== null);

    const handleSearch = (text: string) => {
        setSearchQuery(text);

    };

    const handleLocationFilter = (loc: string) => {
        setSelectedLocation(loc);

    };


    const filterRidesByRange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
    };

    const clearAllFilters = () => {
        setSearchBy(null);
        setSelectedLocation(null);
        setSearchQuery('');
        setStartDate(null);
        setEndDate(null);
    };


    return (

        <View style={{ flex: 1, backgroundColor: appColors.background }}>
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
                        ) : (
                            <TextInput
                                placeholder={searchBy === 'date' ? "Tap calendar icon..." : "Search destination..."}
                                placeholderTextColor={appColors.lightTextColor}
                                style={{ flex: 1, marginLeft: 8, fontSize: 14, color: appColors.text }}
                                value={searchQuery}
                                onChangeText={handleSearch}
                                editable={searchBy !== 'date'}
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

            {/* ───────────────────── RIDE LIST ───────────────────── */}
            <ScrollView style={{ paddingHorizontal: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching} // Use RTK Query's fetching state
                        onRefresh={onRefresh}
                        colors={[colors.button]} // Your primary yellow/blue
                        tintColor={colors.button}
                    />
                }
            >
                {(isLoading || (isFetching && rideHistory.length === 0)) ? (
                    <View>
                        {[1, 2, 3, 4, 5].map(i => <ActivityCardSkeleton key={i} isDark={isDark} appColors={appColors} />)}
                    </View>
                ) : (
                    <>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <TouchableOpacity
                                    key={item.trip_id}
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
                            ))
                        ) : (
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
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
};


export default Activity;
