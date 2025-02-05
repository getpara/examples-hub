# Capsule Electron Example

This repository demonstrates how to integrate Capsule into an Electron application.

## Table of Contents

- [Running the Demo](#running-the-demo)
- [Integrating Capsule into Your Electron Project](#integrating-capsule-into-your-electron-project)
  - [1. Install Required Dependencies](#1-install-required-dependencies)
  - [2. Configure Webpack](#2-configure-webpack)
  - [3. Set up Content Security Policy (CSP)](#3-set-up-content-security-policy-csp)
  - [4. Configure `webPreferences` in `main.js`](#4-configure-webpreferences-in-mainjs)
  - [5. Implement Capsule in Your Renderer Process](#5-implement-capsule-in-your-renderer-process)
- [Important Note on Passkeys](#important-note-on-passkeys)
- [Support](#support)

## Running the Demo

To test a working demo of Capsule integration in Electron:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/capsule-electron-example.git
   cd capsule-electron-example
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Integrating Capsule into Your Electron Project

Follow these steps to integrate Capsule into your own Electron project:

### 1. Install Required Dependencies

Run the following command to install necessary packages:

```bash
npm install @usecapsule/react-sdk buffer crypto-browserify process react react-dom stream-browserify vm-browserify @babel/core @babel/preset-env @babel/preset-react babel-loader css-loader style-loader --save
```

Adjust the command as needed if you're using a different package manager.

### 2. Configure Webpack

Update your Webpack configurations to support React and necessary polyfills:

#### [webpack.main.config.js](webpack.main.config.js)

```javascript
const webpack = require("webpack");
const path = require("path");

module.exports = {
  // ... other configurations
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      vm: require.resolve("vm-browserify"),
      process: require.resolve("process/browser"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
  ],
  // ... output configuration
};
```

#### [webpack.renderer.config.js](webpack.renderer.config.js)

```javascript
const rules = require("./webpack.rules");
const webpack = require("webpack");

// ... other configurations

module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      // Same fallback configuration as in webpack.main.config.js
    },
  },
  plugins: [
    // Same plugin configuration as in webpack.main.config.js
  ],
  // ... output configuration
};
```

#### [webpack.rules.js](webpack.rules.js)

```javascript
module.exports = [
  // ... other rules
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-react"],
      },
    },
  },
];
```

These configurations set up React support and provide necessary polyfills for crypto, buffer, and other Node.js core modules that are not available in the browser environment.

### 3. Set up Content Security Policy (CSP)

#### In [index.html](src/index.html):

Add this meta tag:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://api.beta.usecapsule.com https://app.beta.usecapsule.com; connect-src 'self' https://api.beta.usecapsule.com https://app.beta.usecapsule.com wss://mpc-network.beta.usecapsule.com https://product-assets.sandbox.usecapsule.com https://m.stripe.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' https://rsms.me; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://crypto-js.stripe.com; frame-src https://js.stripe.com https://m.stripe.network https://m.stripe.com; worker-src 'self' blob:;" />
```

#### In [main.js](src/main.js):

Add this CSP configuration:

```javascript
const csp =
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://api.beta.usecapsule.com https://app.beta.usecapsule.com; " +
  // ... (rest of the CSP string)

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
  });
```

The CSP is necessary to allow connections to Capsule's servers and other required resources while maintaining security. It specifies which sources of content are allowed to be loaded and executed in your application.

### 4. Configure `webPreferences` in [main.js](src/main.js)

Update your `BrowserWindow` creation:

```javascript
const mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    nodeIntegration: true,
    contextIsolation: false,
    sandbox: false,
  },
});
```

These `webPreferences` settings are necessary to allow the renderer process to access Node.js APIs and communicate with the main process. While they reduce some security restrictions, they are required for Capsule to function properly in an Electron environment.

### 5. Implement Capsule in Your Renderer Process

To get started with Capsule in your renderer process:

1. Create a Capsule client:

   ```javascript
   import Capsule, { Environment } from "@usecapsule/react-sdk";

   const capsule = new Capsule(Environment.BETA, "YOUR_API_KEY");
   ```

2. Set up the Capsule Modal component:

   ```javascript
   import { CapsuleModal } from "@usecapsule/react-sdk";

   function YourComponent() {
     const [isModalOpen, setIsModalOpen] = useState(false);

     return (
       <>
         <button onClick={() => setIsModalOpen(true)}>Open Capsule Modal</button>
         <CapsuleModal capsule={capsule} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
       </>
     );
   }
   ```

For a complete implementation guide, refer to the [renderer.js](src/renderer.js) file in this repository.

## Important Note on Passkeys

**Warning:** Passkeys are not currently supported directly in an Electron process due to Chromium limitations. For testing account creation and signup, it is recommended to use a mobile phone, which can utilize the phone's passkey functionality.

We are working on an alternative password-based solution that will streamline this process in the future.

## Support

If you encounter any issues or have questions, please open an issue in this repository or contact Capsule support.
