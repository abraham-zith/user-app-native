import React from 'react';
import {
  View,
  TextInputProps,
  TextInput,
  TextStyle,
  StyleSheet,
  ViewStyle,
  Text,
} from 'react-native';

import { Styles } from '../lib/styles';
import fonts from '../constant/fonts';
import { useAppTheme } from '../hooks/useAppTheme';

interface InputProps extends TextInputProps {
  label?: string;
  labelStyle?: TextStyle | TextStyle[];
  containerStyle?: ViewStyle | ViewStyle[];
  LeadingAccessory?: React.ReactNode;
  TailingAccessory?: React.ReactNode;
  error?: string;
}
const Input: React.FC<InputProps> = ({
  label,
  labelStyle,
  containerStyle,
  LeadingAccessory,
  TailingAccessory,
  error,
  ...textInputprops
}) => {
  const { colors } = useAppTheme();
  return (
    <View style={containerStyle}>
      {label ? (
        <Text
          style={[
            fonts.medium,
            Styles.mb2,
            { color: colors.primary },
            labelStyle,
          ]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          Styles.flexRow,
          Styles.bw1,
          Styles.br2,
          Styles.px2,
          Styles.alignItemsCenter,
          styles.container,
          { borderColor: colors.searchBorder },
        ]}>
        {LeadingAccessory ? LeadingAccessory : null}
        <TextInput
          style={[
            Styles.flex,
            Styles.px2,
            styles.textInput,
            fonts.regular,
            { color: colors.text },
          ]}
          placeholder={label ? `Enter ${label}` : ''}
          placeholderTextColor={colors.lightTextColor}
          {...textInputprops}
        />
        {TailingAccessory ? TailingAccessory : null}
      </View>
      {error ? (
        <Text style={[fonts.regular, Styles.mt2, { color: colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 53,
  },
  textInput: {
    height: '100%',
  },
});

export default React.memo(Input);
