import { useCallback } from 'react';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
  HapticOptions,
} from 'react-native-haptic-feedback';

const defaultOptions: HapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const useHaptic = (defaultType: HapticFeedbackTypes | keyof typeof HapticFeedbackTypes = 'selection') => {
  const trigger = useCallback(
    (
      type?: HapticFeedbackTypes | keyof typeof HapticFeedbackTypes,
      options?: HapticOptions
    ) => {
      ReactNativeHapticFeedback.trigger(type || defaultType, {
        ...defaultOptions,
        ...options,
      });
    },
    [defaultType]
  );

  return {
    trigger,
    triggerHaptic: trigger, // alias for safety
  };
};

export default useHaptic;
