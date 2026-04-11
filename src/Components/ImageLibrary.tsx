import {View, Text} from 'react-native';
import React from 'react';

interface ImageLibraryProps {}

const ImageLibrary: React.FC<ImageLibraryProps> = () => {
  return (
    <View>
      <Text>ImageLibrary</Text>
    </View>
  );
};

export default React.memo(ImageLibrary);
