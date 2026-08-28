import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Styles } from '../lib/styles';
import { useAppTheme } from '../hooks/useAppTheme';

interface OTPInputProps {
  numberOfDigits?: number;
  onChangeText?: (value: string) => void;
  value?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  onSubmitEditing?: any;
  editable?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  numberOfDigits = 4,
  onChangeText = () => { },
  value = '',
  containerStyle,
  editable = true,
  ...props
}) => {
  const [valueArray, setValueArray] = useState<string[]>([]);
  const { colors: appColors, isDark } = useAppTheme();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    setValueArray(value.split(''));
  }, [value]);

  const handleChange = (text: string, index: number) => {
    if (text) {
      const newCode = [...valueArray];
      newCode[index] = text;
      onChangeText(newCode.join(''));

      if (text && index < numberOfDigits - 1) {
        inputs.current[index + 1]?.focus();
      }
    } else {
      const newCode = [...valueArray];
      newCode.splice(index, 1);
      onChangeText(newCode.join(''));

      if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View
      style={[
        Styles.flexRow,
        Styles.justifyContentCenter,
        containerStyle,
      ]}>
      {Array(numberOfDigits)
        .fill('')
        .map((_x, i) => (
          <TextInput
            value={valueArray[i] ? valueArray[i] : ''}
            key={i}
            style={[
              styles.box,
              { 
                borderColor: isDark ? (focusedIndex === i || valueArray[i] ? '#00C2FF' : '#1C3A7A') : appColors.border, 
                backgroundColor: isDark ? 'transparent' : appColors.background,
                color: isDark ? '#FFFFFF' : appColors.text,
                borderWidth: isDark ? 2 : 1.5,
              },
            ]}
            textAlign="center"
            onChangeText={text => handleChange(text.replace(/[^0-9]/g, ''), i)}
            onFocus={() => setFocusedIndex(i)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="number-pad"
            maxLength={1}
            ref={ref => { inputs.current[i] = ref; }}
            editable={editable}
            {...props}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    height: 58,
    width: 58,
    borderRadius: 14,
    marginHorizontal: 8,
    fontSize: 22,
    fontWeight: '700',
  },
});

export default React.memo(OTPInput);
