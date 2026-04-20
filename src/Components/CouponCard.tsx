import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './index';
import colors from '../constant/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { hS, vS, mS } from '../lib/responsive';

interface CouponCardProps {
  coupon: {
    id: string;
    code: string;
    discount_type: 'PERCENTAGE' | 'FLAT';
    discount_value: string;
    valid_until: string;
    min_ride_amount: string;
  };
  onApply: (coupon: any) => void;
  onRemove?: () => void;
  isSelected?: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onApply, onRemove, isSelected }) => {
  const { colors: appColors, isDark } = useAppTheme();
  const discountText = coupon.discount_type === 'PERCENTAGE' 
    ? `${coupon.discount_value}% OFF`
    : `₹${coupon.discount_value} OFF`;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: appColors.card,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0',
      },
      isSelected && {
        borderColor: appColors.primary,
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#F0F9FF',
      }
    ]}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? appColors.background : '#EFF6FF' }]}>
          <MaterialCommunityIcons name="ticket-percent" size={mS(24)} color={appColors.primary} />
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <View style={styles.header}>
          <Text style={[styles.code, { color: appColors.text }]}>{coupon.code}</Text>
          <Text style={[styles.discount, { color: appColors.primary }]}>{discountText}</Text>
        </View>
        
        <Text style={[styles.description, { color: appColors.secondaryText }]}>
          Min. ride amount: ₹{coupon.min_ride_amount}
        </Text>
        
        <View style={styles.footer}>
          <Text style={[styles.expiry, { color: appColors.lightTextColor }]}>
            Expires: {new Date(coupon.valid_until).toLocaleDateString()}
          </Text>
          {isSelected ? (
            <View style={styles.appliedActionContainer}>
              <Text style={[styles.appliedLabel, { color: isDark ? '#34D399' : '#059669' }]}>Applied</Text>
              <TouchableOpacity 
                style={[styles.removeBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]} 
                onPress={() => onRemove?.()}
              >
                <Text style={[styles.removeText, { color: isDark ? '#F87171' : '#EF4444' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => onApply(coupon)}>
              <Text style={[styles.applyText, { color: appColors.primary }]}>Apply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: mS(12),
    marginBottom: vS(12),
    padding: mS(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  leftSection: {
    marginRight: hS(16),
    justifyContent: 'center',
  },
  iconContainer: {
    width: mS(48),
    height: mS(48),
    borderRadius: mS(24),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vS(4),
  },
  code: {
    fontSize: mS(16),
    fontWeight: '800',
    color: '#1E293B',
  },
  discount: {
    fontSize: mS(16),
    fontWeight: '800',
  },
  description: {
    fontSize: mS(12),
    color: '#64748B',
    marginBottom: vS(8),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiry: {
    fontSize: mS(11),
    color: '#94A3B8',
  },
  applyText: {
    fontSize: mS(14),
    fontWeight: '700',
  },
  appliedActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hS(8),
  },
  appliedLabel: {
    fontSize: mS(14),
    fontWeight: '700',
  },
  removeBtn: {
    paddingHorizontal: hS(12),
    paddingVertical: vS(4),
    borderRadius: mS(6),
  },
  removeText: {
    fontSize: mS(12),
    fontWeight: '700',
  },
});

export default CouponCard;
