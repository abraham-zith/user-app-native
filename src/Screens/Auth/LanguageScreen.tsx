import {ToastAndroid, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import {Styles} from '../../lib/styles';
import {Text} from '../../Components';
import {useTheme} from '@react-navigation/native';
import {languagesList} from '../../constant/language';
import Button from '../../Components/Button';
import {WelcomeScreen_Nav} from '../../Navigations/navigations';
import {useDispatch} from 'react-redux';
import {setUser} from '../../redux/userSlice';

const LanguageScreen: React.FC<ScreenProps> = ({navigation}) => {
  const {fonts, colors} = useTheme();
  const [lang, setLang] = useState('en');
  const dispatch = useDispatch();

  const handleContinue = useCallback(() => {
    if (lang) {
      dispatch(setUser({language: lang}));
      ToastAndroid.show('language Updated Successfully', ToastAndroid.SHORT);
      navigation.navigate(WelcomeScreen_Nav);
    }
  }, []);
  return (
    <View
      style={[Styles.flex, Styles.p4, {backgroundColor: colors.background}]}>
      <View
        style={[
          Styles.flex,
          Styles.alignItemsCenter,
          Styles.justifyContentCenter,
        ]}>
        {/* <CarLogo /> */}
        <Text>Logo</Text>
      </View>
      <View
        style={[
          Styles.flex,
          Styles.m4,
          Styles.mb8,
          Styles.justifyContentSpaceBetween,
        ]}>
        <View>
          <Text style={[Styles.textCenter, Styles.fs18, fonts.medium]}>
            Choose the Language
          </Text>
          {/* <DropDown
            data={languagesList.map(x => ({
              label: `${x.label} (${x.nativeName})`,
              value: x.value,
            }))}
            placeHolde="Find The Language"
            containerStyle={Styles.my4}
            value={lang}
            onSelect={item => setLang(item)}
          /> */}
        </View>
        <Button onPress={handleContinue}>Continue</Button>
      </View>
    </View>
  );
};

export default LanguageScreen;
