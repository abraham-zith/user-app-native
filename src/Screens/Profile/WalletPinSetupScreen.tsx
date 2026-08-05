import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useSetupWalletPinMutation } from '../../service/userApi';
import { hS, vS, mS } from '../../lib/responsive';
import colors from '../../constant/colors';

const PIN_LENGTH = 4;

const WalletPinSetupScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { colors: appColors, isDark } = useAppTheme();
  const user = useSelector((state: RootState) => state.userSlice.user);
  const userId = user?.id || '';

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [isLoading, setIsLoading] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);

  const [setupWalletPin] = useSetupWalletPinMutation();

  const currentPin = step === 'enter' ? pin : confirmPin;
  const setCurrentPin = step === 'enter' ? setPin : setConfirmPin;

  const handleDigitPress = (digit: string) => {
    if (currentPin.length >= PIN_LENGTH) return;
    setCurrentPin(prev => prev + digit);
  };

  const handleDelete = () => {
    setCurrentPin(prev => prev.slice(0, -1));
  };

  const handleNext = async () => {
    if (currentPin.length < PIN_LENGTH) return;

    if (step === 'enter') {
      setStep('confirm');
      return;
    }

    // Confirm step — verify match
    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'The PINs you entered do not match. Please try again.');
      setPin('');
      setConfirmPin('');
      setStep('enter');
      return;
    }

    setIsLoading(true);
    try {
      await setupWalletPin({ id: userId, pin }).unwrap();
      navigation.goBack();
      Alert.alert('Success', 'Wallet PIN has been set successfully!');
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message || 'Failed to setup PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDots = () => {
    return Array.from({ length: PIN_LENGTH }).map((_, i) => {
      const filled = i < currentPin.length;
      return (
        <Animated.View
          key={i}
          entering={FadeInDown.delay(i * 60).duration(300)}
          style={[
            styles.dot,
            {
              backgroundColor: filled
                ? isDark ? '#60A5FA' : colors.button
                : isDark ? '#374151' : '#E2E8F0',
              borderColor: filled
                ? isDark ? '#60A5FA' : colors.button
                : isDark ? '#4B5563' : '#CBD5E1',
              transform: [{ scale: filled ? 1.15 : 1 }],
            },
          ]}
        />
      );
    });
  };

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'DEL'],
  ];

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={mS(22)} color={appColors.text} />
        </TouchableOpacity>
      </View>

      <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
        {/* Lock Icon */}
        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(96,165,250,0.15)' : 'rgba(30,64,175,0.08)' }]}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={mS(40)}
            color={isDark ? '#60A5FA' : colors.button}
          />
        </View>

        <Text style={[styles.title, { color: appColors.text }]}>
          {step === 'enter' ? 'Set Wallet PIN' : 'Confirm Wallet PIN'}
        </Text>
        <Text style={[styles.subtitle, { color: appColors.secondaryText }]}>
          {step === 'enter'
            ? 'Create a 4-digit PIN to secure wallet transactions'
            : 'Re-enter your PIN to confirm'}
        </Text>

        {/* PIN Dots */}
        <View style={styles.dotsRow}>{renderDots()}</View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: colors.button }]} />
          <View style={[styles.stepDot, { backgroundColor: step === 'confirm' ? colors.button : (isDark ? '#374151' : '#E2E8F0') }]} />
        </View>
      </Animated.View>

      {/* Keypad */}
      <Animated.View entering={FadeInUp.delay(150).duration(500)} style={[styles.keypad, { paddingBottom: insets.bottom + vS(12) }]}>
        {keypadRows.map((row, ri) => (
          <View key={ri} style={styles.keyRow}>
            {row.map((key, ki) => {
              if (key === '') return <View key={ki} style={styles.keyBtn} />;
              if (key === 'DEL') {
                return (
                  <TouchableOpacity
                    key={ki}
                    style={[styles.keyBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="backspace-outline" size={mS(22)} color={appColors.text} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={ki}
                  style={[styles.keyBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC' }]}
                  onPress={() => handleDigitPress(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: appColors.text }]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            {
              backgroundColor: currentPin.length === PIN_LENGTH ? colors.button : (isDark ? '#374151' : '#CBD5E1'),
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleNext}
          disabled={currentPin.length < PIN_LENGTH || isLoading}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>
            {isLoading ? 'Saving...' : step === 'enter' ? 'Continue' : 'Set PIN'}
          </Text>
          {!isLoading && (
            <MaterialCommunityIcons name="arrow-right" size={mS(20)} color="#FFF" style={{ marginLeft: hS(8) }} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default WalletPinSetupScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: hS(16),
    paddingBottom: vS(8),
  },
  backBtn: {
    width: mS(40),
    height: mS(40),
    borderRadius: mS(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: vS(24),
  },
  iconCircle: {
    width: mS(88),
    height: mS(88),
    borderRadius: mS(44),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vS(24),
  },
  title: {
    fontSize: mS(24),
    fontWeight: '800',
    marginBottom: vS(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: mS(14),
    textAlign: 'center',
    paddingHorizontal: hS(40),
    lineHeight: vS(20),
    marginBottom: vS(36),
  },
  dotsRow: {
    flexDirection: 'row',
    gap: hS(16),
    marginBottom: vS(16),
  },
  dot: {
    width: mS(20),
    height: mS(20),
    borderRadius: mS(10),
    borderWidth: 2,
  },
  stepRow: {
    flexDirection: 'row',
    gap: hS(8),
    marginTop: vS(8),
  },
  stepDot: {
    width: mS(8),
    height: mS(8),
    borderRadius: mS(4),
  },
  keypad: {
    paddingHorizontal: hS(24),
    paddingTop: vS(8),
    gap: vS(8),
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: hS(12),
  },
  keyBtn: {
    width: mS(80),
    height: mS(64),
    borderRadius: mS(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: mS(24),
    fontWeight: '700',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: vS(56),
    borderRadius: mS(18),
    marginTop: vS(8),
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: mS(17),
    fontWeight: '800',
  },
});
