import {View, Text} from 'react-native';
import React from 'react';

interface CameraProps {}

const Camera: React.FC<CameraProps> = () => {
  return (
    <View>
      <Text>Camera</Text>
    </View>
  );
};

export default React.memo(Camera);
