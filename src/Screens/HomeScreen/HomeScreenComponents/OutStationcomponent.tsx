import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Image, FlatList } from "react-native";
import { OutStationImage } from '../../../assets/svg';
import { Styles } from "../../../lib/styles";
import fonts from "../../../constant/fonts";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { hS, vS, mS } from '../../../lib/responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { ActivityScreen_Nav, TabNavigation_Nav, LocationSearch_Nav, RideDetails_Nav } from "../../../Navigations/navigations";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useGetTripQuery } from "../../../service/userApi";
import { RoundTripCard, getRoundTripStatusColor, getRoundTripStatusIcon } from "./RoundedTripComponent";
import { Trip } from "../../../types/trip";

interface OutstationData {
    location: string;
    duration: string;
    distance: string;
    date: string;
    status: 'active' | 'completed' | 'upcoming';
}

export function OutstationComponent() {
    const { colors: appColors, isDark } = useAppTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const navigation = useNavigation<any>();

    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const { data: tripsData, isLoading, isFetching } = useGetTripQuery(
        { id: localuser?.id, limit: 20 },
        { skip: !localuser?.id }
    );
    const outstationTrips = (tripsData?.data?.data || []).filter((trip: Trip) =>
        (trip.ride_type === 'OUTSTATION_ONE_WAY' || trip.ride_type === 'OUTSTATION_ROUND_TRIP') &&
        ['COMPLETED', 'CANCELLED', 'MID_CANCELLED'].includes(trip.trip_status)
    );

    // Mock data - replace with actual data from props
    const recentOutstations: OutstationData[] = [
        {
            location: "Mumbai - Bangalore",
            duration: "3 days",
            distance: "840 km",
            date: "Feb 10-12",
            status: "completed"
        },
        {
            location: "Delhi - Jaipur",
            duration: "2 days",
            distance: "240 km",
            date: "Feb 15-16",
            status: "active"
        },
        {
            location: "Pune - Nashik",
            duration: "1 day",
            distance: "210 km",
            date: "Feb 20",
            status: "upcoming"
        }
    ];

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
                <View style={styles.titleSection}>
                    <Text style={[fonts.bold, styles.title, { color: appColors.text }]}>
                        Recent Outside Station
                    </Text>
                    <Text style={[styles.subtitle, { color: appColors.text }]}>
                        Your outstation journey
                    </Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <StatCard
                    icon="navigate"
                    label="Total Distance"
                    value="1290 km"
                    appColors={appColors}
                    iconColor={'#8B5CF6'}
                    iconBgColor="#8B5CF615"
                />
                <StatCard
                    icon="time"
                    label="Total Duration"
                    value="6 days"
                    appColors={appColors}
                    iconColor={'#F97316'}
                    iconBgColor="#F59E0B15"
                />
                <StatCard
                    icon="checkmark-done"
                    label="Completed"
                    value="1"
                    appColors={appColors}
                    iconColor={'#10B981'}
                    iconBgColor="#4CAF5015"
                />
            </View>

            {/* Featured Image Section */}
            <View style={[styles.imageContainer, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                <View style={styles.imageBadge}>
                    <Ionicons name="flash" size={12} color="#fff" />
                    <Text style={styles.badgeText}>FEATURED</Text>
                </View>
                {/* <OutStationImage
                    width={'100%'}
                    height={vS(200)}
                    style={styles.image}
                /> */}
                <Image
                    source={require('../../../assets/png/OutstationTripImage.png')}
                    style={styles.image}
                    // width={'100%'}
                    height={vS(200)}
                />
                <View style={styles.imageOverlay} />
            </View>

            {/* Recent Trips List */}
            <View style={styles.listContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: hS(4) }}>
                    <Text style={[fonts.bold, styles.listTitle, { color: appColors.text, paddingHorizontal: 0 }]}>
                        Recent Trips
                    </Text>
                    <TouchableOpacity style={[styles.seeAllButton, { backgroundColor: appColors.primary }]} onPress={() => {
                        navigation.navigate(TabNavigation_Nav, { screen: 'Activity' })
                    }}>
                        <Text style={styles.seeAllText}>See All</Text>
                        <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                {/* 
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    scrollEventThrottle={16}
                >
                    {recentOutstations.map((outstation, index) => (
                        <TripCard
                            key={index}
                            data={outstation}
                            appColors={appColors}
                            isDark={isDark}
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                        />
                    ))}
                </ScrollView> */}

                <FlatList
                    data={outstationTrips.slice(0, 5)}
                    keyExtractor={(item) => item.trip_id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => {
                        return (
                            <RoundTripCard
                                trip={item}
                                appColors={appColors}
                                isDark={isDark}
                                getStatusColor={(status) => getRoundTripStatusColor(status, appColors)}
                                getStatusIcon={getRoundTripStatusIcon}
                            />
                        );
                    }}
                    ItemSeparatorComponent={() => (
                        <View style={[styles.separator, { backgroundColor: appColors.border }]} />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="map-outline" size={50} color={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} />
                            <Text style={[styles.emptyText, { color: appColors.text }]}>No round trips found</Text>
                        </View>
                    }
                    contentContainerStyle={styles.scrollContent}
                />
            </View>

            {/* Quick Stats Footer */}
            <View style={[styles.footerCard, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: appColors.border }]}>
                <View style={styles.footerItem}>
                    <Ionicons name="trending-up" size={20} color={appColors.primary} />
                    <View style={styles.footerText}>
                        <Text style={[styles.footerLabel, { color: appColors.text }]}>Avg Distance</Text>
                        <Text style={[fonts.bold, styles.footerValue, { color: appColors.text }]}>430 km</Text>
                    </View>
                </View>
                <View style={styles.footerDivider} />
                <View style={styles.footerItem}>
                    <Ionicons name="star" size={20} color="#F59E0B" />
                    <View style={styles.footerText}>
                        <Text style={[styles.footerLabel, { color: appColors.text }]}>Rating</Text>
                        <Text style={[fonts.bold, styles.footerValue, { color: appColors.text }]}>4.8/5</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

// Stat Card Component
interface StatCardProps {
    icon: string;
    label: string;
    value: string;
    appColors: any;
    iconColor?: string;
    iconBgColor?: string;

}

function StatCard({ icon, label, value, appColors, iconColor, iconBgColor }: StatCardProps) {
    const isDark = useAppTheme().isDark;
    return (
        <View style={[styles.statCard, { backgroundColor: isDark ? '#0A1931' : appColors.card, borderColor: isDark ? 'transparent' : appColors.border }]}>
            <View style={[styles.statIconContainer, { backgroundColor: iconBgColor || appColors.primary + '15' }]}>
                <Ionicons name={icon as any} size={18} color={iconColor || appColors.button} />
            </View>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : appColors.secondaryText }]}>{label}</Text>
            <Text style={[fonts.bold, styles.statValue, { color: isDark ? '#F3F4F6' : appColors.text }]}>{value}</Text>
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

    // Header Section
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleSection: {
        flex: 1,
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
    seeAllButton: {
        flexDirection: 'row',
        paddingHorizontal: hS(12),
        paddingVertical: vS(8),
        borderRadius: 8,
        alignItems: 'center',
        gap: hS(4),
    },
    seeAllText: {
        fontSize: mS(12),
        fontWeight: '600',
        color: '#fff',
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: hS(12),
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        paddingHorizontal: hS(12),
        paddingVertical: vS(14),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statIconContainer: {
        width: hS(36),
        height: hS(36),
        borderRadius: hS(18),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(8),
    },
    statLabel: {
        fontSize: mS(10),
        fontWeight: '500',
        marginBottom: vS(4),
        textAlign: 'center',
    },
    statValue: {
        fontSize: mS(14),
        fontWeight: '700',
    },

    // Image Section
    imageContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        height: vS(200),
        marginVertical: vS(4),
    },
    imageBadge: {
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
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: vS(80),
        backgroundColor: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
    },

    // List Container
    listContainer: {
        gap: vS(12),
    },
    listTitle: {
        fontSize: mS(16),
        fontWeight: '700',
        lineHeight: vS(20),
        paddingHorizontal: hS(4),
    },
    scrollContent: {
        paddingHorizontal: hS(4),
        gap: hS(12),
    },

    // Trip Card
    tripCard: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: hS(14),
        paddingVertical: vS(14),
        width: hS(220),
        minHeight: vS(180),
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tripStatusBadge: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: 6,
        gap: hS(4),
        alignItems: 'center',
        marginBottom: vS(10),
    },
    tripStatusText: {
        fontSize: mS(10),
        fontWeight: '600',
    },
    tripLocation: {
        fontSize: mS(14),
        lineHeight: vS(18),
        marginBottom: vS(10),
    },
    tripDetailsRow: {
        marginBottom: vS(10),
    },
    tripDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(6),
    },
    tripDetailText: {
        fontSize: mS(11),
        fontWeight: '500',
    },
    tripMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(8),
        backgroundColor: 'rgba(0,0,0,0.02)',
        paddingHorizontal: hS(10),
        paddingVertical: vS(8),
        borderRadius: 8,
        marginBottom: vS(12),
    },
    tripMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(4),
        flex: 1,
    },
    tripMetaText: {
        fontSize: mS(11),
        fontWeight: '600',
    },
    tripMetaDivider: {
        width: 1,
        height: vS(14),
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: hS(8),
        marginTop: vS(4),
    },
    bookAgainButton: {
        paddingVertical: vS(6),
        paddingHorizontal: hS(12),
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookAgainText: {
        fontSize: mS(11),
        fontWeight: '600',
    },
    detailsButton: {
        flexDirection: 'row',
        paddingVertical: vS(6),
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

    // Footer Card
    footerCard: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: hS(16),
        paddingVertical: vS(14),
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(12),
        flex: 1,
    },
    footerText: {
        justifyContent: 'center',
    },
    footerLabel: {
        fontSize: mS(11),
        fontWeight: '500',
        marginBottom: vS(2),
    },
    footerValue: {
        fontSize: mS(14),
        fontWeight: '700',
    },
    footerDivider: {
        width: 1,
        height: vS(30),
        marginHorizontal: hS(12),
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
    listContent: {
        gap: vS(12),
    },
});