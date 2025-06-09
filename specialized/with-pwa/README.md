# Para Provider PWA Example

This example demonstrates integrating the `ParaProvider` component with the `ParaModal` for user authentication in a Progressive Web App (PWA). It provides a minimal setup showing how to configure and trigger the modal for login flows using the hooks provided by the React SDK, with PWA-specific considerations for Para integration.

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

## PWA Considerations for Para

### Offline Functionality
- **Important**: Offline functionality with Para authentication will not work as it requires active internet connection to communicate with Para's servers.
- The PWA can cache static assets and provide offline UI, but authentication operations must be performed online.

### Password Authentication for Better PWA Experience
- For a fully integrated PWA solution without browser passkey popups interrupting the app experience, consider using Password authentication.
- Enable Password authentication in the [Para Developer Portal](https://developer.getpara.com/) for your application.
- This provides a more seamless PWA experience as password fields are handled within the web app context rather than triggering native browser dialogs.

## Learn More

For more detailed information on using the Para SDK and its features, please visit the official documentation:
[Para Documentation](https://docs.getpara.com/)
