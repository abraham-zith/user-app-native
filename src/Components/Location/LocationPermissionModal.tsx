import React from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  SafeAreaView,
  Linking,
  Platform
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { mS, vS, hS } from '../../lib/responsive';

interface LocationPermissionModalProps {
  visible: boolean;
  onManualLocation: () => void;
  onCancel: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  visible,
  onManualLocation,
  onCancel,
}) => {
  const { colors, isDark } = useAppTheme();

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <MaterialCommunityIcons name="map-marker-radius" size={mS(50)} color="#3B82F6" />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>📍 Location Permission Required</Text>
            
            <Text style={[styles.description, { color: colors.secondaryText }]}>
              We need your location to connect you with nearby drivers and ensure accurate pick-ups. Without this, sharing your journey becomes difficult.
            </Text>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton, { backgroundColor: '#3B82F6' }]}
                onPress={handleOpenSettings}
              >
                <Text style={styles.primaryButtonText}>ENABLE IN SETTINGS</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, { borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                onPress={onManualLocation}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>USE MANUAL LOCATION</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancel}
              >
                <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: hS(20),
  },
  safeArea: {
    width: '100%',
  },
  container: {
    borderRadius: mS(24),
    padding: mS(24),
    alignItems: 'center',
    elevation: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  iconWrapper: {
    width: mS(100),
    height: mS(100),
    borderRadius: mS(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vS(20),
  },
  title: {
    fontSize: mS(20),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: vS(12),
  },
  description: {
    fontSize: mS(15),
    textAlign: 'center',
    lineHeight: vS(22),
    marginBottom: vS(30),
    paddingHorizontal: hS(10),
  },
  footer: {
    width: '100%',
  },
  button: {
    width: '100%',
    height: vS(56),
    borderRadius: mS(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vS(12),
  },
  primaryButton: {
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: mS(14),
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: mS(14),
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: vS(8),
  },
  cancelButtonText: {
    fontSize: mS(14),
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default LocationPermissionModal;
