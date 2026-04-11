import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../../../../redux/store';
import colors from '../../../../constant/colors';
import { BookedTripScreen_Nav } from '../../../../Navigations/navigations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../../hooks/useAppTheme';

const OngoingTripsList = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors: appColors, isDark } = useAppTheme();
    const activeTrips = useSelector((state: RootState) => state.tripSlice.activeTrips);
    // console.log(activeTrips, "activeTrips");
    const renderTripItem = ({ item }: { item: any }) => {

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E7EB' }]}
                onPress={() => navigation.navigate(BookedTripScreen_Nav, item)}
            >
                <View style={styles.cardHeader}>
                    <View style={[
                        styles.statusTag,
                        {
                            backgroundColor: item.trip_status === 'LIVE' ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#DCFCE7') :
                                item.trip_status === 'ARRIVING' ? (isDark ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7') :
                                    item.trip_status === 'ACCEPTED' ? (isDark ? 'rgba(14, 165, 233, 0.1)' : '#E0F2FE') : (isDark ? 'rgba(148, 163, 184, 0.1)' : '#F3F4F6')
                        }
                    ]}>
                        <View style={[
                            styles.dot,
                            {
                                backgroundColor: item.trip_status === 'LIVE' ? '#10B981' :
                                    item.trip_status === 'ARRIVING' ? '#F59E0B' :
                                        item.trip_status === 'ACCEPTED' ? '#0EA5E9' : '#9CA3AF'
                            }
                        ]} />
                        <Text style={[
                            styles.statusText,
                            {
                                color: item.trip_status === 'LIVE' ? (isDark ? '#10B981' : '#16A34A') :
                                    item.trip_status === 'ARRIVING' ? (isDark ? '#F59E0B' : '#D97706') :
                                        item.trip_status === 'ACCEPTED' ? '#0EA5E9' : (isDark ? '#94A3B8' : '#6B7280')
                            }
                        ]}>
                            {item.trip_status === 'LIVE' ? 'Live' :
                                item.trip_status === 'ARRIVING' ? 'Driver Arriving' :
                                    item.trip_status === 'ACCEPTED' ? 'Driver Accepted' : item.trip_status}
                        </Text>
                    </View>
                    <Text style={[styles.etaText, { color: appColors.secondaryText }]}>
                        {item.eta ? `${item.eta} mins away` : 'Updating...'}
                    </Text>
                </View>

                <View style={[styles.cardBody, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', borderTopWidth: 0 }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#EFF6FF' }]}>
                        <MaterialCommunityIcons
                            name={item.is_for_self ? "account" : "account-heart"}
                            size={28}
                            color={isDark ? '#38BDF8' : colors.primary}
                        />
                    </View>
                    <View style={styles.infoSection}>
                        <Text style={[styles.passengerLabel, { color: appColors.text }]}>
                            {item.is_for_self ? "My Trip" : `Trip for ${item.passenger_details.name}`}
                        </Text>
                        <Text style={[styles.addressText, { color: appColors.secondaryText }]} numberOfLines={1}>
                            To: {item.drop_address}
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                </View>
            </TouchableOpacity>
        )
    };

    return (
        <View style={[styles.safeArea, {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: appColors.background
        }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={appColors.background} />
            <View style={[styles.header, { backgroundColor: appColors.card, borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6', borderBottomWidth: isDark ? 1 : 0 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? appColors.text : "#111"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: appColors.text }]}>Ongoing Bookings</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={activeTrips}
                keyExtractor={(item) => item.trip_id.toString()}
                renderItem={renderTripItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={{ color: appColors.secondaryText }}>No active trips found.</Text>
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
        padding: 20,
        backgroundColor: 'white',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
    listContent: { padding: 15 },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    etaText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    cardBody: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoSection: { flex: 1, marginLeft: 15 },
    passengerLabel: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    addressText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    emptyState: { alignItems: 'center', marginTop: 50 },
});

export default OngoingTripsList;