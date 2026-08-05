import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Modal,
  TextInput,
  Share,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useCreateWalletTopupOrderMutation,
  useVerifyWalletTopupPaymentMutation,
} from '../../service/userApi';
import RazorpayCheckout from 'react-native-razorpay';
import Config from 'react-native-config';
import { useAppTheme } from '../../hooks/useAppTheme';
import { hS, vS, mS } from '../../lib/responsive';
import colors from '../../constant/colors';
import { WalletSuccessScreen_Nav, WalletPinSetupScreen_Nav } from '../../Navigations/navigations';

/* ─────────── SKELETON ─────────── */
const Skeleton = ({
  width,
  height,
  borderRadius = 8,
  style,
  isDark,
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
  isDark?: boolean;
}) => {
  const opacity = useSharedValue(0.3);
  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.75, { duration: 800, easing: Easing.ease }),
      -1,
      true
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: isDark ? '#374151' : '#E2E8F0' }, style, animStyle]}
    />
  );
};

/* ─────────── TRANSACTION ICON ─────────── */
const getTxnIcon = (type: string) => {
  switch (type) {
    case 'WALLET_TOPUP':
      return { name: 'arrow-down-circle', color: '#10B981', bg: '#ECFDF5', darkBg: 'rgba(16,185,129,0.2)', darkColor: '#34D399' };
    case 'TRIP_PAYMENT':
      return { name: 'car', color: '#3B82F6', bg: '#EFF6FF', darkBg: 'rgba(59,130,246,0.2)', darkColor: '#60A5FA' };
    case 'REFUND':
      return { name: 'cash-refund', color: '#8B5CF6', bg: '#EDE9FE', darkBg: 'rgba(139,92,246,0.2)', darkColor: '#A78BFA' };
    case 'REFERRAL_REWARD':
      return { name: 'gift', color: '#F59E0B', bg: '#FFFBEB', darkBg: 'rgba(245,158,11,0.2)', darkColor: '#FCD34D' };
    default:
      return { name: 'swap-horizontal', color: '#64748B', bg: '#F1F5F9', darkBg: 'rgba(100,116,139,0.2)', darkColor: '#94A3B8' };
  }
};

