import React, { useState } from "react";
import { ImageBackground, View, StyleSheet } from "react-native";
import { Text } from "../../Components";
import { Styles } from "../../lib/styles";
import fonts from "../../constant/fonts";
import Button from "../../Components/Button";
import colors from "../../constant/colors";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DriverSelectionPage from "./DriverSelectionPage";
import { Trip } from "../../types/trip";
import { ServiceType } from "../../enums/trip.enum";

// Import responsive utilities
import { hS, vS, mS } from "../../lib/responsive";

interface ExtendedScreenProps {
    screenName: string;
    TripPayload: Partial<Trip>;
    setTripPayload: React.Dispatch<React.SetStateAction<Partial<Trip>>>;
}

const ServiceSelection: React.FC<ExtendedScreenProps> = ({ screenName, TripPayload, setTripPayload }) => {
    const [driverSlection, setDriverSelection] = useState(false);
    const [selectedService, setSelectedService] = useState('');

    const updateRide = (type: ServiceType) => {
        setTripPayload(prev => ({ ...prev, service_type: type }));
    };

    const handleServiceSelection = (service: string) => {
        if (service === 'cab') {
            setSelectedService('CAB_WITH_DRIVER');
            updateRide(ServiceType.CAB_WITH_DRIVER);
        } else if (service === 'driver') {
            setSelectedService('DRIVER_ONLY');
            updateRide(ServiceType.DRIVER_ONLY);
        }
        setDriverSelection(true);
    };

    return (
        <View style={Styles.flex}>
            {!driverSlection ? (
                <View style={styles.container}>
                    <Text style={styles.headerTitle}>Select Your Services</Text>

                    {/* CAB SERVICE CARD */}
                    <View style={styles.cardBorder}>
                        <ImageBackground
                            source={require('../../assets/png/CabService.png')}
                            resizeMode='cover'
                            style={styles.imageBackground}
                            imageStyle={{ borderRadius: mS(12) }}
                        >
                            <View style={styles.cardContent}>
                                <View>
                                    <Text style={styles.serviceTitle}>Cab</Text>
                                    <Text style={styles.serviceSub}>Your Ride, Ready Anytime</Text>
                                </View>
                                <Button
                                    onPress={() => handleServiceSelection('cab')}
                                    style={styles.actionButton}
                                >
                                    <View style={styles.btnRow}>
                                        <Text style={styles.btnText}>Book Now</Text>
                                        <MaterialIcons name="east" color={'black'} size={mS(14)} />
                                    </View>
                                </Button>
                            </View>
                        </ImageBackground>
                    </View>

                    {/* DRIVER SERVICE CARD */}
                    <View style={styles.cardBorder}>
                        <ImageBackground
                            source={require('../../assets/png/DriverService.png')}
                            resizeMode='cover'
                            style={styles.imageBackground}
                            imageStyle={{ borderRadius: mS(12) }}
                        >
                            <View style={styles.cardContent}>
                                <View>
                                    <Text style={styles.serviceTitle}>Driver</Text>
                                    <Text style={styles.serviceSub}>Your Car, Our trusted driver</Text>
                                </View>
                                <Button
                                    onPress={() => handleServiceSelection('driver')}
                                    style={styles.actionButton}
                                >
                                    <View style={styles.btnRow}>
                                        <Text style={styles.btnText}>Hire Now</Text>
                                        <MaterialIcons name="east" color={'black'} size={mS(14)} />
                                    </View>
                                </Button>
                            </View>
                        </ImageBackground>
                    </View>
                </View>
            ) : (
                <DriverSelectionPage
                    screenName={screenName}
                    service={selectedService}
                    TripPayload={TripPayload}
                    setTripPayload={setTripPayload}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: vS(10),
        marginHorizontal: hS(20),
        paddingVertical: vS(10),
    },
    headerTitle: {
        fontSize: mS(18),
        fontFamily: fonts.bold.fontFamily,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: vS(5)
    },
    cardBorder: {
        borderWidth: 1,
        borderRadius: mS(12),
        borderColor: '#E2E8F0',
        overflow: 'hidden', // Ensures ImageBackground doesn't bleed out
    },
    imageBackground: {
        padding: hS(16),
        minHeight: vS(120), // Ensures enough height for content
        justifyContent: 'center'
    },
    cardContent: {
        gap: vS(12),
    },
    serviceTitle: {
        fontSize: mS(22),
        fontWeight: 'bold',
        color: '#fff',
    },
    serviceSub: {
        color: '#fff',
        fontSize: mS(13),
        opacity: 0.9
    },
    actionButton: {
        width: hS(110), // Responsive fixed-ish width
        height: vS(34),
        backgroundColor: colors.background,
        borderRadius: mS(20),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#111'
    },
    btnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hS(5),
    },
    btnText: {
        fontSize: mS(12),
        fontFamily: fonts.light.fontFamily,
        color: '#111'
    }
});

export default ServiceSelection;