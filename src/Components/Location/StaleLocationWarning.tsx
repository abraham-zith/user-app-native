import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { mS, vS, hS } from '../../lib/responsive';

interface StaleLocationWarningProps {
  lastUpdated: number; // timestamp
  onRetry: () => void;
}

const StaleLocationWarning: React.FC<StaleLocationWarningProps> = ({
  lastUpdated,
  onRetry,
}) => {
  const { colors, isDark } = useAppTheme();

  const getMinutesAgo = () => {
    const mins = Math.floor((Date.now() - lastUpdated) / 60000);
    return mins > 0 ? `${mins}m ago` : 'just now';
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark ? '#F59E0B' : '#FBBF24',
      }
    ]}>
      <View style={styles.content}>
        <View style={styles.iconBackground}>
          <MaterialCommunityIcons name="timer-sand-warn" size={mS(20)} color="#F59E0B" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Location Sync Stale</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Last updated {getMinutesAgo()}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: '#F59E0B' }]} 
          onPress={onRetry}
        >
          <Text style={styles.retryText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: mS(12),
    borderRadius: mS(16),
    borderWidth: 1.5,
    marginHorizontal: hS(20),
    marginTop: vS(10),
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBackground: {
    width: mS(40),
    height: mS(40),
    borderRadius: mS(12),
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: hS(12),
  },
  title: {
    fontSize: mS(14),
    fontWeight: '800',
  },
  subtitle: {
    fontSize: mS(12),
    fontWeight: '500',
    marginTop: vS(2),
  },
  retryButton: {
    paddingHorizontal: hS(14),
    paddingVertical: vS(8),
    borderRadius: mS(8),
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: mS(11),
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default StaleLocationWarning;
