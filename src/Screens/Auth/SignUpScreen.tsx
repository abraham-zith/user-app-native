import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';

// --- Assets & Constants ---
import { Car, CheckedIcon, UnCheckedIcon } from '../../assets/svg';
import { Styles } from '../../lib/styles';
import colors from '../../constant/colors';
import fonts from '../../constant/fonts';
import { OTPScreen_Nav, TabNavigation_Nav } from '../../Navigations/navigations';
import { hS, vS, mS } from '../../lib/responsive'; // Assuming these are your responsive helpers

// --- Components ---
import Button from '../../Components/Button';
import { Input, DropDown } from '../../Components';
import DateTimePickerComponent from '../../Components/DateTimePicker';
import { countryList } from '../../constant/country';

// --- Redux & API ---
import { setUser } from '../../redux/userSlice';
import { getDeviceId } from '../../service/utils/device';
import { useSendOtpMutation, useSignUpMutation, useUpdateUserMutation } from '../../service/userApi';
import { useRequestOtpMutation } from '../../service/authApi';
import { RootState } from '../../redux/store';
import { OnboardingStatus } from '../../enums/user.enum';
import { useLogin } from '../../service/auth/login';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUpScreen: React.FC<any> = ({ navigation }) => {
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [signUp, { isLoading: signUpLoading }] = useSignUpMutation();
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();
  const [requestOtp] = useRequestOtpMutation();
  const { handleRequestOtp } = useLogin(navigation);

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { colors: appColors, isDark } = useAppTheme();
  const localuser = useSelector((state: RootState) => state.userSlice.user);

  // --- State ---
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState(localuser?.phone_number || '');
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [dob, setDOB] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [deviceid, setDeviceid] = useState('');
  const [gender, setGender] = useState('male');
  const [showValidation, setShowValidation] = useState(false);

  const options = [
    { label: 'Male', value: 'male', icon: 'gender-male' },
    { label: 'Female', value: 'female', icon: 'gender-female' },
    { label: 'Other', value: 'other', icon: 'gender-non-binary' },
  ];

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);

  useEffect(() => {
    const loadId = async () => {
      const DeviceId = await getDeviceId();
      setDeviceid(DeviceId);
    };
    loadId();
  }, []);

  // --- Logic ---
  const handleSignUp = async () => {
    if (!firstName || !mobileNumber || !mobileValidation.valid || !EMAIL_REGEX.test(email) || !dob || !agreedToTerms) {
      setShowValidation(true);
      if (!agreedToTerms) {
        ToastAndroid.show("Please agree to the Terms & Conditions.", ToastAndroid.SHORT);
      } else {
        ToastAndroid.show("Please fill all required fields correctly.", ToastAndroid.SHORT);
      }
      return;
    }

    const userId = localuser?.id;
    if (!userId) {
      const payload = {
        first_name: firstName,
        last_name: lastName || '',
        phone_number: mobileNumber,
        role: 'customer',
        device_id: deviceid,
        email: email.trim(),
        date_of_birth: dob || null,
        gender: gender,
        onboarding_status: OnboardingStatus.PROFILE_COMPLETED,
        // phone_verified: false,
      }
      const response = await signUp(payload).unwrap();
      if (response.success) {
        ToastAndroid.show('Profile Updated Successfully', ToastAndroid.SHORT);
        // dispatch(setUser(response.data));
        // navigation.replace(TabNavigation_Nav);
        // const res = await handleRequestOtp(mobileNumber, false, false);
        // console.log("res", res);
        // if(res.success){
        //   ToastAndroid.show('OTP Sent Successfully', ToastAndroid.SHORT);  
        // }
        const res = await requestOtp({
          phone_number: mobileNumber,
          role: 'customer',          // ✅ consistent role
          device_id: deviceid,
          allow_new_device: false,
        }).unwrap();
        if (res.success) {
          ToastAndroid.show('OTP Sent Successfully', ToastAndroid.SHORT);
          navigation.navigate(OTPScreen_Nav, {
            OTPdata: res.data,
            userData: { phone_number: mobileNumber }, // ✅ only phone_number needed here
            device_id: deviceid,
          });
        }
      }
    }
    else {
      const payload = {
        id: userId,
        first_name: firstName,
        last_name: lastName || '',
        phone_number: mobileNumber,
        role: 'customer',
        device_id: deviceid,
        email: email.trim(),
        date_of_birth: dob || null,
        gender: gender,
        onboarding_status: OnboardingStatus.COMPLETED,
      };

      try {
        const response = await updateUser(payload).unwrap();
        if (response.success) {
          ToastAndroid.show('Profile Updated Successfully', ToastAndroid.SHORT);
          dispatch(setUser(response.data));
          navigation.replace(TabNavigation_Nav);
        }
      } catch (err: any) {
        ToastAndroid.show(err?.data?.message || 'Update failed', ToastAndroid.SHORT);
      }
    }
  };

  const formatDatePretty = (dateInput: string): string => {
    if (!dateInput) return '';
    const [yyyy, mm, dd] = dateInput.split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  const validateMobile = (number: string, code: string) => {
    if (!number) return { valid: false, message: "Mobile number is required" };

    // India specific
    if (code === '+91') {
      if (number.startsWith('0')) return { valid: false, message: "Mobile number cannot start with zero" };
      if (number.length !== 10) return { valid: false, message: "Mobile number must be 10 digits" };
      return { valid: true };
    }

    // USA / Canada
    if (code === '+1') {
      if (number.length !== 10) return { valid: false, message: "Mobile number must be 10 digits" };
      return { valid: true };
    }

    // UK
    if (code === '+44') {
      if (number.length !== 10) return { valid: false, message: "Mobile number must be 10 digits" };
      return { valid: true };
    }

    // Default E.164 check (7-15 digits)
    if (number.length < 7 || number.length > 15) {
      return { valid: false, message: "Mobile number must be 7-15 digits" };
    }

    return { valid: true };
  };

  const mobileValidation = validateMobile(mobileNumber, countryCode);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: appColors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- PREMIUM HEADER SECTION --- */}
        <View style={styles.headerContainer}>
          <Text style={[styles.welcomeText, { color: appColors.primary }]}>Welcome to V-Drive</Text>
          <Text style={[styles.titleText, { color: appColors.text }]}>Create Your Profile</Text>
          <Text style={[styles.descriptionText, { color: appColors.lightTextColor }]}>
            Join our community for a seamless travel experience. Just a few more details to get you started!
          </Text>
        </View>

        <FormInput
          required
          label="First Name"
          placeholder="First name"
          placeholderTextColor={appColors.lightTextColor}
          value={firstName}
          onChangeText={setFirstName}
          icon="account-outline"
          appColors={appColors}
          hasError={showValidation && !firstName}
        />

        <FormInput
          label="Last Name"
          placeholder="Last name"
          placeholderTextColor={appColors.lightTextColor}
          value={lastName}
          onChangeText={setLastName}
          icon="account-badge-outline"
          appColors={appColors}
        />

        {/* Mobile Number Input */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: appColors.text }]}>Mobile Number</Text>
          <View style={[styles.inputWrapper, {
            backgroundColor: appColors.card,
            borderColor: (showValidation && (!mobileValidation.valid)) ? '#EF4444' : appColors.border,
            shadowColor: isDark ? '#000' : '#64748B'
          }]}>
            <DropDown
              data={countryList}
              value={countryCode}
              onSelect={setCountryCode}
              renderTrigger={(selectedItem) => (
                <View style={styles.countryPickerTrigger}>
                  <Image
                    source={{
                      uri: `https://flagcdn.com/w40/${selectedItem?.code?.toLowerCase() || 'in'}.png`
                    }}
                    style={styles.flagIcon}
                  />
                  <Text style={[styles.countryCode, { color: appColors.text }]}>{selectedItem?.value || '+91'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={mS(20)} color={appColors.lightTextColor} />
                </View>
              )}
            />
            <View style={[styles.verticalDivider, { backgroundColor: appColors.divider }]} />
            <TextInput
              style={[styles.textInput, { color: appColors.text }]}
              placeholder="1234567890"
              placeholderTextColor={appColors.lightTextColor}
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={(text) => setMobileNumber(text.replace(/[^0-9]/g, ""))}
              maxLength={10}
            />
          </View>
        </View>

        {/* Email Input */}
        <FormInput
          required
          label="Email Address"
          placeholder="Email Address"
          placeholderTextColor={appColors.lightTextColor}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          icon="email-outline"
          appColors={appColors}
          hasError={showValidation && !EMAIL_REGEX.test(email)}
        />

        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: appColors.text }]}>Select Gender</Text>
          <View style={[styles.segmentedControl, { backgroundColor: appColors.divider }]}>
            {options.map((item) => {
              const isSelected = gender === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.segmentButton,
                    isSelected && [styles.segmentButtonActive, { backgroundColor: appColors.button }]
                  ]}
                  onPress={() => setGender(item.value)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={mS(18)}
                    color={isSelected ? '#FFFFFF' : '#64748B'}
                  />
                  <Text style={[
                    styles.segmentText,
                    isSelected && styles.segmentTextActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* DOB Input */}
        <View style={styles.fieldContainer}>
          <View style={styles.fieldLabelRow}>
            <Text style={[styles.fieldLabel, { color: appColors.text }]}>Date of Birth</Text>
            <Text style={styles.fieldAsterisk}>*</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowDatePicker(true)}
            style={[styles.premiumPickerContainer, {
              backgroundColor: appColors.card,
              borderColor: (showValidation && !dob) ? '#EF4444' : appColors.border
            }]}
          >
            <MaterialCommunityIcons name="calendar-month-outline" size={mS(20)} color={appColors.lightTextColor} />
            <Text style={[styles.premiumPickerText, { color: dob ? appColors.text : appColors.lightTextColor }]}>
              {dob ? formatDatePretty(dob) : "Select Your Birthday"}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={mS(20)} color={appColors.lightTextColor} />
          </TouchableOpacity>
        </View>


        {/* Terms Section */}
        <View style={styles.termsRow}>
          <TouchableOpacity onPress={() => setAgreedToTerms(!agreedToTerms)}>
            {agreedToTerms ? <CheckedIcon width={mS(18)} height={mS(18)} fill={appColors.primary} /> : <UnCheckedIcon width={mS(18)} height={mS(18)} stroke={appColors.lightTextColor} />}
          </TouchableOpacity>
          <Text style={[styles.termsText, { color: appColors.lightTextColor }]}>
            By signing up, you agree to VDrive's
            <Text style={[fonts.bold, { color: appColors.text }]}> Terms & Conditions </Text>
            and <Text style={[fonts.bold, { color: appColors.text }]}>Privacy Policy</Text>.
          </Text>
        </View>

        {showValidation && (
          <View style={{ marginBottom: vS(20), alignItems: 'center' }}>
            <Text style={{ color: '#EF4444', fontSize: mS(14), fontWeight: '700', textAlign: 'center' }}>
              {(!firstName || !mobileNumber || !email || !dob) ? "Please fill all required fields" :
                (!mobileValidation.valid) ? mobileValidation.message :
                  (!EMAIL_REGEX.test(email)) ? "Invalid email format" : ""}
            </Text>
          </View>
        )}

        {/* Action Button */}
        <Button
          onPress={handleSignUp}
          loading={updateLoading || otpLoading}
          style={[styles.signUpButton, { backgroundColor: appColors.button, shadowColor: appColors.button }]}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </Button>

      </ScrollView>

      {/* Decorative Car SVG */}
      <View pointerEvents="none" style={styles.carPosition}>
        <Car width={hS(350)} height={vS(150)} />
      </View>

      {showDatePicker && (
        <DateTimePickerComponent
          value={new Date()}
          mode={'date'}
          isVisible={showDatePicker}
          onChange={(date: Date) => {
            const d = new Date(date);
            setDOB(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
            setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
          maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
          minimumDate={minDate}
        />
      )}
    </View>
  );
};

const FormInput = ({ label, icon, required, appColors, hasError, ...props }: any) => (
  <View style={styles.fieldContainer}>
    {label && (
      <View style={styles.fieldLabelRow}>
        <Text style={[styles.fieldLabel, { color: appColors.text }]}>{label}</Text>
        {required && <Text style={styles.fieldAsterisk}>*</Text>}
      </View>
    )}
    <View style={[styles.inputWrapper, {
      backgroundColor: appColors.card,
      borderColor: hasError ? '#EF4444' : appColors.border
    }]}>
      <View style={[styles.iconBox, { backgroundColor: appColors.background }]}>
        <MaterialCommunityIcons name={icon} size={mS(20)} color={hasError ? '#EF4444' : appColors.lightTextColor} />
      </View>
      <TextInput
        placeholderTextColor={appColors.lightTextColor}
        style={[styles.textInput, { color: appColors.text }]}
        {...props}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: hS(24),
    paddingBottom: vS(300),
  },
  headerContainer: {
    marginTop: vS(40),
    marginBottom: vS(20),
  },
  welcomeText: {
    fontSize: mS(14),
    fontWeight: '700',
    color: colors.button,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: vS(8),
  },
  titleText: {
    fontSize: mS(32),
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: mS(40),
    marginBottom: vS(10),
  },
  descriptionText: {
    fontSize: mS(15),
    color: '#64748B',
    lineHeight: vS(22),
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: vS(14),
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vS(4),
    marginLeft: hS(4),
  },
  fieldLabel: {
    fontSize: mS(14),
    fontWeight: '700',
    color: '#334155',
  },
  fieldAsterisk: {
    color: '#EF4444',
    fontSize: mS(14),
    marginLeft: hS(4),
  },
  inputWrapper: {
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
  iconBox: {
    width: mS(40),
    height: mS(40),
    borderRadius: mS(12),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hS(12),
  },
  textInput: {
    flex: 1,
    fontSize: mS(16),
    fontWeight: '700',
    color: '#1E293B',
    paddingVertical: 0,
  },
  countryPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    width: hS(28),
    height: vS(18),
    borderRadius: 4,
    marginRight: hS(10),
  },
  countryCode: {
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
  premiumPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: mS(16),
    paddingHorizontal: hS(16),
    height: vS(54),
  },
  premiumPickerText: {
    flex: 1,
    fontSize: mS(15),
    fontWeight: '600',
    marginLeft: hS(10),
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: mS(14),
    padding: 2,
    marginTop: vS(4),
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vS(10),
    borderRadius: mS(12),
  },
  segmentButtonActive: {
    backgroundColor: colors.button,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: mS(13),
    fontWeight: '700',
    color: '#64748B',
    marginLeft: hS(6),
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vS(10),
    marginBottom: vS(24),
    paddingHorizontal: hS(4),
  },
  termsText: {
    flex: 1,
    fontSize: mS(13),
    color: '#64748B',
    marginLeft: hS(12),
    lineHeight: vS(20),
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: colors.button,
    height: vS(56),
    borderRadius: mS(18),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.button,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  signUpButtonText: {
    fontSize: mS(18),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  carPosition: {
    position: 'absolute',
    bottom: vS(-30),
    right: hS(-60),
    opacity: 0.8,
  },
});

export default SignUpScreen;