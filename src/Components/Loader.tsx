import {View, Text, Modal, ActivityIndicator} from 'react-native';
import React from 'react';
import {useTheme} from '@react-navigation/native';
import {Styles} from '../lib/styles';

interface LoaderProps {
  loading: boolean;
}

const Loader: React.FC<LoaderProps> = ({loading = false}) => {
  const {colors} = useTheme();
  return (
    <Modal statusBarTranslucent navigationBarTranslucent transparent visible={loading}>
      <View
        style={[
          Styles.flex,
          Styles.alignItemsCenter,
          Styles.justifyContentCenter,
          {backgroundColor: `${colors.text}90`},
        ]}>
        <ActivityIndicator color={colors.primary} size={64} />
      </View>
    </Modal>
  );
};

export default React.memo(Loader);
