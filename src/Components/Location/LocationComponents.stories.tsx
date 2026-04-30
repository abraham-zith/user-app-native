import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import LocationStatusBadge from './LocationStatusBadge';
import LocationErrorToast from './LocationErrorToast';
import LocationPermissionModal from './LocationPermissionModal';
import StaleLocationWarning from './StaleLocationWarning';
import CriticalLocationError from './CriticalLocationError';

export default {
  title: 'Components/Location',
};

export const StatusBadges = () => (
  <ScrollView style={styles.container}>
    <Text style={styles.header}>Location Status Badges</Text>
    <View style={styles.row}>
      <LocationStatusBadge state="live" />
      <LocationStatusBadge state="connecting" />
      <LocationStatusBadge state="stale" lastUpdated={Date.now() - 300000} />
      <LocationStatusBadge state="error" />
      <LocationStatusBadge state="manual" />
    </View>
  </ScrollView>
);

export const ErrorToast = () => (
  <View style={styles.container}>
    <LocationErrorToast 
      visible={true}
      type="error"
      message="Lost connection to GPS satellites. Retrying..."
      actionLabel="Retry"
      onAction={() => console.log('Retry clicked')}
      onDismiss={() => console.log('Dismissed')}
    />
  </View>
);

export const PermissionModal = () => (
  <LocationPermissionModal 
    visible={true}
    onManualLocation={() => console.log('Manual clicked')}
    onCancel={() => console.log('Cancel clicked')}
  />
);

export const Warnings = () => (
  <View style={styles.container}>
    <StaleLocationWarning 
      lastUpdated={Date.now() - 120000}
      onRetry={() => console.log('Retry clicked')}
    />
  </View>
);

export const CriticalError = () => (
  <CriticalLocationError 
    visible={true}
    onRetry={() => console.log('Retry clicked')}
    onManualLocation={() => console.log('Manual clicked')}
    onCancel={() => console.log('Cancel clicked')}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  header: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    color: '#1E293B',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
