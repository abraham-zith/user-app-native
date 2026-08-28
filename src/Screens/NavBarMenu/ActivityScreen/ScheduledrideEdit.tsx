import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator, Modal, StyleSheet, ToastAndroid, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LocationSearch from '../../LocationSelection/index';
import formatDate from '../../../Components/FormatDate';
import { useUpdateTripMutation, useUpdateTripChangesMutation } from '../../../service/userApi';
import { useCancelTripMutation } from '../../../service/tripApi';
import { Trip, TripChangesPayload } from '../../../types/trip';
import { CancelBy, CancelReason, ChangeBy, ChangeType, TripStatus } from '../../../enums/trip.enum';
import { useAppTheme } from '../../../hooks/useAppTheme';

const CANCEL_REASONS = [
    { label: "Driver is too far away", value: CancelReason.DRIVER_TOO_FAR },
    { label: "Changed my mind", value: CancelReason.CHANGED_MY_MIND },
    { label: "Wait time is too long", value: CancelReason.WAIT_TIME_TOO_LONG },
    { label: "Mistake in pickup/drop address", value: CancelReason.MISTAKE_IN_ADDRESS },
    { label: "Found another ride", value: CancelReason.FOUND_ANOTHER_RIDE },
];

const { width } = Dimensions.get('window');