/* ─────────── MAIN SCREEN ─────────── */
const WalletScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors: appColors, isDark } = useAppTheme();
  const isFocused = useIsFocused();
  const user = useSelector((state: RootState) => state.userSlice.user);
  const userId = user?.id || '';

  // API
  const {
    data: balanceData,
    refetch: refetchBalance,
    isFetching: isBalanceFetching,
    isError: isBalanceError,
  } = useGetWalletBalanceQuery(userId, { skip: !userId });

  const {
    data: txnData,
    refetch: refetchTxns,
    isFetching: isTxnFetching,
    isError: isTxnError,
  } = useGetWalletTransactionsQuery({ userId }, { skip: !userId });

  const [createOrder, { isLoading: isCreating }] = useCreateWalletTopupOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyWalletTopupPaymentMutation();

  const balance = balanceData?.data?.balance ?? 0;
  const hasWalletPin = balanceData?.data?.has_wallet_pin ?? false;
  const transactions = txnData?.data ?? [];
  const isLoading = (isBalanceFetching || isTxnFetching) && !balanceData && !txnData;

  // Add Money Modal
  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  // Transaction Detail Modal
  const [txnDetailVisible, setTxnDetailVisible] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  // Refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchBalance(), refetchTxns()]);
    setIsRefreshing(false);
  }, []);

  /* ─────── TOP-UP HANDLER ─────── */
  const handleTopup = async () => {
    const amount = Number(topupAmount);
    if (!amount || amount < 50) {
      Alert.alert('Minimum Amount', 'Minimum top-up amount is ₹50');
      return;
    }
    setAddMoneyVisible(false);
    try {
      const orderRes = await createOrder({ userId, amount }).unwrap();
      const options = {
        description: 'Wallet Top-up',
        currency: orderRes.data?.currency || 'INR',
        key: Config.RAZORPAY_KEY_ID || 'rzp_test_SCjewpaZ96XBWa',
        amount: orderRes.data?.amount || String(amount * 100),
        name: 'VDrive',
        order_id: orderRes.data?.id,
        prefill: {
          email: user?.email || '',
          contact: user?.phone_number || '',
          name: user?.full_name || '',
        },
        theme: { color: colors.button },
      };
      const data = await RazorpayCheckout.open(options);
      const verifyRes = await verifyPayment({
        userId,
        amount,
        razorpay_order_id: data.razorpay_order_id || '',
        razorpay_payment_id: data.razorpay_payment_id || '',
        razorpay_signature: data.razorpay_signature || '',
      }).unwrap();
      if (verifyRes.success) {
        refetchBalance();
        refetchTxns();
        navigation.navigate(WalletSuccessScreen_Nav, {
          amount,
          transactionId: data.razorpay_payment_id,
          orderId: data.razorpay_order_id,
          date: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      const msg =
        error?.message ||
        error?.error?.description ||
        error?.description ||
        'Payment cancelled or failed';
      Alert.alert('Payment Failed', msg);
    }
  };

  /* ─────── SHARE RECEIPT ─────── */
  const handleShare = async () => {
    if (!selectedTxn) return;
    try {
      await Share.share({
        title: 'Wallet Transaction Receipt',
        message: `VDrive Wallet Receipt\n\nID: ${selectedTxn.id}\nDescription: ${selectedTxn.title}\nDate: ${selectedTxn.date} ${selectedTxn.time}\nAmount: ${selectedTxn.amount > 0 ? '+' : ''}₹${Math.abs(selectedTxn.amount)}\nStatus: ${selectedTxn.status}`,
      });
    } catch {}
  };

  /* ─────── RENDER ─────── */
  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      {isFocused && <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />}

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: appColors.background }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={mS(22)} color={appColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>My Wallet</Text>
        <View style={{ width: mS(40) }} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + vS(40) }]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.button} />}
        ListHeaderComponent={
          <>
            {/* Balance Card */}
            {isLoading ? (
              <View style={[styles.balanceCard, { backgroundColor: '#1E3A8A' }]}>
                <Skeleton width={120} height={16} borderRadius={8} style={{ marginBottom: vS(12) }} />
                <Skeleton width={180} height={40} borderRadius={8} style={{ marginBottom: vS(24) }} />
                <View style={{ flexDirection: 'row', gap: hS(12) }}>
                  <Skeleton width={130} height={42} borderRadius={12} />
                  <Skeleton width={130} height={42} borderRadius={12} />
                </View>
              </View>
            ) : (
              <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceLabel}>Total Balance</Text>
                  <MaterialCommunityIcons name="wallet-outline" size={mS(22)} color="rgba(255,255,255,0.7)" />
                </View>
                <Text style={styles.balanceValue}>₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={() => { setTopupAmount(''); setAddMoneyVisible(true); }}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="plus-circle-outline" size={mS(18)} color="#1E3A8A" />
                    <Text style={styles.cardActionText}>Add Money</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cardActionBtn, { backgroundColor: 'rgba(255,255,255,0.18)', marginLeft: hS(12) }]}
                    onPress={() => navigation.navigate(WalletPinSetupScreen_Nav)}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="lock-outline" size={mS(18)} color="#FFF" />
                    <Text style={[styles.cardActionText, { color: '#FFF' }]}>
                      {hasWalletPin ? 'Reset PIN' : 'Setup PIN'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Security Banner */}
            <View style={[styles.securityBanner, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', borderColor: isDark ? 'rgba(16,185,129,0.2)' : '#D1FAE5' }]}>
              <MaterialCommunityIcons name="shield-lock" size={mS(16)} color="#10B981" />
              <Text style={[styles.securityText, { color: isDark ? '#34D399' : '#065F46' }]}>
                All transactions are end-to-end secured
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: appColors.text }]}>Recent Transactions</Text>
          </>
        }
        renderItem={({ item }) => {
          const icon = getTxnIcon(item.type);
          const isPositive = Number(item.amount) > 0;
          return (
            <TouchableOpacity
              style={[styles.txnRow, { backgroundColor: appColors.card, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent', borderWidth: isDark ? 1 : 0 }]}
              onPress={() => { setSelectedTxn(item); setTxnDetailVisible(true); }}
              activeOpacity={0.75}
            >
              <View style={[styles.txnIcon, { backgroundColor: isDark ? icon.darkBg : icon.bg }]}>
                <MaterialCommunityIcons name={icon.name} size={mS(22)} color={isDark ? icon.darkColor : icon.color} />
              </View>
              <View style={styles.txnBody}>
                <Text style={[styles.txnTitle, { color: appColors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.txnDate, { color: appColors.secondaryText }]}>{item.date} · {item.time}</Text>
              </View>
              <View style={styles.txnRight}>
                <Text style={[styles.txnAmount, { color: isPositive ? '#10B981' : (isDark ? '#F87171' : '#EF4444') }]}>
                  {isPositive ? '+' : ''}₹{Math.abs(Number(item.amount)).toLocaleString('en-IN')}
                </Text>
                <View style={[styles.txnBadge, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5' }]}>
                  <Text style={[styles.txnBadgeText, { color: '#10B981' }]}>{item.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.txnRow, { backgroundColor: appColors.card }]}>
                  <Skeleton width={mS(48)} height={mS(48)} borderRadius={mS(24)} isDark={isDark} />
                  <View style={{ flex: 1, marginLeft: hS(12) }}>
                    <Skeleton width={'70%'} height={14} borderRadius={7} isDark={isDark} style={{ marginBottom: vS(8) }} />
                    <Skeleton width={'45%'} height={11} borderRadius={5} isDark={isDark} />
                  </View>
                  <Skeleton width={60} height={18} borderRadius={9} isDark={isDark} />
                </View>
              ))}
            </View>
          ) : isTxnError ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="alert-circle-outline" size={mS(56)} color="#EF4444" />
              <Text style={[styles.emptyText, { color: appColors.text }]}>Failed to load transactions</Text>
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.button }]} onPress={onRefresh}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="receipt-text-outline" size={mS(60)} color={isDark ? '#374151' : '#CBD5E1'} />
              <Text style={[styles.emptyText, { color: appColors.text }]}>No transactions yet</Text>
              <Text style={[styles.emptySub, { color: appColors.secondaryText }]}>
                Your wallet activity will appear here.{'\n'}Add money to get started.
              </Text>
            </View>
          )
        }
      />

      {/* ═══ ADD MONEY MODAL ═══ */}
      <Modal
        visible={addMoneyVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setAddMoneyVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setAddMoneyVisible(false); }}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalSheet, { backgroundColor: appColors.card, paddingBottom: insets.bottom + vS(24) }]}>
          <View style={[styles.sheetHandle, { backgroundColor: isDark ? '#4B5563' : '#E2E8F0' }]} />
          <Text style={[styles.sheetTitle, { color: appColors.text }]}>Add Money to Wallet</Text>
          <Text style={[styles.sheetSubtitle, { color: appColors.secondaryText }]}>
            Current balance:{' '}
            <Text style={{ fontWeight: '800', color: appColors.text }}>
              ₹{Number(balance).toLocaleString('en-IN')}
            </Text>
          </Text>

          {/* Amount Input */}
          <View style={[styles.amountInputRow, { borderBottomColor: isDark ? '#374151' : '#E2E8F0' }]}>
            <Text style={[styles.rupee, { color: appColors.text }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: appColors.text }]}
              placeholder="0"
              placeholderTextColor={appColors.secondaryText}
              keyboardType="numeric"
              value={topupAmount}
              onChangeText={setTopupAmount}
              autoFocus
            />
          </View>

          {/* Quick amounts */}
          <View style={styles.quickRow}>
            {[100, 500, 1000, 2000].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[styles.quickBtn, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]}
                onPress={() => setTopupAmount(amt.toString())}
                activeOpacity={0.75}
              >
                <Text style={[styles.quickBtnText, { color: appColors.text }]}>₹{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.proceedBtn,
              { backgroundColor: colors.button, shadowColor: colors.button, opacity: (isCreating || isVerifying) ? 0.75 : 1 },
            ]}
            onPress={handleTopup}
            disabled={isCreating || isVerifying}
            activeOpacity={0.85}
          >
            <Text style={styles.proceedBtnText}>
              {isCreating || isVerifying ? 'Processing...' : 'Proceed to Pay'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={mS(20)} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ═══ TRANSACTION DETAIL MODAL ═══ */}
      <Modal
        visible={txnDetailVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setTxnDetailVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setTxnDetailVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        {selectedTxn && (
          <View style={[styles.modalSheet, { backgroundColor: appColors.card, paddingBottom: insets.bottom + vS(24) }]}>
            <View style={[styles.sheetHandle, { backgroundColor: isDark ? '#4B5563' : '#E2E8F0' }]} />
            <View style={styles.txnDetailHeader}>
              <View
                style={[
                  styles.txnDetailIcon,
                  { backgroundColor: Number(selectedTxn.amount) > 0 ? (isDark ? 'rgba(16,185,129,0.2)' : '#ECFDF5') : (isDark ? 'rgba(239,68,68,0.2)' : '#FEE2E2') },
                ]}
              >
                <MaterialCommunityIcons
                  name={Number(selectedTxn.amount) > 0 ? 'arrow-down-circle' : 'arrow-up-circle'}
                  size={mS(36)}
                  color={Number(selectedTxn.amount) > 0 ? '#10B981' : '#EF4444'}
                />
              </View>
              <Text style={[styles.txnDetailTitle, { color: appColors.text }]}>{selectedTxn.title}</Text>
              <Text style={[styles.txnDetailAmount, { color: Number(selectedTxn.amount) > 0 ? '#10B981' : '#EF4444' }]}>
                {Number(selectedTxn.amount) > 0 ? '+' : ''}₹{Math.abs(Number(selectedTxn.amount)).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={[styles.txnDetailCard, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC', borderColor: isDark ? '#374151' : '#E2E8F0' }]}>
              {[
                { label: 'Transaction ID', value: selectedTxn.id },
                { label: 'Date', value: selectedTxn.date },
                { label: 'Time', value: selectedTxn.time },
                { label: 'Type', value: (selectedTxn.type || '').replace(/_/g, ' ') },
                { label: 'Status', value: selectedTxn.status },
              ].map(({ label, value }) => (
                <View key={label} style={styles.txnDetailRow}>
                  <Text style={[styles.txnDetailLabel, { color: appColors.secondaryText }]}>{label}</Text>
                  <Text style={[styles.txnDetailValue, { color: appColors.text }]} numberOfLines={1}>{value}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.shareBtn, { borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0' }]}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="share-outline" size={mS(20)} color={appColors.text} />
              <Text style={[styles.shareBtnText, { color: appColors.text }]}>Share Receipt</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
};

export default WalletScreen;

/* ─────────── STYLES ─────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hS(16),
    paddingBottom: vS(12),
  },
  backBtn: {
    width: mS(40),
    height: mS(40),
    borderRadius: mS(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: mS(20),
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: hS(16),
  },
  balanceCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: mS(24),
    padding: hS(24),
    marginBottom: vS(12),
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vS(8),
  },
  balanceLabel: {
    fontSize: mS(14),
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: mS(38),
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: vS(24),
  },
  cardActions: {
    flexDirection: 'row',
  },
  cardActionBtn: {
    backgroundColor: '#FFF',
    borderRadius: mS(14),
    paddingVertical: vS(10),
    paddingHorizontal: hS(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: hS(6),
  },
  cardActionText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: mS(14),
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hS(8),
    paddingVertical: vS(10),
    paddingHorizontal: hS(16),
    borderRadius: mS(12),
    borderWidth: 1,
    marginBottom: vS(20),
  },
  securityText: {
    fontSize: mS(12),
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: mS(17),
    fontWeight: '800',
    marginBottom: vS(12),
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: mS(16),
    padding: hS(14),
    marginBottom: vS(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  txnIcon: {
    width: mS(48),
    height: mS(48),
    borderRadius: mS(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hS(12),
  },
  txnBody: { flex: 1 },
  txnTitle: { fontSize: mS(14), fontWeight: '700', marginBottom: vS(3) },
  txnDate: { fontSize: mS(12), fontWeight: '500' },
  txnRight: { alignItems: 'flex-end', gap: vS(4) },
  txnAmount: { fontSize: mS(15), fontWeight: '800' },
  txnBadge: {
    paddingHorizontal: hS(8),
    paddingVertical: vS(2),
    borderRadius: mS(6),
  },
  txnBadgeText: { fontSize: mS(11), fontWeight: '700' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: vS(48),
    gap: vS(12),
  },
  emptyText: { fontSize: mS(17), fontWeight: '700' },
  emptySub: { fontSize: mS(13), textAlign: 'center', lineHeight: vS(20) },
  retryBtn: {
    paddingVertical: vS(10),
    paddingHorizontal: hS(24),
    borderRadius: mS(12),
    marginTop: vS(8),
  },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: mS(14) },

  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: mS(28),
    borderTopRightRadius: mS(28),
    paddingHorizontal: hS(24),
    paddingTop: vS(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetHandle: {
    width: hS(40),
    height: vS(4),
    borderRadius: vS(2),
    alignSelf: 'center',
    marginBottom: vS(20),
  },
  sheetTitle: { fontSize: mS(20), fontWeight: '800', marginBottom: vS(4) },
  sheetSubtitle: { fontSize: mS(13), marginBottom: vS(20) },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    paddingBottom: vS(8),
    marginBottom: vS(20),
  },
  rupee: { fontSize: mS(28), fontWeight: '700', marginRight: hS(4) },
  amountInput: { flex: 1, fontSize: mS(36), fontWeight: '800', paddingVertical: 0 },
  quickRow: {
    flexDirection: 'row',
    gap: hS(8),
    marginBottom: vS(24),
    flexWrap: 'wrap',
  },
  quickBtn: {
    paddingVertical: vS(8),
    paddingHorizontal: hS(16),
    borderRadius: mS(10),
  },
  quickBtnText: { fontWeight: '700', fontSize: mS(14) },
  proceedBtn: {
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
  proceedBtnText: { color: '#FFF', fontWeight: '800', fontSize: mS(17) },

  // Txn Detail
  txnDetailHeader: { alignItems: 'center', marginBottom: vS(20) },
  txnDetailIcon: {
    width: mS(72),
    height: mS(72),
    borderRadius: mS(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vS(12),
  },
  txnDetailTitle: { fontSize: mS(17), fontWeight: '800', marginBottom: vS(4) },
  txnDetailAmount: { fontSize: mS(28), fontWeight: '900' },
  txnDetailCard: {
    borderRadius: mS(16),
    padding: hS(16),
    borderWidth: 1,
    gap: vS(12),
    marginBottom: vS(16),
  },
  txnDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txnDetailLabel: { fontSize: mS(13), fontWeight: '600' },
  txnDetailValue: { fontSize: mS(13), fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  shareBtn: {
    height: vS(52),
    borderRadius: mS(16),
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hS(8),
  },
  shareBtnText: { fontSize: mS(15), fontWeight: '700' },
});
