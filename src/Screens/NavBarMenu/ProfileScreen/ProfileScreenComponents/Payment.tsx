import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../../hooks/useAppTheme';
import { hS, vS, mS } from '../../../../lib/responsive';
import colors from '../../../../constant/colors';

const Payment = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors: appColors, isDark } = useAppTheme();

  const paymentMethods = [
    { id: 'upi', name: 'UPI (GPay, PhonePe, UPI)', icon: 'qrcode-scan', color: '#6366F1' },
    { id: 'card', name: 'Credit / Debit Cards', icon: 'credit-card-outline', color: '#3B82F6' },
    { id: 'netbanking', name: 'Net Banking', icon: 'bank-outline', color: '#10B981' },
    { id: 'wallet', name: 'Wallets', icon: 'wallet-outline', color: '#F59E0B' },
  ];

  const instructions = [
    { id: 1, text: 'Select your preferred payment method during checkout.', icon: 'gesture-tap' },
    { id: 2, text: 'Authorize the transaction through the secure payment gateway.', icon: 'shield-check-outline' },
    { id: 3, text: 'Your trip will be confirmed instantly after a successful payment.', icon: 'clock-check-outline' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={appColors.card} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: appColors.card, borderBottomColor: appColors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: appColors.iconBox }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={mS(24)} color={appColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>Payments & Wallet</Text>
        <View style={{ width: mS(40) }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Overview */}
        <View style={[styles.walletCard, { backgroundColor: isDark ? appColors.card : '#1E293B', shadowColor: isDark ? '#000' : '#1E293B', borderWidth: isDark ? 1 : 0, borderColor: appColors.border }]}>
          <View>
            <Text style={[styles.walletLabel, isDark && { color: appColors.lightTextColor }]}>Stored Balance</Text>
            <Text style={[styles.walletAmount, isDark && { color: appColors.text }]}>₹0.00</Text>
          </View>
          <TouchableOpacity style={styles.addMoneyButton}>
            <Text style={styles.addMoneyText}>+ Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Payment Methods */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>Supported Payment Methods</Text>
        </View>

        <View style={[styles.methodsContainer, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
          {paymentMethods.map((method) => (
            <TouchableOpacity key={method.id} style={styles.methodItem} activeOpacity={0.7}>
              <View style={[styles.methodIconBox, { backgroundColor: `${method.color}15` }]}>
                <MaterialCommunityIcons name={method.icon} size={mS(22)} color={method.color} />
              </View>
              <Text style={[styles.methodName, { color: appColors.text }]}>{method.name}</Text>
              <MaterialCommunityIcons name="chevron-right" size={mS(20)} color={appColors.border} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Section: How it Works */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>How Payments Work</Text>
        </View>

        <View style={[styles.instructionsContainer, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
          {instructions.map((item) => (
            <View key={item.id} style={styles.instructionRow}>
              <View style={[styles.instructionIcon, { backgroundColor: appColors.iconBox }]}>
                <MaterialCommunityIcons name={item.icon} size={mS(18)} color={appColors.lightTextColor} />
              </View>
              <Text style={[styles.instructionText, { color: appColors.lightTextColor }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Security & Trust */}
        <View style={[styles.securityBox, isDark && { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
          <MaterialCommunityIcons name="shield-lock" size={mS(32)} color="#10B981" />
          <View style={styles.securityTextContent}>
            <Text style={[styles.securityTitle, isDark && { color: '#34D399' }]}>Secure Payments by Razorpay</Text>
            <Text style={[styles.securityDesc, isDark && { color: '#6EE7B7' }]}>
              Your payment information is encrypted and processed securely. We do not store your full card details.
            </Text>
          </View>
        </View>

        {/* Support Link */}
        <TouchableOpacity style={styles.supportButton}>
          <Text style={[styles.supportText, { color: isDark ? appColors.text : colors.button }]}>Payment Issues? Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hS(16),
    paddingVertical: vS(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: mS(40),
    height: mS(40),
    borderRadius: mS(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: mS(18),
    fontWeight: '800',
    color: '#1E293B',
  },
  scrollContent: {
    padding: hS(20),
    paddingBottom: vS(40),
  },
  walletCard: {
    backgroundColor: '#1E293B',
    borderRadius: mS(24),
    padding: hS(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vS(32),
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  walletLabel: {
    color: '#94A3B8',
    fontSize: mS(14),
    fontWeight: '600',
    marginBottom: vS(4),
  },
  walletAmount: {
    color: '#FFFFFF',
    fontSize: mS(32),
    fontWeight: '800',
  },
  addMoneyButton: {
    backgroundColor: colors.button,
    paddingHorizontal: hS(16),
    paddingVertical: vS(10),
    borderRadius: mS(12),
  },
  addMoneyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: mS(14),
  },
  sectionHeader: {
    marginBottom: vS(16),
    paddingLeft: hS(4),
  },
  sectionTitle: {
    fontSize: mS(16),
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  methodsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: mS(20),
    padding: hS(8),
    marginBottom: vS(32),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hS(12),
    borderRadius: mS(16),
  },
  methodIconBox: {
    width: mS(44),
    height: mS(44),
    borderRadius: mS(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hS(16),
  },
  methodName: {
    flex: 1,
    fontSize: mS(15),
    fontWeight: '700',
    color: '#1E293B',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: mS(20),
    padding: hS(20),
    marginBottom: vS(32),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vS(16),
  },
  instructionIcon: {
    width: mS(32),
    height: mS(32),
    borderRadius: mS(16),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hS(12),
    marginTop: vS(2),
  },
  instructionText: {
    flex: 1,
    fontSize: mS(14),
    color: '#64748B',
    fontWeight: '500',
    lineHeight: vS(20),
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: hS(20),
    borderRadius: mS(20),
    marginBottom: vS(32),
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  securityTextContent: {
    flex: 1,
    marginLeft: hS(16),
  },
  securityTitle: {
    fontSize: mS(15),
    fontWeight: '800',
    color: '#065F46',
    marginBottom: vS(4),
  },
  securityDesc: {
    fontSize: mS(13),
    color: '#047857',
    fontWeight: '500',
    lineHeight: vS(18),
  },
  supportButton: {
    alignItems: 'center',
    paddingVertical: vS(12),
  },
  supportText: {
    color: colors.button,
    fontSize: mS(14),
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default Payment;