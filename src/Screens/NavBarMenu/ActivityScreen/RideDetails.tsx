import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    ScrollView
} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useAppTheme } from "../../../hooks/useAppTheme";

// Internal Components & Constants
import { Text } from "../../../Components";
import { Styles } from "../../../lib/styles";
import colors from "../../../constant/colors";
import formatDate from "../../../Components/FormatDate";
import generateInvoicePDF from "../../Invoice/GenerateInvoice";
import { RootState } from "../../../redux/store";
import { hS, mS, vS } from "../../../lib/responsive";
import { HelpContactScreen_Nav } from "../../../Navigations/navigations";

// Responsive Scaling Utils
// Assuming these are your utility names: hS (Horizontal), vS (Vertical), mS (Moderate)


const RideDetails: React.FC<any> = () => {
    const { colors: appColors, isDark } = useAppTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { rideData } = route.params;
    // Redux State
    const localuser = useSelector((state: RootState) => state?.userSlice?.user);

    // Component State
    const [open, setIsOpen] = useState(true);
    const [SummaryOpen, setSummaryOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Address Parsing
    const pickupaddressname = rideData?.pickup_address?.split(',')[0];
    const pickupaddressDetail = rideData?.pickup_address?.substring(rideData.pickup_address.indexOf(',') + 1).trim();
    const dropaddressname = rideData?.drop_address?.split(',')[0];
    const dropaddressDetail = rideData?.drop_address?.substring(rideData.drop_address.indexOf(',') + 1).trim();

    const handleInvoiceAction = useCallback((action: 'email' | 'display') => {
        // Now passing localuser directly to the generator function
        generateInvoicePDF(
            navigation,
            action,
            setIsLoading,
            rideData,
            localuser
        );
    }, [navigation, rideData, localuser]);

    return (
        <View style={[styles.container, {
            paddingVertical: vS(20),
            paddingHorizontal: hS(20),
            backgroundColor: isDark ? appColors.background : '#f6f9fe'
        }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={mS(25)}
                        onPress={() => navigation.goBack()}
                        color={appColors.text}
                    />
                    <Text style={[styles.headerTitle, { color: appColors.text }]}>Details</Text>
                </View>

                {/* Main Card */}
                <View style={[styles.mainCard, { backgroundColor: appColors.card, shadowColor: isDark ? '#000' : '#000' }]}>
                    <View style={styles.cardPadding}>
                        <View style={styles.rowBetween}>
                            <View>
                                <Text style={[styles.rideTypeTitle, { color: appColors.text }]}>Cab Ride</Text>
                                <Text style={[styles.dateTimeText, { color: appColors.secondaryText }]}>
                                    {formatDate(rideData.scheduled_start_time)}{" \u2022 "}
                                    {rideData.scheduled_start_time ?
                                        new Date(rideData.scheduled_start_time).toLocaleTimeString([], {
                                            hour: '2-digit', minute: '2-digit', hour12: true
                                        }) : 'N/A'}
                                </Text>
                                <Text style={[styles.fareText, { color: appColors.text }]}>
                                    <Text style={[
                                        { fontWeight: 'bold', color: appColors.text },
                                        rideData.trip_status === 'CANCELLED' && styles.strikethrough
                                    ]}>
                                        ₹{Number(rideData.total_fare.replace('₹', ''))}
                                    </Text>
                                    <Text style={[
                                        rideData.trip_status === 'CANCELLED' && styles.strikethrough,
                                        { color: appColors.secondaryText }
                                    ]}>
                                        (.est)
                                    </Text>
                                </Text>
                            </View>
                            <View style={styles.statusContainer}>
                                <MaterialCommunityIcons name="car" size={mS(25)} color={appColors.text} />
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: rideData.trip_status === 'COMPLETED' ? (isDark ? 'rgba(36, 123, 78, 0.2)' : '#E5FBF4') : (isDark ? 'rgba(147, 22, 6, 0.2)' : '#f8b7b7') }
                                ]}>
                                    <MaterialCommunityIcons
                                        name={rideData.trip_status === 'COMPLETED' ? "check" : "close"}
                                        size={mS(14)}
                                        color={rideData.trip_status === 'COMPLETED' ? (isDark ? '#4ADE80' : '#247b4e') : (isDark ? '#FCA5A5' : '#931606')}
                                    />
                                    <Text style={[
                                        styles.statusText,
                                        { color: rideData.trip_status === 'COMPLETED' ? (isDark ? '#4ADE80' : '#247b4e') : (isDark ? '#FCA5A5' : '#931606') }
                                    ]}>
                                        {rideData.trip_status}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.rowBetween, { marginTop: vS(20) }]}>
                            <Text style={[styles.sectionLabel, { color: appColors.secondaryText }]}>Address details</Text>
                            <MaterialCommunityIcons
                                name={open ? "chevron-up" : "chevron-down"}
                                size={mS(25)}
                                onPress={() => setIsOpen(!open)}
                                color={appColors.secondaryText}
                            />
                        </View>

                        {open && (
                            <View style={styles.addressSection}>
                                <Text style={[styles.rideIdText, { color: appColors.secondaryText }]}>Ride ID #{rideData.trip_code}</Text>
                                <View style={styles.addressRow}>
                                    <View style={styles.timelineContainer}>
                                        <MaterialCommunityIcons name="record-circle" size={mS(20)} color={'#247b4e'} />
                                        <View style={[styles.timelineDottedLine, { borderColor: appColors.border }]} />
                                        <MaterialCommunityIcons name="map-marker-circle" size={mS(20)} color={'#931606'} />
                                    </View>
                                    <View style={styles.addressTextWrapper}>
                                        <View>
                                            <Text style={[styles.addressName, { color: appColors.text }]}>{pickupaddressname}</Text>
                                            <Text style={[styles.addressDetail, { color: appColors.secondaryText }]}>{pickupaddressDetail}</Text>
                                        </View>
                                        <View style={{ marginTop: vS(15) }}>
                                            <Text style={[styles.addressName, { color: appColors.text }]}>{dropaddressname}</Text>
                                            <Text style={[styles.addressDetail, { color: appColors.secondaryText }]}>{dropaddressDetail}</Text>
                                        </View>
                                        <Text style={[styles.estStats, { color: appColors.secondaryText }]}>19.8 mins {'.'} 8.1 kms(.est)</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={[styles.helpButton, { backgroundColor: isDark ? appColors.iconBox : '#dbecfe' }]} onPress={() => navigation.navigate(HelpContactScreen_Nav)}>
                        <View style={styles.rowCenter}>
                            <MaterialCommunityIcons name="headphones-box" size={mS(35)} color={appColors.primary} />
                            <View style={{ marginLeft: hS(10) }}>
                                <Text style={[styles.boldText, { color: appColors.text }]}>Need help?</Text>
                                <Text style={[styles.smallText, { color: appColors.secondaryText }]}>We're a tap away</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={mS(20)} color={appColors.secondaryText} />
                    </TouchableOpacity>
                </View>

                {/* Ride Summary Section */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryHeader}>
                        <MaterialCommunityIcons name="note-text-outline" size={mS(25)} color={appColors.text} />
                        <Text style={[styles.summaryTitle, { color: appColors.text }]}>RIDE SUMMARY</Text>
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
                        <TouchableOpacity
                            onPress={() => setSummaryOpen(!SummaryOpen)}
                            style={styles.summaryFareRow}
                        >
                            <Text style={[styles.boldText, { color: appColors.text }]}>Suggested Fare</Text>
                            <View style={styles.rowCenter}>
                                <Text style={[styles.boldText, { color: appColors.text }]}>
                                    ₹{(Number(rideData.base_fare) + Number(rideData.driver_allowance)).toFixed(1)}
                                </Text>
                                <MaterialCommunityIcons
                                    name={SummaryOpen ? "chevron-up" : "chevron-down"}
                                    size={mS(25)}
                                    color={appColors.secondaryText}
                                />
                            </View>
                        </TouchableOpacity>

                        {SummaryOpen && (
                            <View style={[styles.summaryDetail, { borderTopColor: appColors.border }]}>
                                <Text style={[styles.smallLabel, { color: appColors.secondaryText }]}>Total Fare</Text>
                                <Text style={[styles.fareBreakdown, { color: appColors.secondaryText }]}>
                                    {rideData.base_fare} + Driver allowance({rideData.driver_allowance})
                                </Text>
                            </View>
                        )}

                        <View style={[styles.actionRow, { borderTopColor: appColors.border }]}>
                            <TouchableOpacity
                                style={[styles.actionButton,
                                rideData.trip_status === 'CANCELLED' && { opacity: 0.5 }
                                ]}
                                disabled={rideData.trip_status === 'CANCELLED'}
                                onPress={() => handleInvoiceAction('email')}
                            >
                                <MaterialCommunityIcons name="email-outline" color={appColors.primary} size={mS(25)} />
                                <Text style={styles.actionText}>Email Receipt</Text>
                            </TouchableOpacity>

                            <View style={[styles.verticalDivider, { backgroundColor: appColors.border }]} />

                            <TouchableOpacity
                                style={[styles.actionButton,
                                rideData.trip_status === 'CANCELLED' && { opacity: 0.5 }
                                ]}
                                disabled={rideData.trip_status === 'CANCELLED'}
                                onPress={() => handleInvoiceAction('display')}
                            >
                                <Text style={styles.actionText}>Invoice</Text>
                                <MaterialCommunityIcons name="download-circle" color={appColors.primary} size={mS(20)} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Footer Disclaimer */}
                <View style={styles.disclaimerContainer}>
                    <MaterialCommunityIcons name="information-outline" size={mS(20)} color={appColors.secondaryText} />
                    <Text style={[styles.disclaimerText, { color: appColors.secondaryText }]}>
                        VDrive serves solely as a facilitator between you and independent Captains. The fare
                        displayed is an estimate; the final fare is subject to mutual agreement. A tax invoice
                        will not be provided for this trip. Please refer to the T&Cs for further details.
                    </Text>
                </View>

            </ScrollView>

            {/* Loading Modal */}
            <Modal statusBarTranslucent navigationBarTranslucent transparent visible={isLoading} animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.activityWrapper}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f9fe',
    },
    scrollContent: {
        paddingHorizontal: hS(8),
        paddingVertical: vS(10),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: vS(15),
    },
    headerTitle: {
        fontSize: mS(20),
        fontWeight: 'bold',
        marginLeft: hS(10),
    },
    mainCard: {
        backgroundColor: colors.background,
        borderRadius: mS(12),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: vS(2) },
        shadowOpacity: 0.2,
        shadowRadius: mS(4),
        overflow: 'hidden',
    },
    cardPadding: {
        padding: mS(15),
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rideTypeTitle: {
        fontSize: mS(18),
        fontWeight: 'bold',
    },
    dateTimeText: {
        fontSize: mS(13),
        color: '#687487',
        marginTop: vS(2),
    },
    fareText: {
        fontSize: mS(14),
        marginTop: vS(2),
    },
    strikethrough: {
        textDecorationLine: 'line-through',
        color: '#94A3B8', // Optional: Dim the color to light grey for better UX
    },
    statusContainer: {
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hS(8),
        paddingVertical: vS(2),
        borderRadius: mS(6),
        marginTop: vS(5),
    },
    statusText: {
        fontSize: mS(12),
        fontWeight: 'bold',
        marginLeft: hS(4),
    },
    sectionLabel: {
        fontSize: mS(14),
        color: '#687487',
    },
    addressSection: {
        marginTop: vS(10),
    },
    rideIdText: {
        fontSize: mS(12),
        color: '#687487',
        marginBottom: vS(10),
    },
    addressRow: {
        flexDirection: 'row',
    },
    timelineContainer: {
        alignItems: 'center',
        marginRight: hS(10),
    },
    timelineDottedLine: {
        width: 1,
        height: vS(30),
        borderStyle: 'dotted',
        borderWidth: 1,
        borderColor: '#687487',
        marginVertical: vS(2),
    },
    addressTextWrapper: {
        flex: 1,
    },
    addressName: {
        fontSize: mS(14),
        fontWeight: 'bold',
    },
    addressDetail: {
        fontSize: mS(12),
        color: '#687487',
    },
    estStats: {
        fontSize: mS(12),
        color: '#687487',
        marginTop: vS(10),
    },
    helpButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#dbecfe',
        padding: mS(12),
    },
    summarySection: {
        marginVertical: vS(20),
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vS(10),
    },
    summaryTitle: {
        fontSize: mS(15),
        fontWeight: 'bold',
        marginLeft: hS(8),
    },
    summaryCard: {
        backgroundColor: colors.background,
        borderRadius: mS(12),
        borderWidth: 0.5,
        borderColor: '#ddd',
        elevation: 2,
    },
    summaryFareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: mS(15),
    },
    summaryDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: mS(12),
        marginHorizontal: hS(10),
        borderTopWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#ccc',
    },
    actionRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderColor: '#ccc',
        paddingVertical: vS(10),
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: mS(14),
        fontWeight: 'bold',
        color: '#2479dd',
        marginHorizontal: hS(5),
    },
    verticalDivider: {
        width: 1,
        height: '90%',
        backgroundColor: '#ccc',
    },
    disclaimerContainer: {
        flexDirection: 'row',
        paddingBottom: vS(30),
    },
    disclaimerText: {
        fontSize: mS(11),
        color: '#687487',
        flex: 1,
        marginLeft: hS(10),
    },
    boldText: { fontWeight: 'bold', fontSize: mS(14) },
    smallText: { fontSize: mS(12), color: '#555' },
    smallLabel: { fontSize: mS(12), color: '#687487' },
    fareBreakdown: { fontSize: mS(11), color: '#687487' },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityWrapper: {
        backgroundColor: '#333',
        padding: mS(20),
        borderRadius: mS(10),
        alignItems: 'center',
    },
    loadingText: {
        marginTop: vS(10),
        fontSize: mS(14),
        color: '#fff',
    },
});


export default RideDetails;