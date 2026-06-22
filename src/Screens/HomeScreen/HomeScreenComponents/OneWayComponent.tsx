

import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    TextInput,
    Platform,
    ActivityIndicator,
    Alert,
    Animated,
    FlatList
} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from "../../../constant/colors";
import { useNavigation } from '@react-navigation/native';
import Config from "react-native-config";
import { useLocation } from "../../../hooks/useLocation";
import { LocationSearch_Nav } from "../../../Navigations/navigations";
import Geolocation from 'react-native-geolocation-service';
import { useAppTheme } from "../../../hooks/useAppTheme";
import { hS, vS, mS, SCREEN_HEIGHT } from '../../../lib/responsive';
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useGetTripQuery } from "../../../service/userApi";
import { useGetAvailableCouponsQuery } from "../../../service/couponApi";
import Clipboard from '@react-native-clipboard/clipboard';
import { Trip } from "../../../types/trip";
import Ionicons from 'react-native-vector-icons/Ionicons';


const GOOGLE_P_API_KEY = Config.GOOGLE_API_KEY;

const CATEGORIES = [
    { name: 'Spiritual', icon: 'hands-pray', types: ['church', 'hindu_temple', 'mosque'], color: '#10B981', bgColor: '#ECFDF5' },
    { name: 'Airport', icon: 'airplane', types: ['airport'], color: '#3B82F6', bgColor: '#EFF6FF' },
    { name: 'Beaches', icon: 'beach', types: ['tourist_attraction'], color: '#F59E0B', bgColor: '#FFFBEB' },
    { name: 'Shopping', icon: 'shopping', types: ['shopping_mall'], color: '#EC4899', bgColor: '#FDF2F8' },
    { name: 'Tech Parks', icon: 'office-building', types: ['corporate_office'], color: '#6366F1', bgColor: '#EEF2FF' },
    { name: 'Dining', icon: 'silverware-fork-knife', types: ['restaurant', 'cafe'], color: '#F43F5E', bgColor: '#FFF1F2' },
    { name: 'Parks', icon: 'pine-tree', types: ['park'], color: '#84CC16', bgColor: '#F7FEE7' },
    { name: 'Museums', icon: 'bank', types: ['museum'], color: '#8B5CF6', bgColor: '#F5F3FF' },
    { name: 'Heritage', icon: 'pillar', types: ['historical_landmark', 'monument'], color: '#D97706', bgColor: '#FEF3C7' },
];





interface OneWayProps {
    onSelectLocation: (name: string, address: string, lat: number, lng: number) => void;
}

