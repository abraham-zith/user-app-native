import { View, Text, TouchableOpacity, ToastAndroid } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Styles } from '../../lib/styles';
import { useTheme } from '@react-navigation/native';
import { Car, LeftArrow } from '../../assets/svg';
import { Input, OTPInput } from '../../Components';
import { countryList } from '../../constant/country';
// import Button from '../../Components/Button';
import { OTPScreen_Nav } from '../../Navigations/navigations';
import { useSendOtpMutation } from '../../service/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setUser } from '../../redux/userSlice';
// import {Button, InputField} from 'rn-ui-library';

const WelcomeScreen2: React.FC<ScreenProps> = ({ navigation }) => {
  const { colors, fonts } = useTheme();
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.userSlice.user);
  const [sendOtpApi] = useSendOtpMutation();
  const [name, setName] = useState('');

  const renderItem = useCallback(
    ({
      item,
      index,
    }: {
      item: {
        label: string;
        value: string;
        [x: string]: any;
      };
      index: number;
    }) => {
      return (
        <View style={[Styles.flexRow, Styles.justifyContentCenter]}>
          <Text>{item.label}</Text>
          <Text style={[Styles.flex, Styles.textCenter]}>{item.name}</Text>
        </View>
      );
    },
    [],
  );

  const handleContinue = useCallback(async () => {
    if (mobileNumber && countryCode) {
      const body = {
        phoneNumber: countryCode + mobileNumber,
      };
      // const response = await sendOtpApi(body);
      // console.log(response);
      dispatch(setUser({ ...user, phone: countryCode + mobileNumber }));
      ToastAndroid.show('OTP Send Successfully', ToastAndroid.SHORT);
      navigation.navigate(OTPScreen_Nav);
    } else {
      ToastAndroid.show('Enter Mobile Number', ToastAndroid.SHORT);
    }
  }, [mobileNumber, countryCode]);

  return (
    <View
      style={[
        Styles.flex,
        Styles.p4,
        Styles.justifyContentCenter,
        { backgroundColor: colors.background },
      ]}>
      <View style={Styles.pl20}>
        <Text style={[fonts.bold, Styles.fs42, { color: colors.primary }]}>
          Welcome
        </Text>
        <Text style={[fonts.regular, Styles.fs14, { color: colors.border }]}>
          continue with your mobile number
        </Text>
      </View>

      <View style={[Styles.alignSelfCenter]}>
        <Car />
      </View>

      <Text
        style={[
          fonts.regular,
          Styles.fs18,
          Styles.textCenter,
          { marginBottom: 20 },
        ]}>
        Enter mobile number
      </Text>

      <View style={[Styles.flexRow, Styles.cg4, Styles.mb8]}>
        <Input
          containerStyle={[Styles.flex]}
          value={mobileNumber}
          keyboardType="phone-pad"
          onChangeText={setMobileNumber}
        />
      </View>

      {/* <InputField
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        // disabled={true}
        type="password"
        label="Name"
      />

      <Button
        style={{backgroundColor: colors.primary}}
        onPress={handleContinue}
        title="continue"
        size="medium"
        // disabled={true}
      /> */}
    </View>
  );
};

export default WelcomeScreen2;
