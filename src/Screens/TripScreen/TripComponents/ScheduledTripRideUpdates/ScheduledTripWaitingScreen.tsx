import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Easing, Platform, ScrollView, StatusBar, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../../../constant/colors';
import { hS, mS, vS } from '../../../../lib/responsive';
import { TabNavigation_Nav } from '../../../../Navigations/navigations';
import { useAppTheme } from '../../../../hooks/useAppTheme';

export const ScheduledWaitingView = ({
    tripData,
    driver,
    onCancel,
    onTransition
}: {
    tripData: any,
    driver?: any,
    onCancel: () => void,
    onTransition: () => void
}) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { colors: appColors, isDark } = useAppTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const isAccepted = !!tripData.driver_id;
    console.log(driver, "driverdriver");

    useEffect(() => {
        // Entrance animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Pulsating Radar
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.4,
                    duration: 1500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleBackToHome = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: TabNavigation_Nav }],
            })
        );
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: appColors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={appColors.background} />
            {/* Accepted Badge / Notification */}
            {isAccepted && (
                <TouchableOpacity
                    style={[styles.acceptedBadge, { top: insets.top + vS(10), backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#A7F3D0' }]}
                    onPress={onTransition}
                    activeOpacity={0.8}
                >
                    <View style={styles.badgeContent}>
                        <View style={[styles.checkCircle, { backgroundColor: isDark ? '#10B981' : '#10B981' }]}>
                            <MaterialCommunityIcons name="check" size={mS(14)} color="white" />
                        </View>
                        <View style={styles.badgeTextContainer}>
                            <Text style={[styles.badgeTitle, { color: isDark ? '#34D399' : '#065F46' }]}>Driver Found!</Text>
                            <Text style={[styles.badgeSubtitle, { color: isDark ? 'rgba(16, 185, 129, 0.8)' : '#047857' }]}>Tap to see your ride on map</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={mS(20)} color="#10B981" />
                    </View>
                </TouchableOpacity>
            )}

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Radar Section */}
                <View style={styles.radarContainer}>
                    <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.4], outputRange: [0.6, 0] }) }]} />
                    <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.4], outputRange: [0.4, 0] }), delay: 500 } as any]} />
                    <View style={[styles.iconCircle, { borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#EFF6FF', backgroundColor: colors.primary }]}>
                        <MaterialCommunityIcons name="car-connected" size={mS(40)} color="white" />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: appColors.text }]}>{isAccepted ? "Driver is Confirmed" : "Finding your Driver"}</Text>
                    <Text style={[styles.subtitle, { color: appColors.secondaryText }]}>
                        {isAccepted
                            ? "Your driver is ready for the scheduled time. Click the badge above to track."
                            : "Relax! We're matching you with the best driver for your scheduled trip."}
                    </Text>

                    {/* Card 1: Schedule & Ride Type */}
                    <View style={[styles.tripCard, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.tripRow, { flex: 1 }]}>
                                <View style={[styles.iconBg, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
                                    <MaterialCommunityIcons name="calendar-clock" size={mS(20)} color={isDark ? '#60A5FA' : colors.primary} />
                                </View>
                                <View style={[styles.tripInfo, { marginLeft: hS(10) }]}>
                                    <Text style={[styles.tripLabel, { color: appColors.secondaryText }]}>Scheduled For</Text>
                                    <Text style={[styles.tripValue, { color: appColors.text, fontSize: mS(13) }]}>
                                        {new Date(tripData.scheduled_start_time).toLocaleString([], {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                                        })}
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.tripRow, { flex: 1, marginLeft: hS(10) }]}>
                                <View style={[styles.iconBg, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#F5F3FF' }]}>
                                    <MaterialCommunityIcons name="car-info" size={mS(20)} color="#8B5CF6" />
                                </View>
                                <View style={[styles.tripInfo, { marginLeft: hS(10) }]}>
                                    <Text style={[styles.tripLabel, { color: appColors.secondaryText }]}>Ride Type</Text>
                                    <Text style={[styles.tripValue, { color: appColors.text, fontSize: mS(13), textTransform: 'capitalize' }]}>
                                        {tripData.ride_type?.replace(/_/g, ' ').toLowerCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {isAccepted && (
                            <>
                                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', marginLeft: 0 }]} />
                                <View style={[styles.tripRow, { marginTop: vS(5) }]}>
                                    <View style={[styles.iconBg, { width: mS(45), height: mS(45), borderRadius: mS(22.5), backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', overflow: 'hidden' }]}>
                                        {driver?.driverProfilePic ? (
                                            <Image source={{ uri: driver.driverProfilePic }} style={{ width: '100%', height: '100%' }} />
                                        ) : (
                                            <MaterialCommunityIcons name="account" size={mS(24)} color="#F59E0B" />
                                        )}
                                    </View>
                                    <View style={styles.tripInfo}>
                                        <Text style={[styles.tripLabel, { color: appColors.secondaryText }]}>Driver Details</Text>
                                        <Text style={[styles.tripValue, { color: appColors.text, marginBottom: vS(2) }]} numberOfLines={1}>
                                            {driver?.driverName || tripData.driver_name || 'Driver'}
                                        </Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialCommunityIcons name="star" size={mS(14)} color="#F59E0B" />
                                            <Text style={{ fontSize: mS(12), color: appColors.secondaryText, marginLeft: hS(4) }}>
                                                {driver?.driverRating || '4.9'} • {driver?.totalRides || '4.5k'} Rides
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Card 2: Locations */}
                    <View style={[styles.tripCard, { marginTop: vS(15), backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                        <View style={styles.tripRow}>
                            <View style={[styles.iconBg, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
                                <MaterialCommunityIcons name="map-marker-outline" size={mS(20)} color="#10B981" />
                            </View>
                            <View style={styles.tripInfo}>
                                <Text style={[styles.tripLabel, { color: appColors.secondaryText }]}>Pickup</Text>
                                <Text style={[styles.tripValue, { color: appColors.text }]} numberOfLines={1}>{tripData.pickup_address}</Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]} />

                        <View style={styles.tripRow}>
                            <View style={[styles.iconBg, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                                <MaterialCommunityIcons name="map-marker" size={mS(20)} color="#EF4444" />
                            </View>
                            <View style={styles.tripInfo}>
                                <Text style={[styles.tripLabel, { color: appColors.secondaryText }]}>Destination</Text>
                                <Text style={[styles.tripValue, { color: appColors.text }]} numberOfLines={1}>{tripData.drop_address}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Info Note */}
                    <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4', borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7' }]}>
                        <MaterialCommunityIcons name="shield-check" size={mS(18)} color={isDark ? '#34D399' : "#10B981"} />
                        <Text style={[styles.infoText, { color: isDark ? '#34D399' : '#166534' }]}>
                            Your ride is secured. We'll notify you 15 mins before the trip starts.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { marginBottom: Math.max(insets.bottom, vS(10)) + vS(10) }]}>
                <TouchableOpacity style={[styles.homeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]} onPress={handleBackToHome}>
                    <MaterialCommunityIcons name="home-outline" size={mS(20)} color={isDark ? appColors.text : "#374151"} />
                    <Text style={[styles.homeButtonText, { color: isDark ? appColors.text : '#374151' }]}>Back to Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <Text style={styles.cancelText}>Cancel Request</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    acceptedBadge: {
        position: 'absolute',
        left: hS(20),
        right: hS(20),
        zIndex: 100,
        backgroundColor: '#ECFDF5',
        borderRadius: mS(12),
        borderWidth: 1,
        borderColor: '#A7F3D0',
        ...Platform.select({
            ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 4 }
        })
    },
    badgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: mS(12),
    },
    checkCircle: {
        width: mS(28),
        height: mS(28),
        borderRadius: mS(14),
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeTextContainer: {
        flex: 1,
        marginLeft: hS(12),
    },
    badgeTitle: {
        fontSize: mS(14),
        fontWeight: '800',
        color: '#065F46',
    },
    badgeSubtitle: {
        fontSize: mS(11),
        color: '#047857',
        fontWeight: '500',
    },
    radarContainer: {
        height: vS(160),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: vS(20),
    },
    pulse: {
        position: 'absolute',
        width: mS(140),
        height: mS(140),
        borderRadius: mS(70),
        backgroundColor: colors.primary,
    },
    iconCircle: {
        width: mS(80),
        height: mS(80),
        borderRadius: mS(40),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 12,
        shadowColor: colors.primary,
        shadowOpacity: 0.4,
        shadowRadius: 15,
        borderWidth: 4,
        borderColor: '#EFF6FF',
    },
    content: {
        paddingHorizontal: hS(24),
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: vS(20),
    },
    title: {
        fontSize: mS(24),
        fontWeight: '900',
        color: '#111827',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: mS(15),
        color: '#6B7280',
        textAlign: 'center',
        marginTop: vS(10),
        lineHeight: vS(22),
        paddingHorizontal: hS(10),
    },
    tripCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: mS(20),
        padding: mS(15),
        marginTop: vS(15),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
            android: { elevation: 2 }
        })
    },
    tripRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBg: {
        width: mS(40),
        height: mS(40),
        borderRadius: mS(12),
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tripInfo: {
        marginLeft: hS(16),
        flex: 1,
    },
    tripLabel: {
        fontSize: mS(11),
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tripValue: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#1F2937',
        marginTop: vS(2),
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: vS(16),
        marginLeft: hS(56),
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vS(30),
        paddingHorizontal: hS(16),
        paddingVertical: vS(12),
        backgroundColor: '#F0FDF4',
        borderRadius: mS(12),
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    infoText: {
        fontSize: mS(12),
        color: '#166534',
        marginLeft: hS(10),
        flex: 1,
        fontWeight: '500',
    },
    footer: {
        width: '100%',
        paddingHorizontal: hS(24),
        alignItems: 'center',
    },
    homeButton: {
        width: '100%',
        height: vS(56),
        borderRadius: mS(16),
        backgroundColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: vS(12),
    },
    homeButtonText: {
        fontSize: mS(16),
        fontWeight: '700',
        color: '#374151',
        marginLeft: hS(10),
    },
    cancelButton: {
        paddingVertical: vS(12),
        width: '100%',
        alignItems: 'center',
    },
    cancelText: {
        color: '#EF4444',
        fontSize: mS(15),
        fontWeight: '700',
    },
});