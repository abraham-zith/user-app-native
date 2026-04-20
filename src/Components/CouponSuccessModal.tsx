import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useAppTheme } from '../hooks/useAppTheme';
import { hS, vS, mS } from '../lib/responsive';

const { width, height } = Dimensions.get('window');

interface CouponSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  couponCode: string;
  discountAmount: number;
}

const CouponSuccessModal: React.FC<CouponSuccessModalProps> = ({
  visible,
  onClose,
  couponCode,
  discountAmount,
}) => {
  const { colors: appColors, isDark } = useAppTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const particleY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 300 });
      particleY.value = withSequence(
        withTiming(-50, { duration: 1000, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 500 })
      );
    } else {
      scale.value = withTiming(0);
      opacity.value = withTiming(0);
    }
  }, [visible]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const Particle = ({ delay, color, shape }: { delay: number; color: string; shape: 'circle' | 'square' }) => {
    const pScale = useSharedValue(0);
    const pOpacity = useSharedValue(0);
    const pY = useSharedValue(0);
    const pX = useSharedValue(0);
    const pRotate = useSharedValue(0);

    useEffect(() => {
      if (visible) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 120;
        pScale.value = withDelay(delay, withTiming(Math.random() * 0.8 + 0.4, { duration: 200 }));
        pOpacity.value = withDelay(delay, withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 600 })
        ));
        pX.value = withDelay(delay, withTiming(Math.cos(angle) * distance, { duration: 1200, easing: Easing.out(Easing.quad) }));
        pY.value = withDelay(delay, withTiming(Math.sin(angle) * distance, { duration: 1200, easing: Easing.out(Easing.quad) }));
        pRotate.value = withDelay(delay, withTiming(Math.random() * 360, { duration: 1200 }));
      }
    }, [visible]);

    const pStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: pX.value },
        { translateY: pY.value },
        { scale: pScale.value },
        { rotate: `${pRotate.value}deg` }
      ],
      opacity: pOpacity.value,
      position: 'absolute',
      backgroundColor: color,
      width: shape === 'circle' ? 8 : 10,
      height: 8,
      borderRadius: shape === 'circle' ? 4 : 2,
    }));

    return <Animated.View style={pStyle} />;
  };

  const particleColors = ['#FCD34D', '#60A5FA', '#F87171', '#34D399', '#A78BFA', '#FB923C', '#EC4899', '#8B5CF6'];
  const particles: Array<{ delay: number; color: string; shape: 'circle' | 'square' }> = Array.from({ length: 40 }).map((_, i) => ({
    delay: Math.random() * 300,
    color: particleColors[i % particleColors.length],
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[
          styles.content, 
          animatedContentStyle,
          { 
            backgroundColor: appColors.card,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            borderWidth: isDark ? 1 : 0,
          }
        ]}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <AntDesign name="closecircle" size={mS(24)} color={isDark ? appColors.secondaryText : "#D1D5DB"} />
          </TouchableOpacity>

          <View style={styles.iconWrapper}>
            <View style={[
              styles.mainIconContainer,
              {
                backgroundColor: '#10B981',
                shadowColor: '#10B981',
                shadowOpacity: isDark ? 0.6 : 0.3,
                shadowRadius: isDark ? 20 : 8,
                elevation: isDark ? 20 : 8,
              }
            ]}>
              <MaterialCommunityIcons name="ticket-percent" size={mS(40)} color="#FFFFFF" />
            </View>
            {visible && particles.map((p, i) => (
              <Particle key={i} delay={p.delay} color={p.color} shape={p.shape} />
            ))}
          </View>

          <Text style={[styles.appliedText, { color: appColors.secondaryText }]}>'{couponCode}' applied</Text>
          <Text style={[styles.savingsTitle, { color: appColors.text }]}>₹{discountAmount} savings with this coupon</Text>
          <Text style={[styles.description, { color: isDark ? appColors.lightTextColor : '#9CA3AF' }]}>
            Enjoy your discounted ride! We're happy to have you on board.
          </Text>

          <TouchableOpacity 
            style={[
              styles.yayButton, 
              { 
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFFFF',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#F3F4F6',
              }
            ]} 
            onPress={onClose}
          >
            <Text style={styles.yayText}>YAY!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: mS(24),
    padding: mS(24),
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  closeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  mainIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 5,
  },
  appliedText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  savingsTitle: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  yayButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  yayText: {
    fontSize: mS(16),
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 1,
  },
});

export default CouponSuccessModal;
