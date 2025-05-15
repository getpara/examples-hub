/**
 * @format
 */

import '@getpara/react-native-wallet/dist/shim';
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {enableScreens} from 'react-native-screens';
import 'react-native-url-polyfill/auto';
import 'node-libs-react-native/globals';

// Enable screens for better navigation performance
enableScreens();

import App from './app/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
