import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { RootStackParamList } from '../../types/payment';
import { CheckoutScreen_Nav, RideCompletedScreen_Nav } from '../../Navigations/navigations';
// import { useGetTripMutation } from '../../service/userApi'
import { Trip } from '../../types/trip';


let TripData: Trip;
const FareSummaryScreen = ({ navigation }: ScreenProps) => {
  // const [getTrip] = useGetTripMutation()
  const route = useRoute<any>();
  const trip = route.params;
  // console.log(trip, "Farebreakdownid");

  // Assume these come from your backend after the trip ends
  const fareData = {
    total: 259,
    baseFare: 200,
    distanceFare: 420.00,
    taxes: 70.00,
    distance: '12.5km'
  };

  const proceedToPay = () => {
    ReactNativeHapticFeedback.trigger("impactMedium");
    navigation.navigate(RideCompletedScreen_Nav)
    // This moves to the Checkout screen logic we created earlier
    // navigation.navigate(CheckoutScreen_Nav, { amount: fareData.total });
  };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Trip Ended</Text>
        <Text style={styles.subTitle}>Hope you had a comfortable ride with vDrive</Text>

        <View style={styles.fareCard}>
          <Text style={styles.totalLabel}>Total Fare</Text>
          <Text style={styles.totalAmount}>₹{fareData.total.toFixed(2)}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.detailLabel}>Base Fare</Text>
            <Text style={styles.detailValue}>₹{fareData.baseFare}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.detailLabel}>Distance ({fareData.distance})</Text>
            <Text style={styles.detailValue}>₹{fareData.distanceFare}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.detailLabel}>Taxes & Fees</Text>
            <Text style={styles.detailValue}>₹{fareData.taxes}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton} onPress={proceedToPay}>
          <Text style={styles.payButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '900', color: '#000' },
  subTitle: { fontSize: 16, color: '#666', marginTop: 5 },
  fareCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 30, elevation: 2 },
  totalLabel: { fontSize: 14, color: '#888', textAlign: 'center' },
  totalAmount: { fontSize: 48, fontWeight: 'bold', color: '#000', textAlign: 'center', marginVertical: 10 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  detailLabel: { fontSize: 16, color: '#444' },
  detailValue: { fontSize: 16, fontWeight: '600', color: '#000' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE' },
  payButton: { backgroundColor: '#32a852', padding: 18, borderRadius: 12, alignItems: 'center' },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});

export default FareSummaryScreen;