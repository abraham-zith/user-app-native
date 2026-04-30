import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { mS, vS, hS } from '../../lib/responsive';

export type BadgeState = 'live' | 'connecting' | 'stale' | 'error' | 'manual';

interface LocationStatusBadgeProps {
  state: BadgeState;
  lastUpdated?: number; // timestamp
}

const LocationStatusBadge: React.FC<LocationStatusBadgeProps> = ({ state, lastUpdated }) => {
  const { colors, isDark } = useAppTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state === 'live') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = 1;
    }
  }, [state]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: state === 'live' ? withRepeat(withTiming(0.6, { duration: 800 }), -1, true) : 1,
  }));

  const getStatusConfig = () => {
    switch (state) {
      case 'live':
        return { label: 'Live', color: '#10B981', icon: 'circle' };
      case 'connecting':
        return { label: 'Connecting', color: '#F59E0B', icon: 'loading' };
      case 'stale':
        return { label: 'Stale', color: '#F97316', icon: 'clock-outline' };
      case 'error':
        return { label: 'Error', color: '#EF4444', icon: 'close-circle-outline' };
      case 'manual':
        return { label: 'Manual', color: '#3B82F6', icon: 'map-marker' };
      default:
        return { label: 'Offline', color: '#6B7280', icon: 'circle' };
    }
  };

  const config = getStatusConfig();

  const renderStaleTime = () => {
    if (state === 'stale' && lastUpdated) {
      const minutes = Math.floor((Date.now() - lastUpdated) / 60000);
      return ` (${minutes}m ago)`;
    }
    return '';
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      }
    ]}>
      <View style={styles.content}>
        {state === 'live' ? (
          <Animated.View style={[styles.dot, { backgroundColor: config.color }, animatedDotStyle]} />
        ) : (
          <MaterialCommunityIcons 
            name={config.icon as any} 
            size={mS(14)} 
            color={config.color} 
            style={state === 'connecting' ? styles.spinning : null} 
          />
        )}
        <Text style={[styles.label, { color: colors.text }]}>
          {config.label}
          <Text style={[styles.time, { color: colors.secondaryText }]}>
            {renderStaleTime()}
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: hS(12),
    paddingVertical: vS(6),
    borderRadius: mS(20),
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: mS(8),
    height: mS(8),
    borderRadius: mS(4),
    marginRight: hS(8),
  },
  label: {
    fontSize: mS(12),
    fontWeight: '700',
    marginLeft: hS(4),
  },
  time: {
    fontSize: mS(10),
    fontWeight: '400',
  },
  spinning: {
    // Add rotation logic if needed, but for simplicity we'll just show the icon
  }
});

export default LocationStatusBadge;
