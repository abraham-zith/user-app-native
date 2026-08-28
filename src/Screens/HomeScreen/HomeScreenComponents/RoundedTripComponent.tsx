// import React from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { RoundWayImage } from '../../../assets/svg';
// import fonts from "../../../constant/fonts";
// import { useAppTheme } from "../../../hooks/useAppTheme";
// // Import your responsive utilities
// import { hS, vS, mS } from '../../../lib/responsive';

// export function RoundedTrip() {
//     const { colors: appColors, isDark } = useAppTheme();
//     return (
//         <View style={style.container}>
//             <Text style={[fonts.bold, style.title, { color: appColors.text }]}>
//                 Recent Round Trip
//             </Text>

//             <View style={style.imageWrapper}>
//                 <RoundWayImage
//                     width={'100%'}
//                     height={vS(142)}
//                 />
//             </View>
//         </View>
//     );
// }

// const style = StyleSheet.create({
//     container: {
//         width: '100%',
//         // Use minHeight to allow content to expand if needed
//         minHeight: vS(165),
//         rowGap: vS(9),
//         // Centers the component within the parent's padding
//         alignSelf: 'center',
//     },
//     title: {
//         fontSize: mS(13),
//         fontWeight: '700',
//         lineHeight: vS(16),
//         paddingHorizontal: hS(20),
//         color: '#1E293B',
//     },
//     imageWrapper: {
//         width: '100%',
//         alignItems: 'center',
//         justifyContent: 'center',
//     }
//     emptyContainer: {
//         alignItems: "center",
//         paddingVertical: vS(30),
//         gap: vS(12),
//     },
//     emptyText: {
//         fontSize: mS(14),
//         fontWeight: "600",
//     },
// });

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, FlatList, Image } from "react-native";
import { RoundWayImage } from '../../../assets/svg';
import fonts from "../../../constant/fonts";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { hS, vS, mS } from '../../../lib/responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useGetTripQuery } from "../../../service/userApi";
import { Trip } from "../../../types/trip";
import formatDate from "../../../Components/FormatDate";

export const getRoundTripStatusColor = (status: string, appColors: any) => {
    switch (status.toLowerCase()) {
        case 'completed':
            return '#10B981';
        case 'live':
            return '#3B82F6';
        case 'requested':
        case 'accepted':
        case 'arriving':
        case 'arrived':
            return '#F59E0B';
        case 'cancelled':
        case 'mid_cancelled':
            return '#EF4444';
        default:
            return appColors.primary;
    }
};

export const getRoundTripStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'checkmark-circle';
        case 'live':
            return 'play-circle';
        case 'requested':
        case 'accepted':
        case 'arriving':
        case 'arrived':
            return 'calendar';
        case 'cancelled':
        case 'mid_cancelled':
            return 'close-circle';
        default:
            return 'help-circle';
    }
};

import { useNavigation } from '@react-navigation/native';
import { RideDetails_Nav, LocationSearch_Nav } from "../../../Navigations/navigations";


