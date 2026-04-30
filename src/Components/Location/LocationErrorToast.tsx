import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { mS, vS, hS } from '../../lib/responsive';

const { width } = Dimensions.get('window');

export type ToastType = 'warning' | 'error' | 'info' | 'success';

interface LocationErrorToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  autoDismiss?: boolean;
}

const LocationErrorToast: React.FC<LocationErrorToastProps> = ({
  visible,
  type,
  message,
  actionLabel,
  onAction,
  onDismiss,
  autoDismiss = true,
}) => {
  const { isDark, colors } = useAppTheme();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });

      if (autoDismiss && type !== 'error') {
        const timer = setTimeout(() => {
          hide();
        }, 4000);
        return () => clearTimeout(timer);
      }
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    translateY.value = withSpring(100, { damping: 15 }, () => {
      runOnJS(onDismiss)();
    });
    opacity.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getTypeConfig = () => {
    switch (type) {
      case 'error': return { color: '#EF4444', icon: 'alert-circle' };
      case 'warning': return { color: '#F59E0B', icon: 'alert-outline' };
      case 'success': return { color: '#10B981', icon: 'check-circle-outline' };
      default: return { color: '#3B82F6', icon: 'information-outline' };
    }
  };

  const config = getTypeConfig();

  if (!visible && opacity.value === 0) return null;

  return (
    <Animated.View style={[
      styles.container, 
      animatedStyle,
      { 
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        shadowColor: '#000',
      }
    ]}>
      <View style={[styles.indicator, { backgroundColor: config.color }]} />
      <View style={styles.content}>
        <MaterialCommunityIcons name={config.icon as any} size={mS(24)} color={config.color} />
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
            {message}
          </Text>
        </View>
        {actionLabel && (
          <TouchableOpacity onPress={onAction} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: config.color }]}>{actionLabel.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: vS(40),
    left: hS(20),
    right: hS(20),
    borderRadius: mS(12),
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    zIndex: 9999,
  },
  indicator: {
    width: hS(6),
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: mS(16),
  },
  textContainer: {
    flex: 1,
    marginLeft: hS(12),
    marginRight: hS(8),
  },
  message: {
    fontSize: mS(14),
    fontWeight: '500',
    lineHeight: vS(20),
  },
  actionButton: {
    paddingVertical: vS(6),
    paddingHorizontal: hS(8),
  },
  actionText: {
    fontSize: mS(12),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default LocationErrorToast;
