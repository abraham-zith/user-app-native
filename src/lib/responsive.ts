import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const hS = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
export const vS = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
export const mS = (size: number, factor = 0.5) => size + (hS(size) - size) * factor;

// Platform helper
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
