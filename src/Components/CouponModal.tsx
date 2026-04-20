import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from './index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { hS, vS, mS } from '../lib/responsive';
import colors from '../constant/colors';
import CouponCard from './CouponCard';
import { useGetAvailableCouponsQuery, useValidateCouponMutation } from '../service/couponApi';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface CouponModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (coupon: any, discountAmount: number) => void;
  onRemove: () => void;
  rideAmount: number;
  currentCouponId?: string;
  userId: string;
}

const CouponModal: React.FC<CouponModalProps> = ({
  visible,
  onClose,
  onApply,
  onRemove,
  rideAmount,
  currentCouponId,
  userId,
}) => {
  const { colors: appColors, isDark } = useAppTheme();
  const [manualCode, setManualCode] = useState('');
  const localuser = useSelector((state: RootState) => state.userSlice.user);
  const { data: availableCoupons, isLoading: isFetching } = useGetAvailableCouponsQuery(userId || localuser?.id, {
    skip: !visible,
  });
  console.log("availableCoupons", availableCoupons);
  const [validateCoupon, { isLoading: isValidating }] = useValidateCouponMutation();
  const [error, setError] = useState('');

  const handleManualApply = async () => {
    if (!manualCode.trim()) return;
    
    // Check if the code is already applied
    const alreadyApplied = availableCoupons?.coupons?.find(
      (c: any) => c.id === currentCouponId && c.code.toLowerCase() === manualCode.toLowerCase()
    );

    if (alreadyApplied) {
      setError('This coupon is already applied');
      return;
    }

    setError('');
    try {
      const result = await validateCoupon({ code: manualCode, rideAmount }).unwrap();
      if (result.success) {
        onApply(result.coupon, result.discount_amount);
        setManualCode('');
        onClose();
      }
    } catch (err: any) {
      setError(err?.data?.error || 'Invalid coupon code');
    }
  };

  const handleSelectCoupon = async (coupon: any) => {
    setError('');
    try {
      const result = await validateCoupon({ code: coupon.code, rideAmount }).unwrap();
      if (result.success) {
        onApply(result.coupon, result.discount_amount);
        onClose();
      }
    } catch (err: any) {
      setError(err?.data?.error || 'Could not apply this coupon');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[
            styles.container, 
            { 
              backgroundColor: appColors.card,
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderTopWidth: isDark ? 1 : 0 
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: appColors.text }]}>Apply Coupon</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={mS(24)} color={appColors.secondaryText} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: isDark ? appColors.background : '#FFFFFF',
                borderColor: appColors.border 
              }
            ]}>
              <TextInput
                style={[styles.input, { color: appColors.text }]}
                placeholder="Enter coupon code"
                placeholderTextColor={appColors.lightTextColor}
                value={manualCode}
                onChangeText={setManualCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.applyBtn, !manualCode && styles.disabledBtn, { backgroundColor: manualCode ? appColors.button : (isDark ? '#1E293B' : '#94A3B8') }]}
                onPress={handleManualApply}
                disabled={!manualCode || isValidating}
              >
                {isValidating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.applyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Text style={[styles.sectionTitle, { color: appColors.secondaryText }]}>Available Offers</Text>

          {isFetching ? (
            <ActivityIndicator style={{ marginTop: vS(20) }} color={appColors.primary} />
          ) : (
            <FlatList
              data={availableCoupons?.coupons || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CouponCard
                  coupon={item}
                  onApply={handleSelectCoupon}
                  onRemove={onRemove}
                  isSelected={item.id === currentCouponId}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: appColors.lightTextColor }]}>No coupons available at the moment.</Text>
                </View>
              )}
            />
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: mS(24),
    borderTopRightRadius: mS(24),
    height: '70%',
    padding: mS(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vS(20),
  },
  title: {
    fontSize: mS(20),
    fontWeight: '800',
    color: '#1E293B',
  },
  inputSection: {
    marginBottom: vS(24),
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: mS(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: hS(16),
    height: vS(54),
    fontSize: mS(14),
    color: '#1E293B',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: hS(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#94A3B8',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: mS(14),
  },
  errorText: {
    color: '#EF4444',
    fontSize: mS(12),
    marginTop: vS(6),
    marginLeft: hS(4),
  },
  sectionTitle: {
    fontSize: mS(16),
    fontWeight: '700',
    color: '#64748B',
    marginBottom: vS(12),
  },
  listContent: {
    paddingBottom: vS(20),
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: vS(40),
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: mS(14),
  },
});

export default CouponModal;
