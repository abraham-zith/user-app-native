/**
 * @format
 */
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundHandlers } from './src/notifications';

// Register background handlers before anything else
registerBackgroundHandlers();

AppRegistry.registerComponent(appName, () => App);
