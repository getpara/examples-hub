# Para Signing with Viem v2 Example

This example demonstrates how to use the Para SDK with Viem v2 for signing messages and transactions. It provides
multiple example transaction types using the Para Viem v2 signer. Authentication is handled through the ParaModal before
being able to sign.

## Prerequisites

- **Para API Key**: Obtain your API key from the [Para Developer Portal](https://developer.getpara.com/). Create a
  `.env.local` file in the project root and add your key:
  ```env
  NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here
  ```

## Installation

1.  Install dependencies using your preferred package manager:
    ```bash
    npm install
    # or
    yarn install
    ```

## Running the Example

1.  Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) (or the specified port) in your
    browser.

## Learn More

For more detailed information on using the Para SDK and its features, please visit the official documentation:
[Para Documentation](https://docs.getpara.com/)
