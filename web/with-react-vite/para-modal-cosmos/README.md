# Para Modal + Cosmos Wallets Example

This example demonstrates integrating Cosmos Wallets like Keplr or leap with the Para Modal for user authentication. It
provides a minimal setup showing how to configure and trigger the modal for login flows using the Para React SDK.

## Prerequisites

- **Para API Key**: Obtain your API key from the [Para Developer Portal](https://developer.getpara.com/). Create a
  `.env` file in the project root (you can copy `.env.example`) and add your key, prefixing with `VITE_` to expose it to
  client-side code:
  ```env
  VITE_PARA_API_KEY=your_api_key_here
  ```

## Installation

1. Install project dependencies using your preferred package manager: `bash npm install # or yarn install # or pnpm
   install ```

## Running the Example

1.  Start the Vite development server:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
2.  Open the local address provided by Vite (usually `http://localhost:5173` or similar) with your browser to see the
    result and interact with the RainbowKit connector.

## Learn More

For comprehensive guidance on using the Para SDK, setup details, and advanced features, please refer to the official
documentation: [Para SDK documentation](https://docs.usepara.com/welcome)
