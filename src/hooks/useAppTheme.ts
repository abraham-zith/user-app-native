import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { lightColors, darkColors } from '../constant/colors';

export const useAppTheme = () => {
  const systemScheme = useColorScheme();
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const resolvedTheme = themeMode === 'system' ? systemScheme || 'light' : themeMode;
  const isDark = resolvedTheme === 'dark';
  const themeColors = isDark ? darkColors : lightColors;

  return {
    theme: resolvedTheme,
    isDark,
    colors: themeColors,
    mode: themeMode, // 'light' | 'dark' | 'system'
  };
};