export function RoundedTrip() {
    const navigation = useNavigation<any>();
    const { colors: appColors, isDark } = useAppTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const { data: tripsData, isLoading, isFetching } = useGetTripQuery(
        { id: localuser?.id, limit: 20 },
        { skip: !localuser?.id }
    );

    const roundTrips = (tripsData?.data?.data || []).filter((trip: Trip) =>
        trip.ride_type === 'ROUND_TRIP' &&
        ['COMPLETED', 'CANCELLED', 'MID_CANCELLED'].includes(trip.trip_status)
    );

    // Calculate stats from completed round trips
    const completedRoundTrips = roundTrips.filter(t => t.trip_status === 'COMPLETED');
    const totalDistance = completedRoundTrips.reduce((acc, trip) => acc + (Number(trip.distance_km) || 0), 0);
    const totalTrips = completedRoundTrips.length;
    const avgRating = completedRoundTrips.length > 0
        ? (completedRoundTrips.reduce((acc, trip) => acc + (trip.rating || 0), 0) / (completedRoundTrips.filter(t => t.rating).length || 1)).toFixed(1)
        : "0.0";

    const featuredTrip = roundTrips[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const getStatusColor = (status: string) => getRoundTripStatusColor(status, appColors);
    const getStatusIcon = (status: string) => getRoundTripStatusIcon(status);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }
            ]}
        >
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <View>
                    <Text style={[fonts.bold, styles.title, { color: appColors.text }]}>
                        Round Trip Overview
                    </Text>
                    <Text style={[styles.subtitle, { color: appColors.secondaryText }]}>
                        Your circular journey at a glance
                    </Text>
                </View>
                {/* <TouchableOpacity style={styles.simpleViewAllBtn} onPress={() => navigation.navigate('Activity')}>
                    <Text style={styles.simpleViewAllText}>View All <Ionicons name="chevron-forward" size={mS(14)} /></Text>
                </TouchableOpacity> */}
            </View>

            {/* Overview Stats */}
            <View style={styles.overviewRow}>
                <OverviewCard
                    icon="navigate"
                    label="Total Distance"
                    value={`${totalDistance.toFixed(0)} km`}
                    appColors={appColors}
                    iconColor={'#8B5CF6'}
                    iconBgColor="#8B5CF615"
                />
                <OverviewCard
                    icon="car"
                    label="Round Trips"
                    value={totalTrips.toString()}
                    appColors={appColors}
                    iconColor={'#10B981'}
                    iconBgColor="#4CAF5015"
                />
                <OverviewCard
                    icon="star"
                    label="Avg Rating"
                    value={avgRating}
                    appColors={appColors}
                    iconColor={'#F59E0B'}
                    iconBgColor="#F59E0B15"
                />
            </View>

            {/* Featured Trip Section */}
            {featuredTrip && (
                <View style={[styles.featuredContainer, { backgroundColor: '#0F172A', overflow: 'hidden' }]}>
                    <Image
                        source={require('../../../assets/png/RoundedTripImage.png')}
                        style={styles.featuredImage}
                        height={vS(120)}
                    />
                    <View style={styles.featuredBadge}>
                        <Ionicons name="time" size={12} color="#fff" />
                        <Text style={styles.badgeText}>MOST RECENT</Text>
                    </View>
                    <View style={[styles.featuredOverlay, {
                        backgroundColor: appColors.button,
                    }]}>
                        <View style={[styles.featuredStatusPill, { backgroundColor: getRoundTripStatusColor(featuredTrip.trip_status, appColors) }]}>
                            <Ionicons name="close-circle" size={10} color="#FFF" />
                            <Text style={styles.featuredStatusText}>{featuredTrip.trip_status?.toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.featuredTitle, { color: '#FFF' }]} numberOfLines={1}>
                            {featuredTrip.pickup_address}
                        </Text>
                        <View style={styles.featuredMetaRow}>
                            <Text style={[styles.featuredMeta, { color: 'rgba(255,255,255,0.7)' }]}>
                                {featuredTrip.distance_km} km • ₹{featuredTrip.total_fare}
                            </Text>
                            <TouchableOpacity style={styles.featuredBtn} onPress={() => navigation.navigate(RideDetails_Nav, { rideData: featuredTrip })}>
                                <Text style={styles.featuredBtnText}>View Details <Ionicons name="arrow-forward" size={12} color="#0F172A" /></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Quick Actions */}
            {/* <View style={styles.actionsRow}>
                <ActionButton
                    icon="map"
                    label="View Map"
                    appColors={appColors}
                    isDark={isDark}
                />
                <ActionButton
                    icon="checkmark-done"
                    label="Book Trip"
                    appColors={appColors}
                    isDark={isDark}
                    isPrimary
                />
                <ActionButton
                    icon="share-social"
                    label="Share"
                    appColors={appColors}
                    isDark={isDark}
                />
            </View> */}

            {/* Trips List */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={[fonts.bold, styles.listTitle, { color: appColors.text }]}>
                        Recent Round Trips
                    </Text>
                    {/* {roundTrips.length > 3 && ( */}
                    <TouchableOpacity style={styles.simpleViewAllBtn} onPress={() => navigation.navigate('Activity')}>
                        <Text style={styles.simpleViewAllText}>View All <Ionicons name="chevron-forward" size={mS(14)} /></Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.simpleViewAllBtn} onPress={() => navigation.navigate('Activity')}>
                        <Text style={styles.simpleViewAllText}>See All <Ionicons name="chevron-forward" size={mS(14)} /></Text>
                    </TouchableOpacity> */}
                    {/* )} */}
                </View>

                <FlatList
                    data={roundTrips.slice(0, 3)}
                    keyExtractor={(item) => item.trip_id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <RoundTripCard
                            trip={item}
                            appColors={appColors}
                            isDark={isDark}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                        />
                    )}
                    ItemSeparatorComponent={() => (
                        <View style={{ width: hS(12) }} />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="map-outline" size={50} color={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} />
                            <Text style={[styles.emptyText, { color: appColors.text }]}>No round trips found</Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                />
            </View>

            {/* Benefits Section */}
            <View style={[styles.benefitsContainer, { backgroundColor: isDark ? '#0A1931' : '#F9FAFB', borderColor: isDark ? 'transparent' : appColors.border }]}>
                <Text style={[fonts.bold, styles.benefitsTitle, { color: appColors.text }]}>
                    Why Round Trips?
                </Text>
                {/* <BenefitItem icon="checkmark" label="Explore multiple destinations in one trip" appColors={appColors} /> */}
                <BenefitItem icon="checkmark" label="Save on transportation costs" appColors={appColors} />
                <BenefitItem icon="checkmark" label="Hassle-free return journey" appColors={appColors} />
            </View>
        </Animated.View>
    );
}

