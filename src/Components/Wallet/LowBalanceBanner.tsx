import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useGetWalletBalanceQuery, useGetWalletSettingsQuery } from '../../service/userApi';
import { useNavigation } from '@react-navigation/native';
import { WalletScreen_Nav } from '../../Navigations/navigations';
import { hS, vS, mS } from '../../lib/responsive';
import { useAppTheme } from '../../hooks/useAppTheme';

const LowBalanceBanner = ({ onPressAddMoney, style }: { onPressAddMoney?: () => void, style?: any }) => {
  const navigation = useNavigation<any>();
  const { colors: appColors, isDark } = useAppTheme();
  
  const user = useSelector((state: RootState) => state.userSlice.user);
  const userId = user?.id || '';

  const { data: balanceData } = useGetWalletBalanceQuery(userId, { skip: !userId });
  const { data: settingsData } = useGetWalletSettingsQuery(userId, { skip: !userId });

  const balance = Number(balanceData?.data?.balance ?? 0);
  // Default threshold to 500 if not set in settings, but users can configure auto-reload threshold.
  const threshold = Number(settingsData?.data?.threshold_amount ?? 500);

  if (!userId || balance >= threshold) {
    return null;
  }

  const handleAddMoney = () => {
    if (onPressAddMoney) {
      onPressAddMoney();
    } else {
      // Typically, navigate to WalletScreen. The user might need to click "Add Money" there.
      // We can also pass a parameter if WalletScreen supports it.
      navigation.navigate(WalletScreen_Nav, { openAddMoney: true });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FEE2E2' }, style]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={mS(24)} color="#EF4444" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>Low Wallet Balance</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#F87171' : '#B91C1C' }]}>
          Your balance is ₹{balance}. Add funds to avoid interruptions.
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#EF4444' }]} 
        onPress={handleAddMoney}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Add Money</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hS(12),
    borderRadius: mS(12),
    borderWidth: 1,
    marginHorizontal: hS(16),
    marginTop: vS(8),
    marginBottom: vS(8),
  },
  iconContainer: {
    marginRight: hS(12),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: mS(14),
    fontWeight: '700',
    marginBottom: vS(2),
  },
  subtitle: {
    fontSize: mS(12),
    lineHeight: vS(16),
  },
  button: {
    paddingHorizontal: hS(12),
    paddingVertical: vS(8),
    borderRadius: mS(8),
    marginLeft: hS(12),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: mS(12),
    fontWeight: '700',
  },
});

export default LowBalanceBanner;
