import "node-libs-react-native/globals";
import { Buffer } from "buffer";

global.Buffer = Buffer;
global.process = global.process || {};
global.process.nextTick = global.process.nextTick || setImmediate;

// You might need to add other shims here depending on your project's dependencies.
// For example, if you use crypto:
// import 'react-native-get-random-values'; // if not already imported elsewhere
// global.crypto = global.crypto || { getRandomValues: global.crypto.getRandomValues };

// If you use stream
// global.stream = require('stream-browserify');