const ScheduledrideEdit = ({ route, navigation }: any) => {
    const [updateTrip] = useUpdateTripMutation();
    const [cancelTrip] = useCancelTripMutation();
    const [updateTripChanges, { isLoading }] = useUpdateTripChangesMutation();
    const { colors: appColors, isDark } = useAppTheme();

    // 1. Get data passed from the Activity list
    const { rideData } = route.params;

    const [updateTripPayload, setUpdateTripPayload] = useState<Partial<Trip>>(({
        pickup_address: rideData.pickup_address,
        drop_address: rideData.drop_address,
        scheduled_start_time: rideData.scheduled_start_time,
        ride_type: rideData.ride_type,
        trip_duration_minutes: rideData.trip_duration_minutes
    }));

    // 2. State management
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({ ...rideData });
    const [modalType, setModalType] = useState<"start" | "destination" | null>(null);
    const pickupaddressname = rideData.pickup_address?.split(',')[0];
    const dropaddressname = rideData.drop_address?.split(',')[0];
    const [showReasons, setShowReasons] = useState(false);

    const handleChildDataChange = (updatedFields: Partial<Trip>) => {
        setEditedData((prev: Partial<Trip>) => ({
            ...prev,
            ...updatedFields,
            trip_duration_minutes: rideData.trip_duration_minutes,
        }));
    };

    const handleUpdate = async () => {
        const allowedFields = [
            'trip_id',
            'pickup_address',
            'drop_address',
            'scheduled_start_time',
            'ride_type',
            'vehicle_model',
            'vehicle_type',
            'transmission_type',
        ];

        const rawData = {
            trip_id: rideData.trip_id,
            ...editedData,
            trip_duration_minutes: rideData.trip_duration_minutes
        };

        const cleanPayload = Object.fromEntries(
            Object.entries(rawData).filter(([key, value]) =>
                allowedFields.includes(key) && value != null
            )
        );

        try {
            const result = await updateTrip(cleanPayload).unwrap();
            if (result.success) {
                const updatedFields = Object.fromEntries(
                    Object.entries(editedData).filter(([key, value]) =>
                        value !== rideData[key] && value != null
                    )
                );

                const TripChangesPayload: TripChangesPayload = {
                    trip_id: rideData.trip_id,
                    change_type: ChangeType.RESCHEDULED,
                    old_value: Object.fromEntries(
                        Object.keys(updatedFields).map(key => [key, rideData[key]])
                    ),
                    new_value: updatedFields,
                    changed_by: ChangeBy.USER,
                    notes: `User updated ${Object.keys(updatedFields).join(', ')}`
                };

                const TripChangeResult = await updateTripChanges(TripChangesPayload).unwrap();

                Alert.alert("Success", "Schedule updated successfully");
                setIsEditing(false);
            }
        } catch (error: any) {
            Alert.alert("Error", error.data?.message || "Failed to update trip");
        }
        navigation.goBack();
    };

    const handleLocationSelect = (location: string, address: string) => {
        if (modalType === "start") {
            setEditedData((prev: any) => ({
                ...prev,
                pickup_address: address,
            }));
        } else if (modalType === "destination") {
            setEditedData((prev: any) => ({
                ...prev,
                drop_address: address,
            }));
        }
        setModalType(null);
    };

    const handleConfirmCancelRide = async (reason: CancelReason, notes: string) => {
        try {
            const rawData = {
                trip_id: rideData.trip_id,
                trip_status: TripStatus.CANCELLED,
                cancel_by: CancelBy.USER,
                cancel_reason: reason,
                notes: `Cancelled by User: ${notes}`
            };

            const result = await cancelTrip(rawData).unwrap();
            if (result.success) {
                const updatedFields = Object.fromEntries(
                    Object.entries(result.data).filter(([key, value]) =>
                        value !== rideData[key] && value != null
                    )
                );

                const TripChangesPayload: TripChangesPayload = {
                    trip_id: rideData.trip_id,
                    change_type: ChangeType.CANCELLED,
                    old_value: Object.fromEntries(
                        Object.keys(updatedFields).map(key => [key, rideData[key]])
                    ),
                    new_value: updatedFields,
                    changed_by: ChangeBy.USER,
                    notes: `User updated ${Object.keys(updatedFields).join(', ')}`
                };
                const TripChangeResult = await updateTripChanges(TripChangesPayload).unwrap();
                setShowReasons(false);
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Booking Cancelled Successfully', ToastAndroid.SHORT);
                }
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert('Something Went Wrong!!!', 'Try Again Later');
        }
    };

    const handleCancelRide = () => {
        Alert.alert(
            "Cancel Ride",
            "Are you sure you want to cancel this booking?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes, Cancel", style: "destructive", onPress: () => { setShowReasons(true) } }
            ]
        );
    };

    useEffect(() => {
    }, [editedData]);

    // Redesigned Helper for info rows (Read-only styled as inputs for the view state)
    const InfoRow = ({ label, value, icon, rightIcon }: any) => {
        return (
            <View style={styles.infoRowContainer}>
                <Text style={[styles.infoRowLabel, { color: isDark ? '#94A3B8' : '#1E293B' }]}>
                    {label}
                </Text>
                <View style={[
                    styles.infoRowInputBox,
                    {
                        backgroundColor: appColors.card,
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'
                    }
                ]}>
                    <MaterialCommunityIcons name={icon} size={20} color="#2563EB" style={styles.infoRowIcon} />
                    <Text style={[styles.infoRowValue, { color: appColors.text }]} numberOfLines={1}>
                        {value}
                    </Text>
                    {rightIcon && (
                        <MaterialCommunityIcons name={rightIcon} size={18} color="#94A3B8" />
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? appColors.background : (isEditing ? appColors.background : '#F9FAFB') }}>
            {/* HEADER */}
            <View style={[styles.headerContainer, { backgroundColor: appColors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={appColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: appColors.text }]}>
                    {isEditing ? "Edit Schedule" : "Scheduled Ride Details"}
                </Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: isEditing ? 0 : 20, paddingTop: isEditing ? 140 : 20 }}>
                {isEditing ? (
                    <LocationSearch
                        pickupLocation={editedData.pickup_address}
                        dropLocation={editedData.drop_address}
                        sDate={new Date(editedData.scheduled_start_time)}
                        sRide={editedData.ride_type}
                        isadvancebooking={true}
                        onDataChange={handleChildDataChange}
                        sVehicleModel={editedData.vehicle_model}
                        sTransmission={editedData.transmission_type}
                    />
                ) : (
                    <View style={[styles.mainCard, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>

                        {/* Status Badge & ID */}
                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF7ED' }]}>
                                <Text style={[styles.statusText, { color: '#EA580C' }]}>
                                    {rideData.trip_status.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.rideIdText}>ID: {rideData.trip_code}</Text>
                        </View>

                        {/* Fields */}
                        <InfoRow
                            label="Pickup Location"
                            value={editedData.pickup_address || pickupaddressname}
                            icon="map-marker-outline"
                            rightIcon="close"
                        />
                        <InfoRow
                            label="Destination"
                            value={editedData.drop_address || dropaddressname}
                            icon="flag-outline"
                            rightIcon="close"
                        />

                        {/* Date & Time Row */}
                        <View style={styles.dateTimeRow}>
                            <View style={{ flex: 1 }}>
                                <InfoRow
                                    label="Date"
                                    value={formatDate(editedData.scheduled_start_time)}
                                    icon="calendar-blank-outline"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <InfoRow
                                    label="Time"
                                    value={(new Date(editedData.scheduled_start_time)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    icon="clock-outline"
                                />
                            </View>
                        </View>

                        <InfoRow
                            label="Ride Type"
                            value={editedData.ride_type}
                            icon="car-outline"
                            rightIcon="chevron-down"
                        />

                        {/* Heads up Alert */}
                        <View style={[styles.alertBox, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#EFF6FF' }]}>
                            <MaterialCommunityIcons name="calendar-blank" size={32} color="#2563EB" style={styles.alertIcon} />
                            <View style={styles.alertTextContainer}>
                                <Text style={[styles.alertTitle, { color: appColors.text }]}>Heads up!</Text>
                                <Text style={[styles.alertDescription, { color: isDark ? '#94A3B8' : '#334155' }]}>
                                    You can reschedule or cancel your trip up to 2 hours before the scheduled time.
                                </Text>
                            </View>
                        </View>

                    </View>
                )}
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={[styles.footerContainer, { backgroundColor: appColors.background }]}>
                {!isEditing ? (
                    <View style={styles.footerInner}>
                        <TouchableOpacity
                            onPress={() => setIsEditing(true)}
                            style={styles.updateButton}
                        >
                            <MaterialCommunityIcons name="calendar-edit" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.updateButtonText}>Update Schedule</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCancelRide}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.footerInner}>
                        <TouchableOpacity
                            onPress={handleUpdate}
                            disabled={isLoading}
                            style={[styles.updateButton, { opacity: isLoading ? 0.5 : 1 }]}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.updateButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setEditedData({ ...rideData });
                                setIsEditing(false)
                            }}
                            style={styles.cancelButton}
                        >
                            <Text style={[styles.cancelButtonText, { color: appColors.secondaryText }]}>Discard Changes</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Cancel Modal */}
            <Modal statusBarTranslucent navigationBarTranslucent visible={showReasons} transparent animationType="slide">
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <View style={[styles.reasonSheet, { backgroundColor: appColors.card }]}>
                        <View style={[styles.handle, { backgroundColor: appColors.border }]} />
                        <Text style={[styles.modalTitle, { color: appColors.text }]}>Why are you cancelling?</Text>

                        {CANCEL_REASONS.map((reason, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.reasonOption, { borderBottomColor: appColors.border }]}
                                onPress={() => handleConfirmCancelRide(reason.value, reason.label)}
                            >
                                <Text style={[styles.reasonText, { color: appColors.text }]}>{reason.label}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={appColors.secondaryText} />
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.keepBookingBtn}
                            onPress={() => setShowReasons(false)}
                        >
                            <Text style={styles.keepBookingText}>Don't Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    mainCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    rideIdText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    infoRowContainer: {
        marginBottom: 16,
    },
    infoRowLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    infoRowInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 52,
    },
    infoRowIcon: {
        marginRight: 12,
    },
    infoRowValue: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    alertBox: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    alertIcon: {
        marginRight: 12,
    },
    alertTextContainer: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    alertDescription: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '400',
    },
    footerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    footerInner: {
        gap: 16,
    },
    updateButton: {
        backgroundColor: '#2563EB',
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    cancelButton: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    reasonSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    reasonOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    reasonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    keepBookingBtn: {
        backgroundColor: '#2563EB',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    keepBookingText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ScheduledrideEdit;