export const REACT_CODE_SNIPPET = `import React, { useState } from "react";
import Capsule, { Environment, CapsuleModal } from "@usecapsule/react-sdk";
// The following styles.css import is not needed if using a version before v3.5.0 of '@usecapsule/react-sdk'
import "@usecapsule/react-sdk/styles.css";

// Initialize Capsule SDK with your API key and environment
const capsule = new Capsule(Environment.BETA, process.env.CAPSULE_API_KEY);

function App() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Sign in with Capsule</button>
      <CapsuleModal
        capsule={capsule}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
export default App;`;

export const WEB_CODE_SNIPPET = `import Capsule, { Environment } from "@usecapsule/web-sdk";

// Initialize Capsule SDK with your API key and environment
const capsule = new Capsule(Environment.BETA, process.env.CAPSULE_API_KEY);`;

export const SERVER_CODE_SNIPPET = `import Capsule, { Environment } from "@usecapsule/server-sdk";

// Initialize Capsule SDK with your API key and environment
const capsuleClient = new CapsuleServer(Environment.PRODUCTION, API_KEY);`;