export const OneWayComponent: React.FC<OneWayProps> = ({ onSelectLocation }) => {
    const navigation = useNavigation<any>();
    const { getCurrentLocation } = useLocation();
    const { colors: appColors, isDark } = useAppTheme();

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalTitle, setModalTitle] = useState("");

    const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    const { data: tripsData } = useGetTripQuery(
        { id: localuser?.id, limit: 5, tab: 'completed' },
        { skip: !localuser?.id }
    );
    const { data: availableCoupons } = useGetAvailableCouponsQuery();

    const couponsArray = useMemo(() => {
        if (!availableCoupons) return [];
        return Array.isArray(availableCoupons)
            ? availableCoupons
            : (availableCoupons.data || availableCoupons.coupons || []);
    }, [availableCoupons]);

    const firstCoupon = couponsArray?.[0];

    const handleClaimOffer = () => {
        if (!firstCoupon) return;
        const codeToCopy = firstCoupon.code;
        Clipboard.setString(codeToCopy);
        Alert.alert('Offer Claimed', `Coupon code "${codeToCopy}" has been copied to your clipboard.`);
    };
    const QUICK_STATS = [
        { label: 'Verified Drivers', value: '2.5K+', icon: 'shield-check', color: '#10B981' },
        { label: 'Rides Completed', value: localuser?.total_trips || '0', icon: 'check-circle', color: '#3B82F6' },
        { label: 'Avg Rating', value: localuser?.rating ? `${localuser.rating}★` : '0★', icon: 'star', color: '#FCD34D' },
    ];

    const recentOneWayTrips = (tripsData?.data?.data || [])
        .filter((trip: Trip) => trip.ride_type === 'ONE_WAY')
        .slice(0, 3);

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    const handleCategoryPress = async (category: any) => {
        setModalTitle(category.name);
        setIsOpen(true);
        setIsLoading(true);
        setModalData([]);
        const { coords } = await getCurrentLocation();

        try {
            const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_P_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
                } as any,
                body: JSON.stringify({
                    includedTypes: category.types,
                    maxResultCount: 15,
                    locationRestriction: {
                        circle: {
                            center: { latitude: coords.latitude, longitude: coords.longitude },
                            radius: 5000.0
                        }
                    }
                })
            });
            //     bookAgainBtn: {
            //         paddingHorizontal: hS(12),
            //         paddingVertical: vS(6),
            //         borderRadius: mS(8),
            //         justifyContent: "center",
            //         alignItems: "center",
            //     },
            //     bookAgainText: {
            //         color: "#FFFFFF",
            //         fontSize: mS(11),
            //         fontWeight: "700",
            //     },
            // });

            const data = await response.json();
            setIsLoading(false);

            if (data && data.places) {
                const formatted = data.places.map((p: any) => ({
                    id: p.id,
                    name: p.displayName?.text || "Unknown",
                    address: p.formattedAddress || "No Address",
                    lat: p.location.latitude,
                    lng: p.location.longitude,
                    dist: p.location ? getDistance(coords.latitude, coords.longitude, p.location.latitude, p.location.longitude) + " km" : "N/A"
                }));
                setModalData(formatted);
            }
        } catch (error) {
            setIsLoading(false);
            Alert.alert('Something Went Wrong!!!', 'Try Again Later');
        }
    };

    const handleSelectPlace = (place: any) => {
        const fullAddress = `${place.name}, ${place.address}`;
        onSelectLocation(place.name, place.address, place.lat, place.lng);
        navigation.navigate(LocationSearch_Nav, {
            selectedDropOff: fullAddress,
            dropoffLocation: { dropLat: place.lat, dropLng: place.lng },
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
        setIsOpen(false);
        setSearch("");
    };

    const handleBookAgain = (trip: Trip) => {
        onSelectLocation(trip.drop_address, trip.drop_address, trip.drop_lat, trip.drop_lng);
        navigation.navigate(LocationSearch_Nav, {
            selectedDropOff: trip.drop_address,
            dropoffLocation: { dropLat: trip.drop_lat, dropLng: trip.drop_lng },
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

    const filteredResults = modalData.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Hero Section */}
                {/* <View style={[styles.heroSection, { backgroundColor: appColors.primary }]}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroSubtitle}>Ready to go?</Text>
                        <Text style={styles.heroTitle}>Book Your Ride</Text>
                        <Text style={styles.heroDescription}>
                            Quick, affordable, and reliable rides to any destination
                        </Text>
                    </View>
                    <View style={styles.heroIcon}>
                        <MaterialCommunityIcons name="car-multiple" size={mS(64)} color="rgba(255,255,255,0.3)" />
                    </View>
                </View> */}

                {/* Quick Stats */}
                <View style={styles.statsSection}>
                    {QUICK_STATS.map((stat, idx) => (
                        <View key={idx} style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: appColors.border }]}>
                            <View style={[styles.statIconBox, { backgroundColor: stat.color + '20' }]}>
                                <MaterialCommunityIcons name={stat.icon} size={mS(20)} color={stat.color} />
                            </View>
                            <Text style={[styles.statValue, { color: appColors.text }]}>{stat.value}</Text>
                            <Text style={[styles.statLabel, { color: appColors.text }]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
                {/* Popular Routes Section */}
                <View style={styles.popularRoutesContainer}>
                    <Text style={[styles.sectionTitle, { color: appColors.text }]}>Popular Routes</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {CATEGORIES.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleCategoryPress(item)}
                                style={[
                                    styles.catCard,
                                    {
                                        backgroundColor: appColors.card,
                                        borderColor: appColors.border
                                    }
                                ]}
                            >
                                <View style={[
                                    styles.iconCircle,
                                    { backgroundColor: isDark ? `${item.color}20` : item.bgColor }
                                ]}>
                                    <MaterialCommunityIcons name={item.icon} size={mS(26)} color={item.color} />
                                </View>
                                <Text numberOfLines={1} style={[styles.catText, { color: appColors.text }]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Recent OneWay Trips */}
                <View style={styles.trendingSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: appColors.text }]}>Recent Trips</Text>
                    </View>
                    {recentOneWayTrips.length > 0 ? (

                        <View style={styles.trendingGrid}>
                            {recentOneWayTrips.map((trip: Trip) => (
                                <View
                                    key={trip.trip_id}
                                    style={[
                                        styles.trendingCard,
                                        {
                                            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                            borderColor: appColors.border,
                                            flexDirection: 'column',
                                            alignItems: 'stretch',
                                        }
                                    ]}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: hS(10) }}>
                                        <View style={[styles.routeIconBox, { backgroundColor: appColors.primary + '15' }]}>
                                            <MaterialCommunityIcons name="history" size={mS(22)} color={appColors.primary} />
                                        </View>
                                        <View style={styles.routeContent}>
                                            <Text style={[styles.routeLabel, { color: appColors.text }]}>To</Text>
                                            <Text numberOfLines={1} style={[styles.routeTo, { color: appColors.text }]}>{trip.drop_address}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleBookAgain(trip)}
                                            style={[styles.bookAgainBtn, { backgroundColor: appColors.primary }]}
                                        >
                                            <Text style={styles.bookAgainText}>Book Again</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="map-outline" size={50} color={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} />
                            <Text style={[styles.emptyText, { color: appColors.text }]}>No round trips found</Text>
                        </View>
                    )}
                </View>



                {/* Why Choose Us */}
                <View style={[styles.whyChooseSection, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
                    <Text style={[styles.sectionTitle, { color: appColors.text }]}>Why Choose Us?</Text>

                    <View style={styles.benefitsGrid}>
                        {[
                            { icon: 'clock-fast', title: 'Quick Booking', desc: 'Book in seconds' },
                            { icon: 'lock-outline', title: 'Safe & Secure', desc: 'Verified drivers' },
                            { icon: 'wallet-outline', title: 'Transparent Pricing', desc: 'No hidden charges' },
                            { icon: 'headset', title: '24/7 Support', desc: 'Always here to help' },
                        ].map((benefit, idx) => (
                            <View key={idx} style={styles.benefitCard}>
                                <View style={[styles.benefitIcon, { backgroundColor: appColors.primary + '15' }]}>
                                    <MaterialCommunityIcons name={benefit.icon} size={mS(20)} color={appColors.primary} />
                                </View>
                                <Text style={[styles.benefitTitle, { color: appColors.text }]}>{benefit.title}</Text>
                                <Text style={[styles.benefitDesc, { color: appColors.text }]}>{benefit.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* CTA Section */}
                {firstCoupon && (
                    <View style={[styles.ctaSection, { backgroundColor: appColors.primary }]}>
                        <MaterialCommunityIcons name="lightning-bolt" size={mS(32)} color="rgba(255,255,255,0.3)" style={styles.ctaIcon} />
                        <Text style={styles.ctaTitle}>Special Offer</Text>
                        <Text style={styles.ctaSubtitle}>
                            {`Get ${firstCoupon.discount_type === 'PERCENTAGE' ? `${firstCoupon.discount_value}%` : `₹${firstCoupon.discount_value}`} off on your ride`}
                        </Text>
                        <Text style={styles.ctaCode}>
                            Use code: {firstCoupon.code}
                        </Text>
                        <TouchableOpacity style={styles.ctaButton} onPress={handleClaimOffer}>
                            <Text style={styles.ctaButtonText}>Claim Offer</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: vS(20) }} />
            </ScrollView>

            {/* Modal (unchanged) */}
            <Modal
                visible={isOpen}
                animationType="slide"
                transparent
                statusBarTranslucent
                navigationBarTranslucent
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.backdrop}>
                    <View style={[styles.sheetContainer, { backgroundColor: appColors.card }]}>
                        <View style={[styles.handle, { backgroundColor: appColors.border }]} />

                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: appColors.text }]}>{modalTitle} Near You</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)} style={[styles.closeBtn, { backgroundColor: appColors.iconBox }]}>
                                <MaterialCommunityIcons name="close" size={mS(20)} color={appColors.lightTextColor} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: appColors.background, borderColor: isDark ? 'transparent' : '#E2E8F0' }]}>
                            <MaterialCommunityIcons name="magnify" size={mS(22)} color={appColors.secondaryText} />
                            <TextInput
                                style={[styles.input, { color: appColors.text }]}
                                placeholder={`Search ${modalTitle.toLowerCase()}...`}
                                placeholderTextColor={appColors.secondaryText}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.button} style={{ marginTop: vS(40) }} />
                        ) : filteredResults.length > 0 ? (
                            <ScrollView contentContainerStyle={styles.listPadding}>
                                {filteredResults.map((place) => (
                                    <TouchableOpacity
                                        key={place.id}
                                        onPress={() => handleSelectPlace(place)}
                                        style={[styles.placeItem, { borderBottomColor: appColors.border }]}
                                    >
                                        <View style={[styles.iconContainer, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.2)' }]}>
                                            <MaterialCommunityIcons name="map-marker-outline" size={mS(20)} color={isDark ? '#60A5FA' : '#2563EB'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.placeName, { color: appColors.text }]}>{place.name}</Text>
                                            <Text numberOfLines={1} style={[styles.placeAddress, { color: appColors.secondaryText }]}>{place.address}</Text>
                                        </View>
                                        <View style={[styles.distanceBadge, { backgroundColor: appColors.iconBox }]}>
                                            <Text style={[styles.distanceText, { color: appColors.secondaryText }]}>{place.dist}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.noResultsContainer}>
                                <View style={[styles.noResultsIconCircle, { backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : '#FFF1F2' }]}>
                                    <MaterialCommunityIcons name="map-marker-remove-variant" size={mS(48)} color="#F43F5E" />
                                </View>
                                <Text style={[styles.noResultsTitle, { color: appColors.text }]}>No Places Found</Text>
                                <Text style={[styles.noResultsSubtitle, { color: appColors.secondaryText }]}>
                                    We couldn't find any {modalTitle.toLowerCase()} near your location at the moment.
                                </Text>
                                {search.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setSearch("")}
                                        style={[styles.clearSearchBtn, { backgroundColor: colors.button }]}
                                    >
                                        <Text style={styles.clearSearchText}>Clear Search</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // Hero Section
    heroSection: {
        paddingHorizontal: hS(20),
        paddingVertical: vS(28),
        borderBottomLeftRadius: mS(24),
        borderBottomRightRadius: mS(24),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: {
        flex: 1,
        gap: vS(8),
    },
    heroSubtitle: {
        fontSize: mS(12),
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    heroTitle: {
        fontSize: mS(26),
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: vS(32),
    },
    heroDescription: {
        fontSize: mS(12),
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: vS(16),
    },
    heroIcon: {
        opacity: 0.15,
        marginRight: hS(-10),
    },

    // Stats Section
    statsSection: {
        flexDirection: 'row',
        paddingHorizontal: hS(20),
        paddingVertical: vS(16),
        gap: hS(10),
        marginTop: vS(-12),
        marginBottom: vS(8),
    },
    statCard: {
        flex: 1,
        paddingVertical: vS(14),
        paddingHorizontal: hS(12),
        borderRadius: mS(12),
        borderWidth: 1,
        alignItems: 'center',
        gap: vS(8),
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
            android: { elevation: 2 }
        })
    },
    statIconBox: {
        width: hS(36),
        height: hS(36),
        borderRadius: hS(18),
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: mS(14),
        fontWeight: '700',
    },
    statLabel: {
        fontSize: mS(9),
        fontWeight: '500',
        textAlign: 'center',
    },

    // Trending Routes
    trendingSection: {
        paddingHorizontal: hS(20),
        paddingVertical: vS(16),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vS(12),
    },
    sectionTitle: {
        fontSize: mS(16),
        fontWeight: '700',
        color: '#1E293B',
    },
    seeAllText: {
        fontSize: mS(12),
        fontWeight: '600',
        color: '#3B82F6',
    },
    trendingGrid: {
        gap: vS(10),
    },
    trendingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(14),
        paddingVertical: vS(12),
        borderRadius: mS(14),
        borderWidth: 1,
        gap: hS(10),
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
            android: { elevation: 1 }
        })
    },
    routeIconBox: {
        width: hS(40),
        height: hS(40),
        borderRadius: mS(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    routeContent: {
        flex: 1,
    },
    routeLabel: {
        fontSize: mS(9),
        fontWeight: '500',
        marginBottom: vS(2),
    },
    routeFrom: {
        fontSize: mS(12),
        fontWeight: '600',
    },
    routeTo: {
        fontSize: mS(12),
        fontWeight: '600',
    },
    routeArrow: {
        paddingHorizontal: hS(6),
    },

    // Popular Routes
    popularRoutesContainer: {
        paddingHorizontal: hS(20),
        // paddingVertical: vS(10),
    },
    horizontalScroll: {
        paddingRight: hS(20),
        paddingBottom: hS(20),
        marginTop: vS(10),
        gap: hS(12),
    },
    catCard: {
        width: hS(90),
        height: vS(105),
        backgroundColor: '#FFFFFF',
        borderRadius: mS(16),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 4 }
        })
    },
    iconCircle: {
        width: hS(48),
        height: hS(48),
        borderRadius: hS(24),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: vS(10),
    },
    catText: {
        fontSize: mS(12),
        fontWeight: '700',
        color: '#334155',
        paddingHorizontal: hS(4),
        textAlign: 'center',
    },

    // Why Choose Us
    whyChooseSection: {
        paddingHorizontal: hS(20),
        paddingVertical: vS(20),
        marginTop: vS(8),
    },
    benefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: hS(12),
        marginTop: vS(12),
    },
    benefitCard: {
        width: '48%',
        paddingVertical: vS(16),
        paddingHorizontal: hS(12),
        borderRadius: mS(14),
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
        gap: vS(8),
    },
    benefitIcon: {
        width: hS(44),
        height: hS(44),
        borderRadius: hS(22),
        justifyContent: 'center',
        alignItems: 'center',
    },
    benefitTitle: {
        fontSize: mS(12),
        fontWeight: '700',
        textAlign: 'center',
    },
    benefitDesc: {
        fontSize: mS(10),
        textAlign: 'center',
    },

    // CTA Section
    ctaSection: {
        marginHorizontal: hS(20),
        marginVertical: vS(16),
        paddingVertical: vS(24),
        paddingHorizontal: hS(20),
        borderRadius: mS(20),
        alignItems: 'center',
        gap: vS(12),
    },
    ctaIcon: {
        marginBottom: vS(4),
    },
    ctaTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        color: '#FFFFFF',
    },
    ctaSubtitle: {
        fontSize: mS(13),
        color: 'rgba(255, 255, 255, 0.9)',
    },
    ctaCode: {
        fontSize: mS(14),
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: vS(4),
    },
    ctaButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: hS(28),
        paddingVertical: vS(10),
        borderRadius: mS(20),
        marginTop: vS(8),
    },
    ctaButtonText: {
        color: colors.button,
        fontSize: mS(12),
        fontWeight: '700',
    },

    // Modal Styles (unchanged)
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: mS(25),
        borderTopRightRadius: mS(25),
        height: SCREEN_HEIGHT * 0.85,
        paddingTop: vS(12)
    },
    handle: {
        width: hS(40),
        height: vS(5),
        backgroundColor: '#E2E8F0',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: vS(15)
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: hS(20),
        marginBottom: vS(15)
    },
    modalTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        color: '#1E293B'
    },
    closeBtn: {
        backgroundColor: '#F1F5F9',
        padding: hS(8),
        borderRadius: mS(20)
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        marginHorizontal: hS(20),
        paddingHorizontal: hS(15),
        borderRadius: mS(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: vS(48),
        marginBottom: vS(15)
    },
    input: {
        flex: 1,
        fontSize: mS(14),
        color: '#1E293B',
        marginLeft: hS(10),
        paddingVertical: 0
    },
    listPadding: {
        paddingHorizontal: hS(20),
        paddingBottom: vS(40)
    },
    placeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(15),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    iconContainer: {
        width: hS(40),
        height: hS(40),
        borderRadius: mS(10),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: hS(12)
    },
    placeName: {
        fontSize: mS(14),
        fontWeight: '700',
        color: '#1E293B'
    },
    placeAddress: {
        fontSize: mS(11),
        color: '#64748B',
        marginTop: vS(2)
    },
    distanceBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: hS(8),
        paddingVertical: vS(4),
        borderRadius: mS(6)
    },
    distanceText: {
        fontSize: mS(10),
        color: '#64748B',
        fontWeight: '600'
    },
    noResultsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: hS(40),
        paddingBottom: vS(100),
    },
    noResultsIconCircle: {
        width: hS(80),
        height: hS(80),
        borderRadius: hS(40),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: vS(20)
    },
    noResultsTitle: {
        fontSize: mS(18),
        fontWeight: '800',
        marginBottom: vS(8)
    },
    noResultsSubtitle: {
        fontSize: mS(14),
        textAlign: 'center',
        lineHeight: vS(20),
        color: '#64748B'
    },
    clearSearchBtn: {
        marginTop: vS(25),
        paddingHorizontal: hS(25),
        paddingVertical: vS(12),
        borderRadius: mS(30)
    },
    clearSearchText: {
        color: 'white',
        fontSize: mS(14),
        fontWeight: '700'
    },
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