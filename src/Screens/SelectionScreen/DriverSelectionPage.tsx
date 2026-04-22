import { Modal, View, FlatList, TouchableOpacity, Platform, ToastAndroid, StyleSheet, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Text } from "../../Components";
import { Styles } from "../../lib/styles";
import { DriverIcon, ProDriverIcon } from '../../assets/svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from "../../Components/Button";
import colors from "../../constant/colors";
import fonts from "../../constant/fonts";
import { Trip } from "../../types/trip";
import { useCreateTripMutation, useGetPricingMutation } from "../../service/userApi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { BookedTripScreen_Nav, userMapTest_nav } from "../../Navigations/navigations";
import { hS, mS, vS } from "../../lib/responsive";
// import PaymentModal from '../../Components/PaymentModal';
import CouponModal from "../../Components/CouponModal";
import CouponSuccessModal from '../../Components/CouponSuccessModal';
// import { useGetActiveTripQuery } from '../../store/Api/tripApi';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSocket } from "../../Socket/SocketContext";
import { useLocation } from "../../hooks/useLocation";
import { addTripToArray, setActiveTrip } from "../../redux/tripSlice";
import { RootState } from "../../redux/store";
import { useAppTheme } from "../../hooks/useAppTheme";

interface SelectionPageProps {
    screenName: string;
    service: string;
    TripPayload: Partial<Trip>;
    setTripPayload: React.Dispatch<React.SetStateAction<Partial<Trip>>>;
}

interface OptionModal {

