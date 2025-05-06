# Para Svelte + Vite Example

This example demonstrates integrating the Para SDK within a Svelte application built using Vite. Note Para does not
support an official Svelte library. This example uses the React SDK with Svelte.

## Prerequisites

- **Para API Key**: Obtain your API key from the Para developer portal. Create a `.env` file in the project root (you
  can copy `.env.example`) and add your key:
  ```env
  VITE_PARA_API_KEY=your_api_key_here
  ```

## Installation

1.  Install project dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

## Running the Example

1.  Start the Vite development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open your browser to the local address provided by Vite (usually `http://localhost:5173` or similar).

## Learn More

For comprehensive guidance on using the Para SDK, setup details, and advanced features, please refer to the official
documentation: [Para SDK documentation](https://docs.usepara.com/welcome)
