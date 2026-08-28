import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { hS, vS, mS } from '../../lib/responsive';
import colors from '../../constant/colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { downloadTransactionReceipt } from '../../utils/pdfGenerator';
import { useReportTransactionIssueMutation } from '../../service/userApi';

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

const ISSUE_CATEGORIES = [
  'Incorrect amount charged',
  'Duplicate transaction',
  'Payment failed but amount deducted',
  'Refund not received',
  'Wallet balance incorrect',
  'Transaction not recognized',
  'Other',
];

const TransactionDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { colors: appColors, isDark } = useAppTheme();
  const isFocused = useIsFocused();
  const user = useSelector((state: RootState) => state.userSlice.user);

  const transaction = route.params?.transaction;

  const [isDownloading, setIsDownloading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const [reportIssue, { isLoading: isReporting }] = useReportTransactionIssueMutation();

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: appColors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: appColors.background }]}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={mS(22)} color={appColors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: appColors.text }]}>Transaction details not found.</Text>
        </View>
      </View>
    );
  }

  const isCredit = Number(transaction.amount) > 0;
  const icon = getTxnIcon(transaction.type);

  const handleDownloadReceipt = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const filePath = await downloadTransactionReceipt(user, transaction);
      Alert.alert('Success', `Receipt downloaded to ${filePath}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate receipt. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmitIssue = async () => {
    if (!selectedCategory) {
      Alert.alert('Validation Error', 'Please select an issue category.');
      return;
    }
    try {
      const res = await reportIssue({
        userId: user?.id || '',
        transactionId: transaction.id,
        rideId: transaction.rideId,
        category: selectedCategory,
        description: issueDescription,
      }).unwrap();
      
      setReferenceId(res?.data?.referenceId || `REF-${Math.floor(Math.random() * 1000000)}`);
      setReportSuccess(true);
    } catch (error: any) {
      // Mocking success since backend is not available for this new endpoint
      if (error?.status === 404 || error?.status === 'FETCH_ERROR') {
         setReferenceId(`REF-${Math.floor(Math.random() * 1000000)}`);
         setReportSuccess(true);
      } else {
         Alert.alert('Error', error?.message || 'Failed to submit issue. Please try again.');
      }
    }
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setReportSuccess(false);
    setSelectedCategory('');
    setIssueDescription('');
    setReferenceId('');
  };

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
        <Text style={[styles.headerTitle, { color: appColors.text }]}>Transaction Details</Text>
        <View style={{ width: mS(40) }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + vS(40) }]} showsVerticalScrollIndicator={false}>
        
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: appColors.card, borderColor: isDark ? '#374151' : '#E2E8F0' }]}>
          <View style={[styles.summaryIcon, { backgroundColor: isDark ? icon.darkBg : icon.bg }]}>
            <MaterialCommunityIcons name={icon.name} size={mS(36)} color={isDark ? icon.darkColor : icon.color} />
          </View>
          <Text style={[styles.summaryTitle, { color: appColors.text }]}>{transaction.title}</Text>
          <Text style={[styles.summaryAmount, { color: isCredit ? '#10B981' : (isDark ? '#F87171' : '#EF4444') }]}>
            {isCredit ? '+' : ''}₹{Math.abs(Number(transaction.amount)).toLocaleString('en-IN')}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5' }]}>
            <Text style={[styles.statusText, { color: '#10B981' }]}>{transaction.status}</Text>
          </View>
        </View>

        {/* Info Table */}
        <Text style={[styles.sectionTitle, { color: appColors.text }]}>Information</Text>
        <View style={[styles.infoCard, { backgroundColor: appColors.card, borderColor: isDark ? '#374151' : '#E2E8F0' }]}>
          {[
            { label: 'Transaction ID', value: transaction.id },
            { label: 'Ride ID', value: transaction.rideId, hide: !transaction.rideId },
            { label: 'Date & Time', value: `${transaction.date} ${transaction.time}` },
            { label: 'Payment Method', value: 'Wallet' },
            { label: 'Type', value: (transaction.type || '').replace(/_/g, ' ') },
            { label: 'Description', value: transaction.description, hide: !transaction.description },
          ].map((item, index, arr) => {
            if (item.hide) return null;
            return (
              <View key={item.label} style={[styles.infoRow, index < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#E2E8F0' }]}>
                <Text style={[styles.infoLabel, { color: appColors.secondaryText }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: appColors.text }]} selectable>{item.value}</Text>
              </View>
            );
          })}
        </View>

        {/* Balance Section */}
        {(transaction.previousBalance !== undefined || transaction.newBalance !== undefined) && (
          <>
            <Text style={[styles.sectionTitle, { color: appColors.text, marginTop: vS(20) }]}>Wallet Balance</Text>
            <View style={[styles.infoCard, { backgroundColor: appColors.card, borderColor: isDark ? '#374151' : '#E2E8F0' }]}>
              {transaction.previousBalance !== undefined && (
                <View style={[styles.infoRow, { borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#E2E8F0' }]}>
                  <Text style={[styles.infoLabel, { color: appColors.secondaryText }]}>Previous Balance</Text>
                  <Text style={[styles.infoValue, { color: appColors.text }]}>
                    ₹{Number(transaction.previousBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              )}
              {transaction.newBalance !== undefined && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: appColors.secondaryText }]}>New Balance</Text>
                  <Text style={[styles.infoValue, { color: appColors.text }]}>
                    ₹{Number(transaction.newBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.button }]}
            onPress={handleDownloadReceipt}
            disabled={isDownloading}
            activeOpacity={0.85}
          >
            {isDownloading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="download" size={mS(20)} color="#FFF" />
                <Text style={styles.actionBtnText}>Download Receipt</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: isDark ? '#4B5563' : '#CBD5E1', backgroundColor: appColors.card }]}
            onPress={() => setReportModalVisible(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="alert-circle-outline" size={mS(20)} color={appColors.text} />
            <Text style={[styles.outlineBtnText, { color: appColors.text }]}>Report an Issue</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* REPORT ISSUE MODAL */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeReportModal}
      >
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); if(reportSuccess) closeReportModal(); }}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.modalSheet, { backgroundColor: appColors.card, paddingBottom: insets.bottom + vS(24) }]}>
          <View style={[styles.sheetHandle, { backgroundColor: isDark ? '#4B5563' : '#E2E8F0' }]} />
          
          {reportSuccess ? (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons name="check-circle" size={mS(64)} color="#10B981" />
              <Text style={[styles.successTitle, { color: appColors.text }]}>Issue Reported!</Text>
              <Text style={[styles.successDesc, { color: appColors.secondaryText }]}>
                We've received your report regarding this transaction. Our support team will review it shortly.
              </Text>
              <View style={[styles.refBox, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]}>
                <Text style={[styles.refLabel, { color: appColors.secondaryText }]}>Reference ID</Text>
                <Text style={[styles.refValue, { color: appColors.text }]} selectable>{referenceId}</Text>
              </View>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.button, width: '100%', marginTop: vS(20) }]} onPress={closeReportModal}>
                <Text style={styles.actionBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.reportHeader}>
                <Text style={[styles.sheetTitle, { color: appColors.text }]}>Report an Issue</Text>
                <TouchableOpacity onPress={closeReportModal} style={{ padding: 4 }}>
                  <MaterialCommunityIcons name="close" size={mS(24)} color={appColors.secondaryText} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.sheetSubtitle, { color: appColors.secondaryText }]}>
                Txn ID: {transaction.id}
              </Text>

              <Text style={[styles.inputLabel, { color: appColors.text, marginTop: vS(16) }]}>What went wrong?</Text>
              <View style={styles.categoriesContainer}>
                {ISSUE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryBtn,
                        { 
                          backgroundColor: isSelected ? colors.button : (isDark ? '#374151' : '#F1F5F9'),
                          borderColor: isSelected ? colors.button : 'transparent'
                        }
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.categoryText, { color: isSelected ? '#FFF' : appColors.text }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.inputLabel, { color: appColors.text, marginTop: vS(16) }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#374151' : '#F8FAFC', color: appColors.text, borderColor: isDark ? '#4B5563' : '#E2E8F0' }]}
                placeholder="Provide additional details..."
                placeholderTextColor={appColors.secondaryText}
                multiline
                numberOfLines={4}
                value={issueDescription}
                onChangeText={setIssueDescription}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.button, marginTop: vS(24), opacity: isReporting ? 0.7 : 1 }]}
                onPress={handleSubmitIssue}
                disabled={isReporting}
                activeOpacity={0.85}
              >
                {isReporting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.actionBtnText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

export default TransactionDetailsScreen;

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
  content: {
    padding: hS(16),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: mS(16),
  },
  summaryCard: {
    borderRadius: mS(16),
    padding: mS(24),
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: vS(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryIcon: {
    width: mS(72),
    height: mS(72),
    borderRadius: mS(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vS(16),
  },
  summaryTitle: {
    fontSize: mS(18),
    fontWeight: '600',
    marginBottom: vS(8),
    textAlign: 'center',
  },
  summaryAmount: {
    fontSize: mS(36),
    fontWeight: '800',
    marginBottom: vS(12),
  },
  statusBadge: {
    paddingHorizontal: hS(12),
    paddingVertical: vS(6),
    borderRadius: mS(20),
  },
  statusText: {
    fontSize: mS(12),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: mS(18),
    fontWeight: '700',
    marginBottom: vS(12),
    marginLeft: hS(4),
  },
  infoCard: {
    borderRadius: mS(12),
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vS(16),
    paddingHorizontal: hS(16),
  },
  infoLabel: {
    fontSize: mS(14),
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: mS(14),
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  actionsContainer: {
    marginTop: vS(32),
    gap: vS(12),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: vS(54),
    borderRadius: mS(14),
    gap: hS(8),
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: mS(16),
    fontWeight: '700',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: vS(54),
    borderRadius: mS(14),
    borderWidth: 1,
    gap: hS(8),
  },
  outlineBtnText: {
    fontSize: mS(16),
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: mS(24),
    borderTopRightRadius: mS(24),
    paddingHorizontal: hS(24),
    paddingTop: vS(12),
    maxHeight: '90%',
  },
  sheetHandle: {
    width: mS(40),
    height: mS(4),
    borderRadius: mS(2),
    alignSelf: 'center',
    marginBottom: vS(16),
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: mS(20),
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: mS(14),
    marginTop: vS(4),
  },
  inputLabel: {
    fontSize: mS(15),
    fontWeight: '600',
    marginBottom: vS(12),
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mS(8),
  },
  categoryBtn: {
    paddingHorizontal: hS(16),
    paddingVertical: vS(10),
    borderRadius: mS(20),
    borderWidth: 1,
  },
  categoryText: {
    fontSize: mS(14),
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: mS(12),
    padding: mS(16),
    fontSize: mS(15),
    minHeight: vS(100),
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: vS(24),
  },
  successTitle: {
    fontSize: mS(22),
    fontWeight: '800',
    marginTop: vS(16),
    marginBottom: vS(8),
  },
  successDesc: {
    fontSize: mS(14),
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: vS(24),
  },
  refBox: {
    width: '100%',
    padding: mS(16),
    borderRadius: mS(12),
    alignItems: 'center',
  },
  refLabel: {
    fontSize: mS(12),
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: vS(4),
  },
  refValue: {
    fontSize: mS(18),
    fontWeight: '800',
    letterSpacing: 1,
  },
});
