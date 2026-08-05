import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { hS, vS, mS } from '../../lib/responsive';
import colors from '../../constant/colors';
import { WalletScreen_Nav } from '../../Navigations/navigations';

const WalletSuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { colors: appColors, isDark } = useAppTheme();

  const { amount, transactionId, orderId, date } = route.params || {};

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const formattedDate = date ? new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '';

  return (
    <View style={[styles.container, { backgroundColor: appColors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />

      <View style={styles.inner}>
        {/* Success Circle */}
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.outerRing}>
            <View style={styles.innerCircle}>
              <MaterialCommunityIcons name="check-bold" size={mS(48)} color="#FFF" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={[styles.successTitle, { color: appColors.text }]}>Money Added!</Text>
          <Text style={[styles.successAmount, { color: isDark ? '#60A5FA' : colors.button }]}>
            ₹{Number(amount).toLocaleString('en-IN')}
          </Text>
          <Text style={[styles.successSub, { color: appColors.secondaryText }]}>
            has been added to your wallet
          </Text>
        </Animated.View>

        {/* Details Card */}
        <Animated.View
          style={[
            styles.detailCard,
            { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderWidth: 1, opacity: fadeAnim },
          ]}
        >
          {transactionId && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: appColors.secondaryText }]}>Payment ID</Text>
              <Text style={[styles.detailValue, { color: appColors.text }]} numberOfLines={1}>{transactionId}</Text>
            </View>
          )}
          {orderId && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: appColors.secondaryText }]}>Order ID</Text>
              <Text style={[styles.detailValue, { color: appColors.text }]} numberOfLines={1}>{orderId}</Text>
            </View>
          )}
          {formattedDate !== '' && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: appColors.secondaryText }]}>Date & Time</Text>
              <Text style={[styles.detailValue, { color: appColors.text }]}>{formattedDate}</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5' }]}>
            <MaterialCommunityIcons name="shield-check" size={mS(14)} color="#10B981" />
            <Text style={styles.statusText}>Payment Verified</Text>
          </View>
        </Animated.View>
      </View>

      {/* Footer Buttons */}
      <Animated.View
        style={[styles.footer, { paddingBottom: insets.bottom + vS(16), opacity: fadeAnim }]}
      >
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.button, shadowColor: colors.button }]}
          onPress={() => navigation.navigate(WalletScreen_Nav)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="wallet" size={mS(20)} color="#FFF" />
          <Text style={styles.primaryBtnText}>Go to Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0' }]}
          onPress={() => navigation.popToTop()}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { color: appColors.text }]}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default WalletSuccessScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hS(24),
    gap: vS(24),
  },
  successCircle: {
    marginBottom: vS(8),
  },
  outerRing: {
    width: mS(128),
    height: mS(128),
    borderRadius: mS(64),
    backgroundColor: 'rgba(16,185,129,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: mS(96),
    height: mS(96),
    borderRadius: mS(48),
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  successTitle: {
    fontSize: mS(28),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: vS(4),
  },
  successAmount: {
    fontSize: mS(44),
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
  },
  successSub: {
    fontSize: mS(15),
    textAlign: 'center',
    marginTop: vS(4),
  },
  detailCard: {
    width: '100%',
    borderRadius: mS(20),
    padding: hS(20),
    gap: vS(12),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: mS(13),
    fontWeight: '600',
  },
  detailValue: {
    fontSize: mS(13),
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vS(8),
    borderRadius: mS(10),
    gap: hS(6),
    marginTop: vS(4),
  },
  statusText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: mS(13),
  },
  footer: {
    paddingHorizontal: hS(24),
    gap: vS(12),
  },
  primaryBtn: {
    height: vS(56),
    borderRadius: mS(18),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hS(10),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: mS(17),
    fontWeight: '800',
  },
  secondaryBtn: {
    height: vS(52),
    borderRadius: mS(18),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: mS(15),
    fontWeight: '700',
  },
});