    id: string,
    name: string,
    Description: string,
    Price: number,
    allowance: number

}
export default function DriverSelectionPage({ screenName, service, TripPayload, setTripPayload }: SelectionPageProps) {
    const { colors: appColors, isDark } = useAppTheme();
    const navigation = useNavigation<NavigationProp<any>>();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { socket, joinTripRoom } = useSocket();
    const { getAddressFromCoords } = useLocation();
    const [createTrip] = useCreateTripMutation();
    const [getPricing] = useGetPricingMutation();
    const [visible, setVisible] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<string>("");
    const localuser = useSelector((state: RootState) => state.userSlice.user);

    // Coupon State
    const [isCouponModalVisible, setIsCouponModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: string, code: string, discount: number } | null>(null);
    const doptions = {
        "prices": [
            {
                "price": 320,
                "driver_type": "normal-driver"
            },
            {
                "price": 420,
                "driver_type": "premium-driver"
            },
            {
                "price": 520,
                "driver_type": "elite-driver"
            }
        ],
        "hotspot_id": "af1a3be0-d286-413c-9443-634a90380ce9",
        "is_hotspot": true,
        "global_price": 1000,
        "hotspot_price": 20,
        "global_multiplier": 1,
        "hotspot_multiplier": 1
    }

    const options = [
        { id: '1', name: 'Classic', Description: 'Reliable Drivers at the Best Price', Price: 200.0, allowance: 59.95 },
        { id: '2', name: 'Pro', Description: 'Expert Drivers for Premium Rides', Price: 300.00, allowance: 59.95 },
        { id: '3', name: 'Premium', Description: 'Expert Drivers for Premium Rides', Price: 450.00, allowance: 59.95 },
    ];
    const [modalData, setModalData] = useState<OptionModal>()
    const selectedOptionData = options.find(option => option.id === selectedDriver);
    // Default to the first option's price if nothing is selected yet
    const baseFare = selectedOptionData ? selectedOptionData.Price : options[0].Price;
    // const [selectedPrice, setSelectedPrice] = useState(parseFloat(options[0].Price.replace('₹', '')));
    // const [allowancePrice, setAllowancePrice] = useState(parseFloat(options[0].allowance.replace('₹', '')));
    const [updatedTip, setUpdatedTip] = useState<any>();


    const tips = ['+20', '+30', '+40'];
    const CashOffer = [
        { name: 'Cash', iconName: 'currency-inr' },
        { name: 'Offers', iconName: 'brightness-percent' },
    ];

    // const handleAddTip = (data: any) => {
    //     const tipValue = parseFloat(data.replace('+', '')); // convert +20 → 20

    //     const newTip = allowancePrice + tipValue;
    //     const newPrice = selectedPrice + tipValue;
    //     const updateTip = allowancePrice + tipValue;
    //     setUpdatedTip(updateTip);
    //     setSelectedPrice(newPrice);

    //     console.log(data, allowancePrice, updatedTip, newPrice, "tip");
    //     console.log("Updated Price:", newPrice);

    // }
    const handleAddTip = (tipStr: string) => {
        if (!selectedDriver) {
            Alert.alert('Selection Required', 'Please select a driver before adding a tip.');
            return;
        }

        const tipValue = parseFloat(tipStr.replace('+', ''));
        // Toggle tip: if clicking same tip, remove it (set to 0)
        const newTipValue = updatedTip === tipValue ? 0 : tipValue;
        setUpdatedTip(newTipValue);

        const currentOption = options.find(o => o.id === selectedDriver);

        if (currentOption) {
            const discount = appliedCoupon?.discount || 0;
            const allowance = currentOption.allowance + newTipValue;
            const totalFare = currentOption.Price + allowance - discount;

            setTripPayload((prev: any) => ({
                ...prev,
                driver_allowance: allowance,
                total_fare: Math.max(0, totalFare)
            }));
        }
    };

    const handleBookRide = async () => {
        try {
            const finalPayload = {
                ...TripPayload,
                coupon_code: appliedCoupon?.code,
                discount: appliedCoupon?.discount || 0,
                applied_coupon_id: appliedCoupon?.id
            };
            console.log(finalPayload, "finalPayload");
            const result = await createTrip(finalPayload).unwrap();
            console.log(result, "result");
            if (result.success) {
                if (Platform.OS === 'android') {
                    ToastAndroid.show(result.message, ToastAndroid.SHORT);
                }

                // ✅ Optimistic Redux update for immediate UI response
                dispatch(addTripToArray(result.data));
                dispatch(setActiveTrip(result.data));

                joinTripRoom(result.data.trip_id, result.data.user_id || 'USER', 'USER');
                navigation.navigate(BookedTripScreen_Nav, result.data);
            }
        } catch (error: any) {
            if (error.data && error.data.message) {
                //console.log(error.data, "error");
                Alert.alert('Booking Failed!!!', error.data.message);
            } else {
                Alert.alert('Booking Failed!!!');
            }
            //console.log(error, "error");
        }
    };

    const handleApplyCoupon = (coupon: any, discountAmount: number) => {
        setAppliedCoupon({
            id: coupon.id,
            code: coupon.code,
            discount: discountAmount
        });

        if (selectedDriver) {
            const currentOption = options.find(o => o.id === selectedDriver);
            if (currentOption) {
                const totalFare = currentOption.Price + currentOption.allowance + (updatedTip || 0) - discountAmount;
                setTripPayload((prev: any) => ({
                    ...prev,
                    discount: discountAmount,
                    total_fare: Math.max(0, totalFare),
                    applied_coupon_id: coupon.id
                }));
            }
        }

        // Close selection modal and show success modal
        setIsCouponModalVisible(false);
        setTimeout(() => {
            setIsSuccessModalVisible(true);
        }, 500); // Small delay for smooth transition
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        if (selectedDriver) {
            const currentOption = options.find(o => o.id === selectedDriver);
            if (currentOption) {
                const totalFare = currentOption.Price + currentOption.allowance + (updatedTip || 0);
                setTripPayload((prev: any) => ({
                    ...prev,
                    discount: 0,
                    total_fare: totalFare,
                    applied_coupon_id: undefined,
                    coupon_code: undefined
                }));
            }
        }
    };
    // const parseScheduledDate = (dateString: any) => {
    //     if (!dateString) return { day: null, time: null };

    //     const date = new Date(dateString);

    //     if (isNaN(date.getTime())) {
    //         console.error("Invalid Date:", dateString);
    //         return { day: null, time: null };
    //     }

    //     // Day (YYYY-MM-DD)
    //     const day = date.toISOString().slice(0, 10);

    //     // Time (HH:mm)
    //     const hours = date.getHours().toString().padStart(2, "0");
    //     const minutes = date.getMinutes().toString().padStart(2, "0");
    //     const time = `${hours}:${minutes}`;

    //     return { day, time };
    // };

    const parseScheduledDate = (dateString: any) => {
        if (!dateString) return { day: null, time: null };

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            // console.error("Invalid Date:", dateString);
            Alert.alert('Invalid Date!!!', 'Try Again Later');
            return { day: null, time: null };
        }

        // Weekday name: Monday, Tuesday, etc.
        const days = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday"
        ];

        const day = days[date.getDay()];

        // Time (HH:mm)
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const time = `${hours}:${minutes}`;

        return { day, time };
    };
    useEffect(() => {
        const loadData = async () => {
            const fromAddress = await getAddressFromCoords(
                Number(TripPayload.pickup_lat),
                Number(TripPayload.pickup_lng)
            );

            const toAddress = await getAddressFromCoords(
                Number(TripPayload.drop_lat),
                Number(TripPayload.drop_lng)
            );
            const { day, time } = parseScheduledDate(TripPayload.scheduled_start_time);
            const payload = {
                distance_km: TripPayload.distance_km,
                duration_min: 60,
                day,
                time,
                from_area: fromAddress?.area,
                from_district: fromAddress?.district,
                to_area: toAddress?.area,
                to_district: toAddress?.district,
            };

            const result = await getPricing(payload).unwrap();
        };

        loadData();
    }, [TripPayload]);

    return (
        <View style={[styles.mainContainer, {
            marginHorizontal: insets.left,
            paddingBottom: insets.bottom,
            backgroundColor: appColors.background
        }]}>
            {/* --- LIST SECTION --- */}
            <View style={styles.listSection}>
                <Text style={[styles.headerTitle, { color: appColors.text, borderBottomColor: appColors.border }]}>Choose a Driver</Text>

                <FlatList
                    data={options}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    style={styles.flatListStyle}
                    contentContainerStyle={styles.flatListContent}
                    renderItem={({ item }) => {
                        const isSelected = selectedDriver === item.id;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.driverCard,
                                    { backgroundColor: appColors.card, borderColor: appColors.border },
                                    isSelected && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderColor: appColors.primary, borderWidth: 1.5 }
                                ]}
                                onPress={() => {
                                    setSelectedDriver(item.id);
                                    const discount = appliedCoupon?.discount || 0;
                                    const totalFare = item.Price + item.allowance + (updatedTip || 0) - discount;
                                    setTripPayload((prev) => ({
                                        ...prev,
                                        driver_allowance: item.allowance,
                                        base_fare: item.Price,
                                        discount: discount,
                                        total_fare: Math.max(0, totalFare),
                                        applied_coupon_id: appliedCoupon?.id
                                    }));
                                }}
                            >
                                <View style={[styles.driverIconContainer, { backgroundColor: isDark ? appColors.background : '#F8FAFC' }]}>
                                    {item.name === 'Pro' ? <ProDriverIcon width={mS(30)} height={mS(30)} /> : <DriverIcon width={mS(30)} height={mS(30)} />}
                                </View>

                                <View style={styles.driverInfoContainer}>
                                    <View style={styles.rowBetween}>
                                        <Text style={[styles.driverLabel, { color: appColors.text }]}>
                                            DriveV <Text style={{ color: item.name === 'Classic' ? (isDark ? appColors.primary : '#152D5E') : '#185BE5' }}>{item.name}</Text>
                                        </Text>
                                        <Text style={[styles.priceLabel, { color: appColors.text }]}>₹{(
                                            item.Price +
                                            item.allowance +
                                            (selectedDriver === item.id ? (updatedTip || 0) : 0) -
                                            (selectedDriver === item.id ? (appliedCoupon?.discount || 0) : 0)
                                        ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                    </View>
                                    {selectedDriver === item.id && appliedCoupon && (
                                        <Text style={{ fontSize: mS(12), color: colors.primary, fontWeight: '700', textAlign: 'right' }}>
                                            Coupon Applied: -₹{appliedCoupon.discount.toFixed(2)}
                                        </Text>
                                    )}

                                    <View style={styles.rowBetween}>
                                        <Text style={[styles.descText, { color: appColors.secondaryText }]} numberOfLines={2}>{item.Description}</Text>
                                        <TouchableOpacity style={[styles.allowanceBadge, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.1)' : '#F0FDF4' }]} onPress={() => {
                                            setVisible(true)
                                            setModalData(item)
                                        }}>
                                            <MaterialCommunityIcons name="check-circle" color={'#29AE46'} size={mS(14)} />
                                            <Text style={styles.allowanceText}> Allowance</Text>
                                            <MaterialCommunityIcons name="information-outline" color={'#29AE46'} size={mS(14)} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* --- FOOTER SECTION (STAYS AT BOTTOM) --- */}
            <View style={[styles.footerContainer, { backgroundColor: appColors.card, borderColor: appColors.border, borderTopWidth: isDark ? 1 : 0 }]}>
                {/* Tip Section */}
                <View style={styles.footerRow}>
                    <Text style={[styles.footerLabel, { color: appColors.text }]}>Add a Tip</Text>
                    <View style={styles.chipGroup}>
                        {tips.map((tip, index) => {
                            const tipValue = parseFloat(tip.replace('+', ''));
                            const isTipSelected = updatedTip === tipValue;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.tipChip,
                                        {
                                            backgroundColor: isTipSelected
                                                ? (isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF')
                                                : (isDark ? appColors.background : '#F8FAFC'),
                                            borderColor: isTipSelected ? appColors.primary : appColors.border,
                                            borderWidth: isTipSelected ? 1.5 : 1
                                        }
                                    ]}
                                    onPress={() => handleAddTip(tip)}
                                >
                                    <Text style={[styles.tipText, { color: isTipSelected ? appColors.primary : appColors.secondaryText }]}>{tip}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.footerRow}>
                    {CashOffer.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.paymentMethod,
                                {
                                    backgroundColor: isDark ? appColors.background : '#F8FAFC',
                                    borderColor: item.name === 'Offers' && appliedCoupon ? colors.primary : 'transparent',
                                    borderWidth: item.name === 'Offers' && appliedCoupon ? 1 : 0
                                }
                            ]}
                            onPress={() => {
                                if (item.name === 'Offers') {
                                    setIsCouponModalVisible(true);
                                }
                            }}
                        >
                            <Text style={[
                                styles.methodLabel,
                                { color: item.name === 'Offers' && appliedCoupon ? colors.primary : appColors.text }
                            ]}>
                                {item.name === 'Offers' && appliedCoupon ? appliedCoupon.code : item.name}
                            </Text>
                            <MaterialCommunityIcons
                                name={item.name === 'Offers' && appliedCoupon ? "tag-text" : item.iconName}
                                size={mS(18)}
                                color={item.name === 'Offers' && appliedCoupon ? colors.primary : appColors.secondaryText}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Action Button */}
                <Button
                    disabled={!selectedDriver}
                    onPress={handleBookRide}
                    style={[styles.bookBtn, { opacity: !selectedDriver ? 0.6 : 1 }]}
                >
                    <Text style={styles.bookBtnText}>Book a Ride</Text>
                </Button>
            </View>

            {/* --- ALLOWANCE MODAL --- */}
            <Modal statusBarTranslucent navigationBarTranslucent transparent animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                    <View style={[styles.modalContent, { backgroundColor: appColors.card, borderColor: appColors.border, borderWidth: isDark ? 1 : 0 }]}>
                        <View style={styles.rowBetween}>
                            <Text style={[styles.modalTitle, { color: appColors.text }]}>Allowance Detail {updatedTip ? updatedTip : "₹59.95"}</Text>
                            <MaterialCommunityIcons name="close" size={mS(22)} color={appColors.text} onPress={() => setVisible(false)} />
                        </View>
                        <Text style={[styles.modalBody, { color: appColors.secondaryText }]}>
                            Cab Ride cost (₹{modalData?.Price.toFixed(2)}) + Allowance (₹{(modalData?.allowance + updatedTip || 59.95).toFixed(2)})
                            {"\n"}(driver’s return travel to ensure fair pricing).
                        </Text>
                    </View>
                </View>
            </Modal>

            <CouponModal
                visible={isCouponModalVisible}
                onClose={() => setIsCouponModalVisible(false)}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
                rideAmount={TripPayload.total_fare || 0}
                currentCouponId={appliedCoupon?.id}
                userId={TripPayload.user_id || localuser?.id}
            />

            <CouponSuccessModal
                visible={isSuccessModalVisible}
                onClose={() => setIsSuccessModalVisible(false)}
                couponCode={appliedCoupon?.code || ""}
                discountAmount={appliedCoupon?.discount || 0}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    listSection: {
        flex: 1,
        paddingHorizontal: hS(20),
    },
    flatListStyle: {
        flex: 1,
        paddingVertical: vS(5),
    },
    flatListContent: {
        paddingBottom: vS(20),
    },
    headerTitle: {
        textAlign: 'center',
        paddingVertical: vS(12),
        fontSize: mS(18),
        fontWeight: "800",
        color: '#1E293B',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    driverCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: vS(10),
        paddingHorizontal: hS(10),
        borderRadius: mS(16),
        borderWidth: 1,
        borderColor: "#F1F5F9",
        marginBottom: vS(12),
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 }
        })
    },
    selectedCard: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
        borderWidth: 1.5,
    },
    driverIconContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: mS(12),
        width: hS(54),
        height: hS(54),
        justifyContent: 'center',
        alignItems: 'center'
    },
    driverInfoContainer: {
        flex: 1,
        marginLeft: hS(12),
        gap: vS(2)
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    driverLabel: {
        fontSize: mS(15),
        fontWeight: '700',
        color: '#334155'
    },
    priceLabel: {
        fontSize: mS(16),
        fontWeight: '800',
        color: '#1E293B'
    },
    descText: {
        fontSize: mS(11),
        color: '#64748B',
        width: '65%'
    },
    allowanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: hS(6),
        paddingVertical: vS(2),
        borderRadius: mS(6),
        gap: hS(2)
    },
    allowanceText: {
        fontSize: mS(10),
        color: '#16A34A',
        fontWeight: '700'
    },

    footerContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: hS(20),
        paddingTop: vS(12),
        paddingBottom: Platform.OS === 'ios' ? vS(24) : vS(14),
        borderTopWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.03, shadowRadius: 10 },
            android: { elevation: 10 }
        })
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vS(12),
        gap: hS(12)
    },
    footerLabel: {
        fontSize: mS(14),
        fontWeight: '700',
        color: '#475569'
    },
    chipGroup: {
        flexDirection: 'row',
        gap: hS(10)
    },
    tipChip: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: mS(20),
        paddingHorizontal: hS(14),
        paddingVertical: vS(6)
    },
    tipText: {
        fontSize: mS(13),
        fontWeight: '700',
        color: '#2563EB'
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: mS(12),
        paddingHorizontal: hS(12),
        paddingVertical: vS(8),
        marginRight: hS(10),
        gap: hS(8)
    },
    methodLabel: {
        fontSize: mS(13),
        color: '#1E293B',
        fontWeight: '700'
    },
    bookBtn: {
        height: vS(50),
        borderRadius: mS(14),
        backgroundColor: colors.button,
        marginTop: vS(5),
    },
    bookBtnText: {
        color: '#FFFFFF',
        fontSize: mS(16),
        fontWeight: '800'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalContent: {
        width: "85%",
        backgroundColor: "white",
        padding: hS(24),
        borderRadius: mS(20),
        gap: vS(12)
    },
    modalTitle: {
        fontSize: mS(18),
        fontWeight: "800",
        color: '#1E293B'
    },
    modalBody: {
        fontSize: mS(14),
        lineHeight: mS(22),
        color: '#475569'
    }
});