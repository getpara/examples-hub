// import "@usecapsule/react-native-wallet/dist/shim";
import { AppRegistry } from "react-native";
import App from "./app/App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
