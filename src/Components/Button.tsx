import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View, // Import View for internal layout
} from 'react-native';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import { Styles } from '../lib/styles';

interface ButtonProps extends TouchableOpacityProps {
  loading?: boolean;
  // labelStyle is no longer needed as we'll apply style directly to the Text/children
  // If you must keep it, you'd apply it to a single Text child.
}
const Button: React.FC<ButtonProps> = ({
  children,
  style,
  loading,
  disabled,
  ...touchableOpacityProps
}) => {
  const { colors }: any = useTheme();
  return (
    <TouchableOpacity
      style={[
        Styles.alignItemsCenter,
        Styles.justifyContentCenter,
        Styles.br2,
        styles.container,
        Styles.bw1,
        { backgroundColor: colors.button, borderColor: colors.primary },
        style,
      ]}
      disabled={disabled || loading}
      {...touchableOpacityProps}>

      {/* WRAP CHILDREN IN A VIEW with ROW layout */}
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          children
        )}
      </View>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
  },
  // NEW STYLE: Enables row layout for children
  contentContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    // We don't apply justifyContent: 'center' here, 
    // we'll rely on the usage component to use flex: 1 for the text.
    // width: '100%', // Ensure it takes full width for centering
    // paddingHorizontal: 10, // Optional: for internal spacing
  },
});

export default React.memo(Button);