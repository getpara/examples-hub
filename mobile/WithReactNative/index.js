/**
 * @format
 */

// Import gesture-handler first to avoid conflicts
import 'react-native-gesture-handler';

import '@getpara/react-native-wallet/dist/shim';
import {AppRegistry} from 'react-native';
import {enableScreens} from 'react-native-screens';

// Enable screens for better navigation performance
enableScreens();

import App from './app/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
