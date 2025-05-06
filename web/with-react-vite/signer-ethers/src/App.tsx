<<<<<<< HEAD
=======
import { Routes, Route } from "react-router-dom";
import { usePara } from "./components/ParaProvider";
>>>>>>> main
import { Card } from "./components/Card";
import { transactionTypes } from "./example-transactions";
import { useAccount, useModal } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";

<<<<<<< HEAD
export default function Home() {
  const { openModal } = useModal();
  const { data: account } = useAccount();
=======
function HomePage() {
  const { isConnected, openModal } = usePara();
>>>>>>> main

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Para + Ethers Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore signing different transaction types using Para with Ethers.js.
          Reference the{" "}
          <code className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
            /src/components/ParaSignerProvider.tsx
          </code>{" "}
          file to see how we create and provide the{" "}
          <code className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
            ParaEthersSigner
          </code>
          globally to the app .
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {Object.entries(transactionTypes).map(([id, transaction]) => (
          <Card
            key={id}
            title={transaction.title}
            description={transaction.description}
            path={transaction.path}
          >
            <div>
<<<<<<< HEAD
              {account?.isConnected ? (
                <a
                  href={`/demo/${id}`}
                  className="inline-flex w-full items-center justify-center rounded-none bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 transition-colors mt-auto"
                >
=======
              {isConnected ? (
                // Use the path from the config for the href
                <a
                  href={transaction.path}
                  className="inline-flex w-full items-center justify-center rounded-none bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 transition-colors mt-auto">
>>>>>>> main
                  View Demo
                </a>
              ) : (
                <button
                  onClick={openModal}
                  className="w-full rounded-none bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 transition-colors mt-auto"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />
      {Object.entries(transactionTypes).map(([id, config]) => (
        <Route
          key={id}
          path={config.path}
          element={<config.component />}
        />
      ))}
    </Routes>
  );
}
