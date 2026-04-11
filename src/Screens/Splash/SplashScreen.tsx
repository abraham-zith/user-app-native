import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-gesture-handler';
import { useAppTheme } from '../../hooks/useAppTheme';
import { hS, mS, vS } from '../../lib/responsive';

export default function AnimationWithImperativeApi() {
  const animationRef = useRef<LottieView>(null);

  const { colors: appColors } = useAppTheme();

  useEffect(() => {
    animationRef.current?.play();
    animationRef.current?.play(30, 120);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <LottieView
        ref={animationRef}
        source={require('../../assets/animation/splash-screen.json')}
        autoPlay
        loop
        style={{ width: '100%', height: '100%' }}
      />
      <View style={styles.textWrapper}>
        <Text style={[styles.title, { color: appColors.text }]}>VDrive</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textWrapper: {
    position: 'absolute',
    bottom: vS(80),
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: mS(32),
    fontWeight: '900',
    letterSpacing: hS(2),
  },
});