// Overview Card Component
interface OverviewCardProps {
    icon: string;
    label: string;
    value: string;
    appColors: any;
    iconColor?: string;
    iconBgColor?: string;
}

function OverviewCard({ icon, label, value, appColors, iconColor, iconBgColor }: OverviewCardProps) {
    const isDark = useAppTheme().isDark;
    return (
        <View style={[styles.overviewCard, { backgroundColor: isDark ? '#0A1931' : appColors.card, borderColor: isDark ? 'transparent' : appColors.border }]}>
            <View style={[styles.overviewIcon, { backgroundColor: iconBgColor || appColors.primary + '15' }]}>
                <Ionicons name={icon as any} size={20} color={iconColor || appColors.primary} />
            </View>
            <Text style={[styles.overviewLabel, { color: appColors.secondaryText }]}>{label}</Text>
            <Text style={[fonts.bold, styles.overviewValue, { color: appColors.text }]}>{value}</Text>
        </View>
    );
}

// Action Button Component
interface ActionButtonProps {
    icon: string;
    label: string;
    appColors: any;
    isDark: boolean;
    isPrimary?: boolean;
}

function ActionButton({ icon, label, appColors, isDark, isPrimary }: ActionButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.actionButton,
                isPrimary
                    ? { backgroundColor: appColors.button }
                    : {
                        backgroundColor: isDark ? '#374151' : '#E5E7EB',
                        borderColor: appColors.border,
                        borderWidth: 1,
                    }
            ]}
            activeOpacity={0.7}
        >
            <Ionicons
                name={icon as any}
                size={16}
                color={isPrimary ? '#fff' : appColors.icon}
            />
            <Text
                style={[
                    styles.actionLabel,
                    { color: isPrimary ? '#fff' : appColors.text }
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

// Round Trip Card Component
export function RoundTripCard({
    trip,
    appColors,
    isDark,
    getStatusColor,
    getStatusIcon
}: {
    trip: Trip;
    appColors: any;
    isDark: boolean;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => string;
}) {
    const navigation = useNavigation<any>();

    const handleBookAgain = (trip: Trip) => {
        navigation.navigate(LocationSearch_Nav, {
            selectedDropOff: trip.drop_address,
            dropoffLocation: { dropLat: trip.drop_lat, dropLng: trip.drop_lng },
            rideType: trip.ride_type,
            bookAgainBtn: {
                paddingHorizontal: hS(12),
                paddingVertical: vS(6),
                borderRadius: mS(8),
                justifyContent: "center",
                alignItems: "center",
            },
            bookAgainText: {
                color: "#FFFFFF",
                fontSize: mS(11),
                fontWeight: "700",
            },
        });
    };

    const dateStr = trip.scheduled_start_time ? new Date(trip.scheduled_start_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return (
        <View style={[styles.recentTripCard, { backgroundColor: isDark ? '#0A1931' : appColors.card, borderColor: isDark ? 'transparent' : appColors.border }]}>
            <View style={styles.rtcHeader}>
                <View style={[styles.rtcStatusBadge, { backgroundColor: getStatusColor(trip.trip_status) + '15' }]}>
                    <Ionicons name={getStatusIcon(trip.trip_status) as any} size={mS(10)} color={getStatusColor(trip.trip_status)} />
                    <Text style={[styles.rtcStatusText, { color: getStatusColor(trip.trip_status) }]}>{trip.trip_status}</Text>
                </View>
                <View style={styles.rtcDateWrapper}>
                    <Ionicons name="calendar-outline" size={mS(12)} color={appColors.secondaryText} style={{ marginRight: hS(4) }} />
                    <Text style={[styles.rtcDate, { color: appColors.secondaryText }]}>{dateStr}</Text>
                </View>
            </View>

            <View style={styles.rtcLocations}>
                <View style={styles.rtcDots}>
                    <View style={[styles.rtcDot, { backgroundColor: '#3B82F6' }]} />
                    <View style={styles.rtcLine} />
                    <View style={[styles.rtcDot, { backgroundColor: '#EF4444' }]} />
                </View>
                <View style={styles.rtcAddresses}>
                    <Text style={[styles.rtcAddressText, { color: appColors.text }]} numberOfLines={1}>{trip.pickup_address}</Text>
                    <Text style={[styles.rtcAddressText, { color: appColors.text }]} numberOfLines={1}>{trip.drop_address}</Text>
                </View>
            </View>

            <View style={[styles.rtcStatsRow, { borderTopColor: appColors.border, borderBottomColor: appColors.border }]}>
                <View style={styles.rtcStatBox}>
                    <Text style={[styles.rtcStatLabel, { color: appColors.secondaryText }]}>Distance</Text>
                    <Text style={[styles.rtcStatValue, { color: appColors.text }]}>{trip.distance_km} km</Text>
                </View>
                <View style={[styles.rtcStatDivider, { backgroundColor: appColors.border }]} />
                <View style={styles.rtcStatBox}>
                    <Text style={[styles.rtcStatLabel, { color: appColors.secondaryText }]}>Fare</Text>
                    <Text style={[styles.rtcStatValue, { color: '#3B82F6' }]}>₹{trip.total_fare || '0.00'}</Text>
                </View>
                <View style={[styles.rtcStatDivider, { backgroundColor: appColors.border }]} />
                <View style={styles.rtcStatBox}>
                    <Text style={[styles.rtcStatLabel, { color: appColors.secondaryText }]}>Status</Text>
                    <Text style={[styles.rtcStatValue, { color: getStatusColor(trip.trip_status) }]}>
                        {trip.trip_status.charAt(0).toUpperCase() + trip.trip_status.slice(1).toLowerCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.rtcActions}>
                <TouchableOpacity style={[styles.rtcBtnOutline, { borderColor: '#3B82F6' }]} onPress={() => handleBookAgain(trip)}>
                    <Text style={[styles.rtcBtnOutlineText, { color: '#3B82F6' }]}>Book Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rtcBtnFilled, { backgroundColor: '#0F172A' }]} onPress={() => navigation.navigate(RideDetails_Nav, { rideData: trip })}>
                    <Text style={styles.rtcBtnFilledText}>View Details <Ionicons name="arrow-forward" size={mS(12)} color="#FFF" /></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Benefit Item Component
interface BenefitItemProps {
    icon: string;
    label: string;
    appColors: any;
}

function BenefitItem({ icon, label, appColors }: BenefitItemProps) {
    return (
        <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: appColors.primary + '15' }]}>
                <Ionicons name={icon as any} size={14} color={appColors.primary} />
            </View>
            <Text style={[styles.benefitLabel, { color: appColors.text }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: hS(16),
        paddingVertical: vS(20),
        gap: vS(16),
    },

    // Header
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: mS(18),
        fontWeight: '700',
        lineHeight: vS(24),
        marginBottom: vS(4),
    },
    subtitle: {
        fontSize: mS(12),
        fontWeight: '400',
        lineHeight: vS(16),
    },
    filterButton: {
        width: hS(40),
        height: hS(40),
        borderRadius: hS(20),
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Overview Stats
    overviewRow: {
        flexDirection: 'row',
        gap: hS(12),
        justifyContent: 'space-between',
    },
    overviewCard: {
        flex: 1,
        borderRadius: mS(12),
        paddingHorizontal: hS(10),
        paddingVertical: vS(14),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    overviewIcon: {
        width: hS(36),
        height: hS(36),
        borderRadius: hS(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(8),
    },
    overviewLabel: {
        fontSize: mS(10),
        fontWeight: '500',
        marginBottom: vS(4),
        textAlign: 'center',
    },
    overviewValue: {
        fontSize: mS(14),
        fontWeight: '700',
        textAlign: 'center',
    },

    // Featured Section
    featuredContainer: {
        borderRadius: mS(16),
        marginTop: vS(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    featuredImage: {
        width: '100%',
        borderTopLeftRadius: mS(16),
        borderTopRightRadius: mS(16),
    },
    featuredBadge: {
        position: 'absolute',
        top: vS(12),
        right: hS(12),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: mS(12),
        gap: hS(4),
    },
    badgeText: {
        color: '#fff',
        fontSize: mS(9),
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    featuredOverlay: {
        paddingHorizontal: hS(16),
        paddingVertical: vS(16),
    },
    featuredTitle: {
        color: '#fff',
        fontSize: mS(16),
        fontWeight: '700',
        marginBottom: vS(4),
    },
    featuredMeta: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: mS(11),
        fontWeight: '500',
    },
    featuredStatusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: hS(6),
        paddingVertical: vS(2),
        borderRadius: mS(4),
        gap: hS(4),
        marginBottom: vS(8),
    },
    featuredStatusText: {
        color: '#FFF',
        fontSize: mS(9),
        fontWeight: '700',
    },
    featuredMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    featuredBtn: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: hS(12),
        paddingVertical: vS(6),
        borderRadius: mS(8),
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(4),
    },
    featuredBtnText: {
        color: '#0F172A',
        fontSize: mS(11),
        fontWeight: '700',
    },

    // Recent Trip Card Styles
    recentTripCard: {
        width: hS(280),
        borderRadius: mS(12),
        borderWidth: 1,
        padding: mS(14),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    rtcHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(14),
    },
    rtcStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(6),
        paddingVertical: vS(2),
        borderRadius: mS(4),
        gap: hS(4),
    },
    rtcStatusText: {
        fontSize: mS(9),
        fontWeight: '700',
    },
    rtcDateWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rtcDate: {
        fontSize: mS(10),
        fontWeight: '500',
    },
    rtcLocations: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vS(14),
    },
    rtcDots: {
        alignItems: 'center',
        width: hS(16),
        marginRight: hS(8),
    },
    rtcDot: {
        width: mS(8),
        height: mS(8),
        borderRadius: mS(4),
    },
    rtcLine: {
        width: 1,
        height: vS(12),
        borderLeftWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        marginVertical: vS(2),
    },
    rtcAddresses: {
        flex: 1,
        justifyContent: 'space-between',
        height: vS(32),
    },
    rtcAddressText: {
        fontSize: mS(11),
        fontWeight: '600',
    },
    rtcStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: vS(10),
        marginBottom: vS(14),
    },
    rtcStatBox: {
        flex: 1,
        alignItems: 'center',
    },
    rtcStatLabel: {
        fontSize: mS(9),
        marginBottom: vS(2),
    },
    rtcStatValue: {
        fontSize: mS(11),
        fontWeight: '700',
    },
    rtcStatDivider: {
        width: 1,
        height: '100%',
    },
    rtcActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: hS(10),
    },
    rtcBtnOutline: {
        flex: 1,
        borderWidth: 1,
        borderRadius: mS(8),
        paddingVertical: vS(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    rtcBtnOutlineText: {
        fontSize: mS(11),
        fontWeight: '600',
    },
    rtcBtnFilled: {
        flex: 1,
        borderRadius: mS(8),
        paddingVertical: vS(8),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    rtcBtnFilledText: {
        fontSize: mS(11),
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // List Container
    listContainer: {
        gap: vS(12),
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: hS(4),
    },
    listTitle: {
        fontSize: mS(16),
        fontWeight: '700',
        lineHeight: vS(20),
    },
    simpleViewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    simpleViewAllText: {
        fontSize: mS(12),
        fontWeight: '600',
        color: '#3B82F6',
    },
    listContent: {
        paddingHorizontal: hS(4),
        gap: hS(12),
    },

    emptyContainer: {
        alignItems: "center",
        paddingVertical: vS(30),
        gap: vS(12),
    },
    emptyText: {
        fontSize: mS(14),
        fontWeight: "600",
    },
    benefitsContainer: {
        borderRadius: mS(12),
        borderWidth: 1,
        paddingHorizontal: hS(16),
        paddingVertical: vS(14),
        gap: vS(10),
    },
    benefitsTitle: {
        fontSize: mS(14),
        fontWeight: '700',
        marginBottom: vS(4),
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(10),
    },
    benefitIcon: {
        width: hS(24),
        height: hS(24),
        borderRadius: hS(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    benefitLabel: {
        fontSize: mS(12),
        fontWeight: '500',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vS(12),
        paddingHorizontal: hS(16),
        borderRadius: mS(12),
        gap: hS(8),
        marginVertical: vS(8),
    },
    actionLabel: {
        fontSize: mS(14),
        fontWeight: '600',
    },
});