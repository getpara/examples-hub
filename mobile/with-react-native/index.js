/**
 * @format
 */

import '@getpara/react-native-wallet/shim';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
