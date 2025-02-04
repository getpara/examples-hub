export const REACT_CODE_SNIPPET = `import React, { useState } from "react";
import Para, { Environment, ParaModal } from "@getpara/react-sdk";
// The following styles.css import is not needed if using a version before v3.5.0 of '@getpara/react-sdk'
import "@getpara/react-sdk/styles.css";

// Initialize Para SDK with your API key and environment
const para = new Para(Environment.BETA, process.env.PARA_API_KEY);

function App() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Sign in with Para</button>
      <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
export default App;`;

export const WEB_CODE_SNIPPET = `import Para, { Environment } from "@getpara/web-sdk";

// Initialize Para SDK with your API key and environment
const para = new Para(Environment.BETA, process.env.PARA_API_KEY);`;

export const SERVER_CODE_SNIPPET = `import Para, { Environment } from "@getpara/server-sdk";

// Initialize Para SDK with your API key and environment
const para = new ParaServer(Environment.PRODUCTION, API_KEY);`;
