import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { mS, vS, hS } from '../../lib/responsive';

interface CriticalLocationErrorProps {
  visible: boolean;
  onRetry: () => void;
  onManualLocation: () => void;
  onCancel: () => void;
}

const CriticalLocationError: React.FC<CriticalLocationErrorProps> = ({
  visible,
  onRetry,
  onManualLocation,
  onCancel,
}) => {
  const { colors, isDark } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <MaterialCommunityIcons name="alert-decagram" size={mS(40)} color="#EF4444" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Critical Sync Error</Text>
            </View>

            <Text style={[styles.description, { color: colors.secondaryText }]}>
              We haven't been able to capture your location for several minutes. Your navigation and safety sharing are currently interrupted.
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton, { backgroundColor: '#EF4444' }]} 
                onPress={onRetry}
              >
                <MaterialCommunityIcons name="refresh" size={mS(18)} color="#FFF" style={styles.btnIcon} />
                <Text style={styles.primaryButtonText}>RETRY CONNECTION</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, { borderColor: isDark ? '#475569' : '#CBD5E1' }]} 
                onPress={onManualLocation}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>SEND MANUAL LOCATION</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.textButton} onPress={onCancel}>
                <Text style={[styles.textButtonLabel, { color: colors.secondaryText }]}>Stop Sharing</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: hS(20),
  },
  safeArea: {
    width: '100%',
  },
  container: {
    borderRadius: mS(20),
    padding: mS(24),
    elevation: 25,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vS(16),
  },
  iconWrapper: {
    width: mS(60),
    height: mS(60),
    borderRadius: mS(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hS(16),
  },
  title: {
    fontSize: mS(18),
    fontWeight: '800',
    flex: 1,
  },
  description: {
    fontSize: mS(14),
    lineHeight: vS(22),
    marginBottom: vS(24),
  },
  actions: {
    width: '100%',
  },
  button: {
    width: '100%',
    height: vS(56),
    borderRadius: mS(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vS(12),
  },
  btnIcon: {
    marginRight: hS(8),
  },
  primaryButton: {
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: mS(13),
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryButton: {
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: mS(13),
    fontWeight: '700',
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: vS(8),
  },
  textButtonLabel: {
    fontSize: mS(14),
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default CriticalLocationError;
