import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../../../../redux/store';
import colors from '../../../../constant/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Replace with your actual navigation constant for Scheduled details if different
import { BookedTripScreen_Nav } from '../../../../Navigations/navigations';
import { useAppTheme } from '../../../../hooks/useAppTheme';

const ScheduledTripsList = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors: appColors, isDark } = useAppTheme();

    // Select the scheduledTrips array we set up in Redux
    const scheduledTrips = useSelector((state: RootState) => state.tripSlice.scheduledTrips);
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'REQUESTED':
                return { label: 'Searching Driver', bgColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#F3F4F6', dotColor: '#9CA3AF', textColor: isDark ? '#94A3B8' : '#6B7280' };
            case 'ACCEPTED':
                return { label: 'Driver Accepted', bgColor: isDark ? 'rgba(14, 165, 233, 0.1)' : '#E0F2FE', dotColor: '#0EA5E9', textColor: '#0EA5E9' };
            case 'ARRIVING':
                return { label: 'Driver Arriving', bgColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7', dotColor: '#F59E0B', textColor: isDark ? '#F59E0B' : '#D97706' };
            case 'LIVE':
                return { label: 'Live', bgColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#DCFCE7', dotColor: '#10B981', textColor: isDark ? '#10B981' : '#16A34A' };
            case 'CANCELLED':
            case 'MID_CANCELLED':
                return { label: 'Cancelled', bgColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2', dotColor: '#EF4444', textColor: isDark ? '#F87171' : '#B91C1C' };
            case 'COMPLETED':
                return { label: 'Completed', bgColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', dotColor: '#10B981', textColor: isDark ? '#34D399' : '#059669' };
            default:
                return { label: status, bgColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#F3F4F6', dotColor: '#9CA3AF', textColor: isDark ? '#94A3B8' : '#6B7280' };
        }
    };

    const renderTripItem = ({ item }: { item: any }) => {
        const statusInfo = getStatusInfo(item.trip_status);
        const isSearching = item.trip_status === 'REQUESTED';

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E7EB', borderWidth: isDark ? 1 : 1 }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(BookedTripScreen_Nav, item)}
            >
                <View style={styles.cardHeader}>
                    <View style={[
                        styles.statusTag,
                        { backgroundColor: statusInfo.bgColor }
                    ]}>
                        <View style={[
                            styles.dot,
                            { backgroundColor: statusInfo.dotColor }
                        ]} />
                        <Text style={[
                            styles.statusText,
                            { color: statusInfo.textColor }
                        ]}>
                            {statusInfo.label}
                        </Text>
                    </View>

                    {/* Display the Scheduled Date/Time */}
                    <View style={styles.timeContainer}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color={isDark ? appColors.secondaryText : "#6B7280"} />
                        <Text style={[styles.dateTimeText, { color: appColors.secondaryText }]}>
                            {item.scheduled_start_time ? new Date(item.scheduled_start_time).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'Pending Time'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={[styles.avatarContainer, { backgroundColor: isSearching ? (isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB') : (isDark ? 'rgba(56, 189, 248, 0.1)' : '#F0F9FF') }]}>
                        <MaterialCommunityIcons
                            name="calendar-clock"
                            size={24}
                            color={isSearching ? (isDark ? '#94A3B8' : '#94A3B8') : (isDark ? '#38BDF8' : colors.primary)}
                        />
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={[styles.addressLabel, { color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#9CA3AF' }]}>Pickup Location</Text>
                        <Text style={[styles.addressText, { color: appColors.text }]} numberOfLines={1}>
                            {item.pickup_address || 'Current Location'}
                        </Text>
                        <View style={[styles.verticalDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E7EB' }]} />
                        <Text style={[styles.addressLabel, { color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#9CA3AF' }]}>Drop-off Location</Text>
                        <Text style={[styles.addressText, { color: appColors.text }]} numberOfLines={1}>
                            {item.drop_address}
                        </Text>
                    </View>

                    <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                </View>

                {!isSearching && (
                    <View style={[styles.driverQuickInfo, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                        <Text style={[styles.driverNote, { color: appColors.secondaryText }]}>
                            Driver: <Text style={{ fontWeight: '700', color: appColors.text }}>{item.driver_details?.full_name || 'Assigned'}</Text>
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        )
    };

    return (
        <View style={[styles.safeArea, {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: appColors.background
        }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? appColors.background : "white"} />
            <View style={[styles.header, { backgroundColor: appColors.card, borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? appColors.text : "#111"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: appColors.text }]}>Scheduled Bookings</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={scheduledTrips}
                keyExtractor={(item) => item.trip_id.toString()}
                renderItem={renderTripItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar-blank" size={60} color={isDark ? 'rgba(255, 255, 255, 0.1)' : "#E5E7EB"} />
                        <Text style={[styles.emptyTitle, { color: appColors.text }]}>No scheduled rides</Text>
                        <Text style={[styles.emptySub, { color: appColors.secondaryText }]}>Your upcoming bookings will appear here.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
    listContent: { padding: 15 },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    timeContainer: { flexDirection: 'row', alignItems: 'center' },
    dateTimeText: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginLeft: 4 },
    cardBody: { flexDirection: 'row', alignItems: 'flex-start' },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoSection: { flex: 1, marginLeft: 15 },
    addressLabel: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' },
    addressText: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
    verticalDivider: { height: 10, width: 1, backgroundColor: '#E5E7EB', marginLeft: 5, marginVertical: 2 },
    driverQuickInfo: {
        marginTop: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    driverNote: { fontSize: 12, color: '#4B5563' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 15 },
    emptySub: { fontSize: 14, color: '#9CA3AF', marginTop: 5 },
});

export default ScheduledTripsList;