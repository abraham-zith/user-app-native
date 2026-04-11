import { View, Platform, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Text } from "../../Components";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ServiceSelection from "./serviceSelection";
import { Trip } from "../../types/trip";
import { useDirections } from "../../hooks/useDirections";
import Config from "react-native-config";

// Import your responsive utilities
import { hS, vS, mS } from "../../lib/responsive";
import DriverSelectionPage from "./DriverSelectionPage";
import { useAppTheme } from "../../hooks/useAppTheme";

interface ExtendedScreenProps {
    screenName: string;
    TripPayload: Partial<Trip>;
    setTripPayload: React.Dispatch<React.SetStateAction<Partial<Trip>>>;
}

const GOOGLE_MAPS_APIKEY = Config.GOOGLE_API_KEY;

const SelectionPage: React.FC<ExtendedScreenProps> = ({ screenName, TripPayload, setTripPayload }) => {
    const { colors, isDark } = useAppTheme();
    const { distance, duration, calculateRoute } = useDirections(GOOGLE_MAPS_APIKEY ?? "");
    const [selectedService, setSelectedService] = useState('DRIVER_ONLY');

    useEffect(() => {
        const { pickup_lat, pickup_lng, drop_lat, drop_lng } = TripPayload;

        if (pickup_lat && pickup_lng && drop_lat && drop_lng) {
            const fetchRoute = async () => {
                const pickup = { lat: pickup_lat, lng: pickup_lng };
                const drop = { lat: drop_lat, lng: drop_lng };

                const result = await calculateRoute(pickup, drop);
                let DistanceKm = 0;
                if (distance) {
                    DistanceKm = parseFloat(distance.replace(/[^\d.]/g, ''));
                }

                if (result) {
                    setTripPayload((prev) => ({
                        ...prev,
                        distance_km: DistanceKm,
                    }));
                }
            };
            fetchRoute();
        }
    }, [TripPayload.pickup_lat, TripPayload.drop_lat, distance]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.bottomWrapper, { backgroundColor: isDark ? colors.background : "#FAFAFA" }]}>

                {/* --- TRIP DETAILS CARD --- */}
                <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                    <Text style={[styles.sectionHeader, { color: colors.secondaryText }]}>TRIP DETAILS</Text>

                    <View style={styles.rowBetween}>
                        {/* Distance Block */}
                        <View style={styles.infoBlock}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#EFF6FF' }]}>
                                <MaterialCommunityIcons name="map-marker-distance" size={mS(20)} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.mainValue, { color: colors.text }]}>{distance ? distance : '20 KM'}</Text>
                                <Text style={[styles.subLabel, { color: colors.secondaryText }]}>Distance</Text>
                            </View>
                        </View>

                        {/* Divider Line */}
                        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

                        {/* Duration Block */}
                        <View style={styles.infoBlock}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(234, 88, 12, 0.1)' : '#FFF7ED' }]}>
                                <MaterialCommunityIcons name="clock-fast" size={mS(20)} color="#EA580C" />
                            </View>
                            <View>
                                <Text style={[styles.mainValue, { color: colors.text }]}>{duration ? duration : "30 Min"}</Text>
                                <Text style={[styles.subLabel, { color: colors.secondaryText }]}>Estimated</Text>
                            </View>
                        </View>
                    </View>

                    {/* Disclaimer/Warning */}
                    <View style={[styles.disclaimerBox, { backgroundColor: isDark ? colors.background : '#F8FAFC' }]}>
                        <MaterialCommunityIcons name="information-outline" size={mS(14)} color={colors.secondaryText} />
                        <Text style={[styles.disclaimerText, { color: colors.secondaryText }]}>
                            Fare may vary based on actual traffic or route changes.
                        </Text>
                    </View>
                </View>

                {/* --- SERVICE SELECTION SHEET --- */}
                <View style={[styles.serviceSheet, { backgroundColor: colors.card }]}>
                    {/* Handle bar for the sheet - More subtle color */}
                    <View style={{
                        width: hS(40),
                        height: vS(4),
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                        borderRadius: mS(2),
                        alignSelf: 'center',
                        marginTop: vS(8),
                        marginBottom: vS(-8) // Pull content up slightly
                    }} />
                    {/* <ServiceSelection
                        screenName={screenName}
                        TripPayload={TripPayload}
                        setTripPayload={setTripPayload}
                    /> */}

                    <DriverSelectionPage
                        screenName={screenName}
                        service={selectedService}
                        TripPayload={TripPayload}
                        setTripPayload={setTripPayload}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomWrapper: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "#FAFAFA",
    },
    detailsCard: {
        paddingHorizontal: hS(16),
        marginHorizontal: hS(16),
        paddingVertical: vS(10),
        borderRadius: mS(12),
        marginTop: vS(16),
        marginBottom: vS(16),
        backgroundColor: "#FFFFFF",
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 4 }
        }),
    },
    sectionHeader: {
        fontSize: mS(10),
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: vS(8)
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    infoBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(12)
    },
    iconBox: {
        width: hS(30),
        height: hS(30),
        borderRadius: mS(12),
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainValue: {
        fontSize: mS(14),
        fontWeight: '800',
        color: '#1E293B'
    },
    subLabel: {
        fontSize: mS(10),
        color: '#64748B'
    },
    verticalDivider: {
        width: 1,
        height: vS(30),
        backgroundColor: '#E2E8F0'
    },
    disclaimerBox: {
        marginTop: vS(10),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: hS(5),
        borderRadius: mS(10)
    },
    disclaimerText: {
        fontSize: mS(10),
        color: '#64748B',
        marginLeft: hS(6),
        fontStyle: 'italic',
        flex: 1
    },
    serviceSheet: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: mS(32),
        borderTopRightRadius: mS(32),
        paddingTop: vS(8),
        flex: 1, // Allow it to fill the remaining space
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.08, shadowRadius: 15 },
            android: { elevation: 12 }
        }),
    }
});

export default SelectionPage;