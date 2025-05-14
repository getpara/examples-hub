export const REACT_CODE_SNIPPET = `import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";

function App() {
  return (
    <ParaProvider
      paraClientConfig={{
        env: YOUR_PARA_ENV,
        apiKey: YOUR_PARA_API_KEY,
      }}
      config={{
        appName: YOUR_APP_NAME,
      }}
      paraModalConfig={{
        logo: YOUR_LOGO,
      }}
    >
      {/* Your app code here */}
    </ParaProvider>
  );
}
export default App;`;

export const WEB_CODE_SNIPPET = `import Para, { Environment } from "@getpara/web-sdk";

// Initialize Para SDK with your API key and environment
const para = new Para(Environment.BETA, process.env.PARA_API_KEY);`;

export const SERVER_CODE_SNIPPET = `import Para, { Environment } from "@getpara/server-sdk";

// Initialize Para SDK with your API key and environment
const para = new ParaServer(Environment.PRODUCTION, API_KEY);`;
