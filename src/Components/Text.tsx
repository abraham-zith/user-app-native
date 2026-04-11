import {TextProps, View, Text as _Text} from 'react-native';
import React from 'react';
import {useTheme} from '@react-navigation/native';

const Text: React.FC<TextProps> = ({style, ...textProps}) => {
  const {colors, fonts} = useTheme();
  return (
    <_Text
      style={[fonts.regular, {color: colors.text}, style]}
      {...textProps}
    />
  );
};

export default React.memo(Text);
