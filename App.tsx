import { StatusBar, View, Alert } from 'react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import RootNavigation from './src/Navigations/RootNavigation';
import { theme } from './src/constant/theme';
import { Styles } from './src/lib/styles';
import { RootProvider } from './src/context/RootContext';
import AnimationWithImperativeApi from './src/Screens/Splash/SplashScreen';
import { store, persistor } from './src/redux/store';
import { navigationRef, setNavigatorReady } from './src/Navigations/navigationRef';
import { NotificationHandler } from './src/notifications';

// ─── Notifee Background ───────────────────────────────────────────────────────
import notifee, { EventType } from '@notifee/react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { SocketProvider } from './src/Socket/SocketProvider';
import { useAppTheme } from './src/hooks/useAppTheme';
import { useSessionManager } from './src/hooks/useSessionManager';
import NetworkStatusIndicator from './src/Components/NetworkStatusIndicator';
import GlobalAlert from './src/Components/GlobalAlert';
import GlobalAlertManager from './src/utils/GlobalAlertManager';

Alert.alert = (title, message, buttons, options) => {
  GlobalAlertManager.show(title, message, buttons, options);
};

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  if (type === EventType.ACTION_PRESS && pressAction?.id === 'copy_code') {
    const promoCode = notification?.data?.promoCode;
    if (promoCode) Clipboard.setString(String(promoCode));
    if (notification?.id) await notifee.cancelNotification(notification.id);
  }
});

// ─── AppContent ───────────────────────────────────────────────────────────────
const AppContent = () => {
  const { isDark, colors: appColors } = useAppTheme();
  const { checkingToken } = useSessionManager();

  if (checkingToken) {
    return <AnimationWithImperativeApi />;
  }

  const linking = {
    prefixes: ['vdriveapp://'],
    config: {
      screens: { TripDetails: 'trips/:id' },
    },
  };


  return (
    <SafeAreaProvider style={[Styles.flex, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? appColors.background : "white"} />
      <NetworkStatusIndicator />
      <NavigationContainer theme={theme} linking={linking} ref={navigationRef} onReady={setNavigatorReady} >
        <RootProvider>
          <View style={{ flex: 1 }}>
            <NotificationHandler />
            <RootNavigation />
          </View>
        </RootProvider>
      </NavigationContainer>
      <GlobalAlert />
    </SafeAreaProvider>
  );
};

import { OptimizationProvider } from './src/context/OptimizationContext';

// ─── Root App ─────────────────────────────────────────────────────────────────
const App = () => (
  <Provider store={store}>
    <SocketProvider>
      <PersistGate loading={<AnimationWithImperativeApi />} persistor={persistor}>
        <OptimizationProvider>
          <AppContent />
        </OptimizationProvider>
      </PersistGate>
    </SocketProvider>
  </Provider>
);

export default App;
