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



export function RoundedTrip() {
    const { colors: appColors, isDark } = useAppTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const { data: tripsData, isLoading, isFetching } = useGetTripQuery(
        { id: localuser?.id, limit: 20 },
        { skip: !localuser?.id }
    );

    const roundTrips = (tripsData?.data?.data || []).filter((trip: Trip) => trip.ride_type === 'ROUND_TRIP');

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

    const getStatusColor = (status: string) => {
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

    const getStatusIcon = (status: string) => {
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
                        Recent Round Trip
                    </Text>
                    <Text style={[styles.subtitle, { color: appColors.text }]}>
                        Your circular journeys
                    </Text>
                </View>
                <TouchableOpacity style={[styles.filterButton, { backgroundColor: appColors.primary + '15' }]}>
                    <Ionicons name="funnel" size={18} color={appColors.primary} />
                </TouchableOpacity>
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
                <View style={[styles.featuredContainer, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                    <View style={styles.featuredBadge}>
                        <Ionicons name="flame" size={12} color="#fff" />
                        <Text style={styles.badgeText}>MOST RECENT</Text>
                    </View>
                    <Image
                        source={require('../../../assets/png/RoundedTripImage.png')}
                        style={styles.featuredImage}
                        height={vS(220)}
                    />
                    <View style={[styles.featuredOverlay, { backgroundColor: appColors.primary }]}>
                        <Text style={styles.featuredTitle} numberOfLines={1}>
                            {featuredTrip.pickup_address} → {featuredTrip.drop_address}
                        </Text>
                        <Text style={styles.featuredMeta}>
                            {featuredTrip.distance_km} km • ₹{featuredTrip.total_fare} • {featuredTrip.trip_status}
                        </Text>
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
                        All Round Trips
                    </Text>
                    <Text style={[styles.listCount, { color: appColors.text }]}>
                        {roundTrips.length}
                    </Text>
                </View>

                <FlatList
                    data={roundTrips.slice(0, 5)}
                    keyExtractor={(item) => item.trip_id}
                    scrollEnabled={false}
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
                        <View style={[styles.separator, { backgroundColor: appColors.border }]} />
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
            <View style={[styles.benefitsContainer, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: appColors.border }]}>
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
    return (
        <View style={[styles.overviewCard, { backgroundColor: appColors.cardBg, borderColor: appColors.border }]}>
            <View style={[styles.overviewIcon, { backgroundColor: iconBgColor || appColors.primary + '15' }]}>
                <Ionicons name={icon as any} size={20} color={iconColor || appColors.primary} />
            </View>
            <Text style={[styles.overviewLabel, { color: appColors.subtext }]}>{label}</Text>
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
function RoundTripCard({
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
    return (
        <TouchableOpacity
            style={[
                styles.tripCard,
                {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: appColors.border,
                }
            ]}
            activeOpacity={0.7}
        >
            {/* Status Badge */}
            <View style={styles.tripCardTop}>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(trip.trip_status) + '20' }
                    ]}
                >
                    <Ionicons
                        name={getStatusIcon(trip.trip_status) as any}
                        size={13}
                        color={getStatusColor(trip.trip_status)}
                    />
                    <Text
                        style={[
                            styles.statusText,
                            { color: getStatusColor(trip.trip_status) }
                        ]}
                    >
                        {trip.trip_status}
                    </Text>
                </View>
                {trip.rating && trip.rating > 0 && (
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#FCD34D" />
                        <Text style={styles.ratingText}>{trip.rating}</Text>
                    </View>
                )}
            </View>

            {/* Route Info */}
            <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                    <View style={[styles.routeDot, { backgroundColor: appColors.primary }]} />
                    <Text style={[fonts.bold, styles.routeText, { color: appColors.text }]} numberOfLines={1}>
                        {trip.pickup_address}
                    </Text>
                </View>

                <View style={styles.routeLine}>
                    <View style={[styles.line, { backgroundColor: appColors.border }]} />
                    <Ionicons name="arrow-forward" size={14} color={appColors.primary} />
                </View>

                <View style={styles.routePoint}>
                    <View style={[styles.routeDot, { backgroundColor: appColors.primary }]} />
                    <Text style={[fonts.bold, styles.routeText, { color: appColors.text }]} numberOfLines={1}>
                        {trip.drop_address}
                    </Text>
                </View>
            </View>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
                <DetailItem icon="calendar-outline" label="Date" value={formatDate(new Date(trip.scheduled_start_time || trip.original_scheduled_start_time))} appColors={appColors} />
                <DetailItem icon="navigate-outline" label="Distance" value={`${trip.distance_km} km`} appColors={appColors} />
            </View>

            {/* Price and Action */}
            <View style={styles.tripCardBottom}>
                <View>
                    <Text style={[styles.priceLabel, { color: appColors.subtext }]}>Fare</Text>
                    <Text style={[fonts.bold, styles.priceValue, { color: appColors.primary }]}>
                        ₹{trip.total_fare}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.detailsButton, { backgroundColor: appColors.button }]}
                    activeOpacity={0.7}
                >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

// Detail Item Component
interface DetailItemProps {
    icon: string;
    label: string;
    value: string;
    appColors: any;
}

function DetailItem({ icon, label, value, appColors }: DetailItemProps) {
    return (
        <View style={styles.detailItem}>
            <Ionicons name={icon as any} size={14} color={appColors.primary} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: appColors.subtext }]}>{label}</Text>
                <Text style={[styles.detailValue, { color: appColors.text }]}>{value}</Text>
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
        borderRadius: 12,
        paddingHorizontal: hS(12),
        paddingVertical: vS(14),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overviewIcon: {
        width: hS(40),
        height: hS(40),
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
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        height: vS(240),
    },
    featuredBadge: {
        position: 'absolute',
        top: vS(12),
        right: hS(12),
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: hS(10),
        paddingVertical: vS(5),
        borderRadius: 20,
        zIndex: 10,
        gap: hS(4),
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: mS(9),
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    featuredImage: {
        width: '100%',
        height: '100%',
    },
    featuredOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
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

    // Actions Row
    actionsRow: {
        flexDirection: 'row',
        gap: hS(10),
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: vS(12),
        paddingHorizontal: hS(12),
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: hS(6),
    },
    actionLabel: {
        fontSize: mS(12),
        fontWeight: '600',
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
    listCount: {
        fontSize: mS(14),
        fontWeight: '600',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: 6,
    },
    listContent: {
        gap: vS(12),
    },

    // Trip Card
    tripCard: {
        borderRadius: 14,
        borderWidth: 1,
        padding: hS(16),
        gap: vS(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tripCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: 6,
        gap: hS(4),
    },
    statusText: {
        fontSize: mS(10),
        fontWeight: '600',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(3),
        paddingHorizontal: hS(6),
        paddingVertical: vS(3),
        borderRadius: 4,
    },
    ratingText: {
        fontSize: mS(11),
        fontWeight: '600',
        color: '#FCD34D',
    },

    // Route Container
    routeContainer: {
        gap: vS(10),
    },
    routePoint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(10),
    },
    routeDot: {
        width: hS(10),
        height: hS(10),
        borderRadius: hS(5),
    },
    routeText: {
        fontSize: mS(14),
    },
    routeLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(8),
        marginLeft: hS(5),
    },
    line: {
        flex: 1,
        height: 2,
    },

    // Details Grid
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: hS(12),
    },
    detailItem: {
        flex: 1,
        minWidth: hS(140),
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: hS(8),
    },
    detailLabel: {
        fontSize: mS(10),
        fontWeight: '500',
        marginBottom: vS(2),
    },
    detailValue: {
        fontSize: mS(12),
        fontWeight: '600',
    },

    // Trip Card Bottom
    tripCardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: vS(8),
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    priceLabel: {
        fontSize: mS(10),
        fontWeight: '500',
        marginBottom: vS(2),
    },
    priceValue: {
        fontSize: mS(16),
        fontWeight: '700',
    },
    detailsButton: {
        flexDirection: 'row',
        paddingVertical: vS(8),
        paddingHorizontal: hS(14),
        borderRadius: 8,
        alignItems: 'center',
        gap: hS(6),
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: mS(11),
        fontWeight: '600',
    },

    // Separator
    separator: {
        height: 1,
        marginVertical: vS(4),
    },

    // Benefits Container
    benefitsContainer: {
        borderRadius: 12,
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
    emptyContainer: {
        alignItems: "center",
        paddingVertical: vS(30),
        gap: vS(12),
    },
    emptyText: {
        fontSize: mS(14),
        fontWeight: "600",
    },
});