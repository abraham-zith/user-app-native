import { View, Text } from 'react-native'
import React from 'react'
import { Styles } from '../../lib/styles'
import colors from '../../constant/colors'
import fonts from '../../constant/fonts'
import { Car, Logo, SteeringWheels } from '../../assets/svg'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import SwipeButton from '../../Components/SwipeButton'
import { SignUpScreen_Nav, TabNavigation_Nav } from '../../Navigations/navigations'
import { OnboardingStatus } from '../../enums/user.enum'
import { useAppTheme } from '../../hooks/useAppTheme'

// ✅ No fetch, no checkSession, no useEffect
// App.tsx handles all session validation
const WelcomeScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { colors: appColors, isDark } = useAppTheme();
  const user = useSelector((state: RootState) => state.userSlice.user);

  const handleGetStarted = () => {
    if (!user) {
      navigation.navigate('LoginScreen');
      return;
    }

    const onboarding_status = user?.onboarding_status?.toLowerCase();
    const status = user?.status?.toLowerCase();

    if (
      onboarding_status === OnboardingStatus.PROFILE_COMPLETED &&
      status === 'active'
    ) {
      navigation.replace(TabNavigation_Nav);
      return;
    }

    if (onboarding_status === OnboardingStatus.PHONE_VERIFIED) {
      navigation.replace(SignUpScreen_Nav);
      return;
    }

    navigation.navigate('LoginScreen');
  };

  return (
    <View style={[
      Styles.flex,
      Styles.p4,
      { backgroundColor: appColors.background, flexDirection: 'column' }
    ]}>
      <View style={[
        Styles.justifyContentCenter,
        Styles.alignItemsCenter,
        { flex: 10 }
      ]}>
        <Logo />
        <Text style={[
          Styles.fs16,
          Styles.mt2,
          fonts.light,
          { color: appColors.text, textAlign: 'center' }
        ]}>
          Ride Your Way with{' '}
          <Text style={{ color: appColors.primary, fontWeight: '400' }}>
            VDrive
          </Text>
        </Text>
        <Car />
      </View>

      <View style={[Styles.flex, Styles.justifyContentFlexEnd, Styles.mb5]}>
        <SwipeButton
          title="Slide to Get Started"
          onSwipeSuccess={handleGetStarted}
          Icon={<SteeringWheels width={34} height={34} />}
          railColor={isDark ? appColors.button : appColors.button}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
};

export default WelcomeScreen;