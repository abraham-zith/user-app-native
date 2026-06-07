import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ToastAndroid,
  StyleSheet,
  TextInput,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car, GoogleIcon, MailIcon } from '../../assets/svg';
import { Styles } from '../../lib/styles';
import colors from '../../constant/colors';
import fonts from '../../constant/fonts';
import DropDown from '../../Components/DropDown';
import { countryList } from '../../constant/country';
import { useDispatch } from 'react-redux';
import { SignUpScreen_Nav } from '../../Navigations/navigations';
import Button from '../../Components/Button';
import { hS, vS, mS } from '../../lib/responsive';
import { useLogin } from '../../service/auth/login';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';

const LoginScreen: React.FC<any> = ({ navigation }) => {
  const { colors: appColors, isDark } = useAppTheme();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [countryCode, setCountryCode] = useState<string>('+91');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const { handleRequestOtp, loading } = useLogin(navigation);

  // ✅ Validate and send OTP with country code prefixed
  const handleSendOtp = useCallback(async () => {
    const trimmed = mobileNumber.trim();

    if (!trimmed) {
      ToastAndroid.show('Enter Mobile Number', ToastAndroid.SHORT);
      return;
    }

    if (trimmed.length < 10) {
      ToastAndroid.show('Enter a valid Mobile Number', ToastAndroid.SHORT);
      return;
    }

    // ✅ Pass full number with country code
    // const fullPhoneNumber = `${countryCode}${trimmed}`;
    const fullPhoneNumber = `${trimmed}`;
    await handleRequestOtp(fullPhoneNumber);

  }, [mobileNumber, countryCode, handleRequestOtp]);

  const renderItem = useCallback(({ item }: any) => (
    <View style={[localStyles.dropdownItem, { backgroundColor: appColors.card }]}>
      <Text style={[fonts.regular, { fontSize: mS(16), color: appColors.text }]}>{item.label}</Text>
      <Text style={[fonts.regular, localStyles.countryName, { color: appColors.lightTextColor }]}>{item.name}</Text>
    </View>
  ), [appColors]);

  return (
    <View style={[
      localStyles.mainContainer,
      { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: appColors.background }
    ]}>
      <View style={Styles.flex}>
        {/* PREMIUM HEADER SECTION */}
        <View style={localStyles.headerSection}>
          <Text style={[localStyles.welcomeText, { color: appColors.primary }]}>Welcome Back</Text>
          <Text style={[localStyles.titleText, { color: appColors.text }]}>Ready for a Ride?</Text>
          <Text style={[localStyles.descriptionText, { color: appColors.lightTextColor }]}>
            Log in to book your cab, rent a car, or hire a driver instantly.
          </Text>
        </View>

        <View style={localStyles.fieldContainer}>
          <Text style={[localStyles.fieldLabel, { color: appColors.text }]}>Mobile Number</Text>
          <View style={[localStyles.mobileInputWrapper, { backgroundColor: appColors.card, borderColor: appColors.border, shadowColor: isDark ? '#000' : '#64748B' }]}>
            <DropDown
              data={countryList}
              renderItem={renderItem}
              value={countryCode}
              onSelect={setCountryCode}
              renderTrigger={(selectedItem) => (
                <View style={localStyles.countryPickerTrigger}>
                  <FastImage
                    source={{ 
                      uri: `https://flagcdn.com/w40/${selectedItem?.code?.toLowerCase() || 'in'}.png`,
                      priority: FastImage.priority.normal 
                    }}
                    style={localStyles.flagIcon}
                  />
                  <Text style={[localStyles.countryText, { color: appColors.text }]}>{selectedItem?.value || '+91'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={mS(20)} color={appColors.lightTextColor} />
                </View>
              )}
            />
            <View style={[localStyles.verticalDivider, { backgroundColor: appColors.divider }]} />

            <TextInput
              placeholder="1234567890"
              placeholderTextColor={appColors.lightTextColor}
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              style={[localStyles.phoneInput, { color: appColors.text }]}
              maxLength={10}
            />
          </View>
        </View>

        {/* Send OTP Button */}
        <Button
          onPress={handleSendOtp} // ✅ use local validated handler
          disabled={loading || mobileNumber.trim().length < 10} // ✅ disable if invalid
          style={[
            localStyles.primaryButton,
            { backgroundColor: appColors.button, shadowColor: appColors.button },
            (loading || mobileNumber.trim().length < 10) && [localStyles.disabledButton, { backgroundColor: isDark ? '#334155' : '#94A3B8' }], // ✅ visual feedback
          ]}
        >
          <Text style={localStyles.primaryButtonText}>
            {loading ? 'Sending...' : 'Send OTP'}
          </Text>
        </Button>

        {/* Divider */}
        <View style={localStyles.dividerContainer}>
          <View style={[localStyles.line, { backgroundColor: appColors.divider }]} />
          <Text style={[localStyles.orText, { color: appColors.lightTextColor }]}>or</Text>
          <View style={[localStyles.line, { backgroundColor: appColors.divider }]} />
        </View>

        {/* SOCIAL LOGIN SECTION */}
        <View style={localStyles.socialSection}>
          <TouchableOpacity 
            style={[localStyles.socialCard, { backgroundColor: appColors.card, borderColor: appColors.border }]}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <View style={[localStyles.socialIconCircle, { backgroundColor: appColors.background }]}>
              <GoogleIcon width={mS(22)} height={mS(22)} />
            </View>
            <Text style={[localStyles.socialCardText, { color: appColors.text }]}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[localStyles.socialCard, { backgroundColor: appColors.card, borderColor: appColors.border }]}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <View style={[localStyles.socialIconCircle, { backgroundColor: isDark ? appColors.background : '#F1F5F9' }]}>
              <MailIcon width={mS(22)} height={mS(22)} />
            </View>
            <Text style={[localStyles.socialCardText, { color: appColors.text }]}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER LINK */}
        <View style={localStyles.footer}>
          <Text style={[localStyles.footerText, { color: appColors.lightTextColor }]}>
            New to V-Drive?{' '}
            <Text
              style={[localStyles.signUpLink, { color: appColors.primary }]}
              onPress={() => navigation.navigate(SignUpScreen_Nav)}
            >
              Create Account
            </Text>
          </Text>
        </View>
      </View>

      {/* Decorative Car */}
      <Car
        width={hS(200)}
        height={vS(100)}
        style={localStyles.carDecoration}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSection: {
    marginTop: vS(30),
    marginBottom: vS(24),
    paddingHorizontal: hS(24),
  },
  welcomeText: {
    fontSize: mS(14),
    fontWeight: '700',
    color: colors.button,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: vS(10),
  },
  titleText: {
    fontSize: mS(32),
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: mS(40),
    marginBottom: vS(12),
  },
  descriptionText: {
    fontSize: mS(15),
    color: '#64748B',
    lineHeight: vS(22),
    fontWeight: '500',
  },
  fieldContainer: {
    paddingHorizontal: hS(24),
    marginBottom: vS(24),
  },
  fieldLabel: {
    fontSize: mS(14),
    fontWeight: '700',
    color: '#334155',
    marginBottom: vS(10),
    marginLeft: hS(4),
  },
  mobileInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: mS(16),
    height: vS(60),
    paddingHorizontal: hS(16),
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  countryPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  flagIcon: {
    width: hS(28),
    height: vS(18),
    borderRadius: 4,
    marginRight: hS(10),
  },
  countryText: {
    fontSize: mS(16),
    fontWeight: '700',
    color: '#1E293B',
    marginRight: hS(6),
  },
  verticalDivider: {
    width: 1,
    height: vS(24),
    backgroundColor: '#E2E8F0',
    marginHorizontal: hS(16),
  },
  phoneInput: {
    flex: 1,
    fontSize: mS(16),
    fontWeight: '700',
    color: '#1E293B',
    paddingVertical: 0,
  },
  primaryButton: {
    marginHorizontal: hS(24),
    height: vS(56),
    borderRadius: mS(18),
    backgroundColor: colors.button,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.button,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: vS(24),
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: mS(18),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hS(24),
    marginBottom: vS(24),
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    paddingHorizontal: hS(16),
    fontSize: mS(14),
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  socialSection: {
    paddingHorizontal: hS(24),
    gap: vS(12),
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: mS(18),
    height: vS(58),
    paddingHorizontal: hS(16),
  },
  socialIconCircle: {
    width: mS(36),
    height: mS(36),
    borderRadius: mS(12),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hS(16),
  },
  socialCardText: {
    fontSize: mS(15),
    fontWeight: '700',
    color: '#1E293B',
  },
  footer: {
    marginTop: vS(30),
    alignItems: 'center',
  },
  footerText: {
    fontSize: mS(15),
    color: '#64748B',
    fontWeight: '500',
  },
  signUpLink: {
    color: colors.button,
    fontWeight: '800',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: mS(12),
    alignItems: 'center',
  },
  countryName: {
    fontSize: mS(12),
    color: '#94A3B8',
  },
  carDecoration: {
    position: 'absolute',
    bottom: vS(-30),
    right: hS(-60),
    opacity: 0.8,
  },
});

export default LoginScreen;