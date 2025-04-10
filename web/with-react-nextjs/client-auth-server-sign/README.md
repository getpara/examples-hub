# Para Client Auth + Server Sign Example

This project is a simple example of using the Para SDK for Client based Authentication with Server side signing in a
Next.js application. The example uses the `ParaModal` to authenticate the user before submitting the session to the
backend api route where a transaction is signed and returned to the client.

## Prerequisites

- **Para API Key**: Obtain your API key from the Para developer portal. Create a `.env.local` file in the project root
  (you can copy `.env.local.example` or `.env.example`) and add your key, prefixing with `NEXT_PUBLIC_` to expose it to
  the browser:
  ```env
  NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
  ```

## Installation

1.  Install project dependencies using your preferred package manager:
    ```bash
    npm install
    # or
    yarn install
    ```

## Running the Example

1.  Start the Next.js development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) (or the port specified) with
    your browser to see the result.

## Learn More

For comprehensive guidance on using the Para SDK, setup details, and advanced features, please refer to the official
documentation:

[Para SDK documentation](https://docs.usepara.com/welcome)
