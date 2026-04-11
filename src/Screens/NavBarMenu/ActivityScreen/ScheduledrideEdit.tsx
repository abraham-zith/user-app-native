import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, TextInput, ActivityIndicator, Modal, StyleSheet, ToastAndroid } from 'react-native';
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
        trip_duration_minutes: 10
    }))


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
            trip_duration_minutes: 10,
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

        // 2. Create the raw object
        const rawData = {
            trip_id: rideData.trip_id,
            ...editedData,
            trip_duration_minutes: 10 // Ensure this is included
        };

        // 3. Filter the object to only include allowed keys AND remove nulls
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
                    change_type: ChangeType.RESCHEDULED, // Assuming an Enum
                    old_value: Object.fromEntries(
                        Object.keys(updatedFields).map(key => [key, rideData[key]])
                    ),
                    new_value: updatedFields,
                    changed_by: ChangeBy.USER, // Or 'CUSTOMER'
                    notes: `User updated ${Object.keys(updatedFields).join(', ')}`
                };


                const TripChangeResult = await updateTripChanges(TripChangesPayload).unwrap();

                Alert.alert("Success", "Schedule updated successfully");

                setIsEditing(false);
            }
        } catch (error: any) {
            Alert.alert("Error", error.data?.message || "Failed to update trip");
        }
        navigation.goBack(); // Optional: return to list
    };

    const handleLocationSelect = (location: string, address: string) => {
        if (modalType === "start") {
            setEditedData((prev: any) => ({
                ...prev,
                pickup_address: address, // update address string
                // pickup_location: location // if you need to store lat/lng objects too
            }));
        } else if (modalType === "destination") {
            setEditedData((prev: any) => ({
                ...prev,
                drop_address: address, // update address string
                // drop_location: location
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
                    change_type: ChangeType.CANCELLED, // Assuming an Enum
                    old_value: Object.fromEntries(
                        Object.keys(updatedFields).map(key => [key, rideData[key]])
                    ),
                    new_value: updatedFields,
                    changed_by: ChangeBy.USER, // Or 'CUSTOMER'
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
            // console.error("Booking Cancel Error:", error);
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

    // Helper for info rows
    const InfoRow = ({ label, value, icon, field }: any) => {


        return (
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: appColors.secondaryText, marginBottom: 8, letterSpacing: 0.5 }}>
                    {label.toUpperCase()}
                </Text>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isEditing ? appColors.background : (isDark ? appColors.iconBox : '#F8FAFC'),
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isEditing ? appColors.primary : appColors.border
                }}>
                    <MaterialCommunityIcons name={icon} size={20} color={isEditing ? appColors.primary : appColors.secondaryText} style={{ marginRight: 12 }} />
                    {isEditing ? (
                        <View>
                            <TextInput
                                style={{ flex: 1, fontSize: 16, color: appColors.text, fontWeight: '600', padding: 0 }}
                                value={value}
                                onFocus={() => setModalType(field)}
                                placeholderTextColor={appColors.lightTextColor}
                            // onChangeText={(text) => setEditedData({ ...editedData, [field]: text })}
                            />
                        </View>

                    ) : (
                        <Text style={{ fontSize: 16, fontWeight: '600', color: appColors.text }}>{value}</Text>
                    )}
                </View>
            </View>
        )
    };

    return (
        <View style={{ flex: 1, backgroundColor: appColors.background }}>
            {/* HEADER */}
            <View style={{
                paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                borderBottomWidth: 1, borderBottomColor: appColors.border, backgroundColor: appColors.card
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={appColors.text} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '800', color: appColors.text }}>
                    {isEditing ? "Edit Schedule" : "Scheduled Ride Details"}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: isEditing ? 0 : 20 }}>
                {/* STATUS BADGE */}
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
                ) :
                    (
                        <>
                            <View style={{
                                alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
                                borderRadius: 8, backgroundColor: isDark ? 'rgba(255, 140, 0, 0.2)' : '#FFEDD5',
                                marginBottom: 25, marginTop: 20
                            }}>
                                <Text style={{ color: isDark ? '#FFA500' : '#9A3412', fontWeight: '800', fontSize: 12 }}>
                                    {rideData.trip_status.toUpperCase()}
                                </Text>
                            </View>
                            <InfoRow label="Pickup" value={pickupaddressname} icon="map-marker-outline" field="start" />
                            <InfoRow label="Destination" value={dropaddressname} icon="flag-checkered" field="destination" />

                            <View style={{ flexDirection: 'row', gap: 15 }}>
                                <View style={{ flex: 1 }}>
                                    <InfoRow label="Date" value={formatDate(editedData.scheduled_start_time)} icon="calendar" field="date" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <InfoRow label="Time" value={(new Date(editedData.scheduled_start_time)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} icon="clock-outline" field="time" />
                                </View>
                            </View>

                            <InfoRow label="Ride Type" value={editedData.ride_type} icon="car-info" field="rideType" />
                        </>
                    )}


            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: appColors.border, backgroundColor: appColors.card }}>
                {!isEditing ? (
                    <View style={{ gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => setIsEditing(true)}
                            style={{
                                backgroundColor: isDark ? appColors.iconBox : '#1E293B', height: 56, borderRadius: 16,
                                justifyContent: 'center', alignItems: 'center', flexDirection: 'row'
                            }}
                        >
                            <MaterialCommunityIcons name="pencil" size={20} color={appColors.text} style={{ marginRight: 8 }} />
                            <Text style={{ color: appColors.text, fontSize: 16, fontWeight: '700' }}>Edit Schedule</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCancelRide}
                            style={{ height: 56, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '700' }}>Cancel Ride</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ gap: 12 }}>
                        <TouchableOpacity
                            onPress={handleUpdate}
                            disabled={isLoading}
                            style={{
                                backgroundColor: appColors.primary,
                                height: 56,
                                borderRadius: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                                opacity: isLoading ? 0.5 : 1,
                            }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setEditedData({ ...rideData });
                                setIsEditing(false)
                            }}
                            style={{ height: 56, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Text style={{ color: appColors.secondaryText, fontSize: 16, fontWeight: '700' }}>Discard Changes</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    reasonSheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        color: '#1E293B',
    },
    reasonOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    reasonText: {
        fontSize: 16,
        color: '#334155',
    },
    keepBookingBtn: {
        marginTop: 20,
        backgroundColor: '#2563EB',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keepBookingText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ScheduledrideEdit;