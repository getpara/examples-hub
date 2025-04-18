import React, { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { WalletType } from "@getpara/web-sdk";
import { para } from "../client/para";

interface ApiOption {
  id: string;
  name: string;
}

interface ResultData {
  success: boolean;
  data?: any;
  message?: string;
}

const AuthFlowUI: React.FC = () => {
  const [step, setStep] = useState<string>("initial");
  const [authType, setAuthType] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [selectedAPI, setSelectedAPI] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const apiOptions: ApiOption[] = [
    { id: "ethers", name: "Ethers.js" },
    { id: "viem", name: "Viem" },
    { id: "cosmjs", name: "CosmJS" },
    { id: "solana-web3", name: "Solana Web3" },
    { id: "alchemy", name: "Alchemy AA" },
    { id: "zerodev", name: "ZeroDev AA" },
  ];

  const handleAuthTypeSelect = (type: string) => {
    setAuthType(type);
    setStep("email");
    setError("");
    setResult(null);
    setSession(null);
    setAuthenticated(false);
  };

  const handleAuthenticateUser = async () => {
    if (!email) {
      setError("Email missing.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setSession(null);

    try {
      const webAuthUrlForLogin = await para.initiateUserLogin({ email, useShortUrl: false });
      const popupWindow = window.open(webAuthUrlForLogin, "loginPopup", "popup=true,width=400,height=600");
      if (!popupWindow) {
        throw new Error("Popup was blocked. Please allow popups for this site.");
      }

      const { needsWallet } = await para.waitForLoginAndSetup({ popupWindow });

      if (needsWallet) {
        await para.createWallet({ type: WalletType.EVM, skipDistribute: false });
      }

      const exportedSession = await para.exportSession();
      setSession(exportedSession);
      setAuthenticated(true);
      setStep("api-selection");
    } catch (err: any) {
      setError(err.message || "An error occurred during session authentication.");
      console.error("Session Auth Error:", err);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    if (authType === "pregen") {
      try {
        const response = await fetch("/examples/wallets/pregen/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok || response.status === 409) {
          const data = await response.json();
          setAuthenticated(true);
          setStep("api-selection");
          setResult({
            success: true,
            message: data.message || `Pregen wallet ready (Status: ${response.status}).`,
            data: data,
          });
        } else {
          const data = await response.json();
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
      } catch (err: any) {
        setError(`Pregen setup failed: ${err.message}`);
        console.error("Pregen Create/Verify Error:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    } else if (authType === "session") {
      await handleAuthenticateUser();
    } else {
      setError("Invalid authentication type selected.");
      setLoading(false);
    }
  };

  const handleAPISelect = (apiId: string) => {
    setSelectedAPI(apiId);
    setStep("call-api");
    setError("");
    setResult(null);
  };

  const callSelectedAPI = async () => {
    if (!selectedAPI || !authType) {
      // Set error in result object for consistency as this error is tied to this action
      setResult({ success: false, message: "API or Auth Type not selected." });
      return;
    }
    if (authType === "session" && !session) {
      setResult({ success: false, message: "Session not available. Please complete session authentication first." });
      return;
    }
    if (authType === "pregen" && !email) {
      setResult({ success: false, message: "Email not available for pregen flow. Please start over." });
      return;
    }

    setLoading(true);
    setError(""); // Clear general errors when attempting API call
    setResult(null);

    const endpoint = `/examples/${selectedAPI}/${authType}`;
    const payload = authType === "session" ? { session } : { email };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      setResult({ success: true, data: responseData });
      // setError(""); // Already cleared above
    } catch (err: any) {
      const errorMsg = `API call to ${endpoint} failed: ${err.message}`;
      console.error(`API Call Error (${endpoint}):`, err);
      // Only set the result state for API call errors
      setResult({ success: false, message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("initial");
    setAuthType(null);
    setEmail("");
    setAuthenticated(false);
    setSelectedAPI(null);
    setResult(null);
    setError("");
    setSession(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Para Server Examples</h1>
        <p className="text-gray-600 mt-2">Test Pre-Generated & Session Flows</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div
            className={`flex flex-col items-center ${
              step === "initial" ? "text-blue-600" : step !== "initial" ? "text-green-600" : "text-gray-400"
            }`}>
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                step === "initial" ? "border-blue-600" : step !== "initial" ? "border-green-600" : "border-gray-300"
              }`}>
              {step !== "initial" ? <Check size={16} /> : 1}
            </div>
            <span className="text-xs mt-1">Auth Type</span>
          </div>
          <div
            className={`flex-1 h-px mx-2 ${
              step === "email" || step === "api-selection" || step === "call-api" ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
          <div
            className={`flex flex-col items-center ${
              step === "email"
                ? "text-blue-600"
                : step === "api-selection" || step === "call-api"
                ? "text-green-600"
                : "text-gray-400"
            }`}>
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                step === "email"
                  ? "border-blue-600"
                  : step === "api-selection" || step === "call-api"
                  ? "border-green-600"
                  : "border-gray-300"
              }`}>
              {step === "api-selection" || step === "call-api" ? <Check size={16} /> : 2}
            </div>
            <span className="text-xs mt-1">Email/Session</span>
          </div>
          <div
            className={`flex-1 h-px mx-2 ${
              step === "api-selection" || step === "call-api" ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
          <div
            className={`flex flex-col items-center ${
              step === "api-selection" || step === "call-api" ? "text-blue-600" : "text-gray-400"
            }`}>
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                step === "api-selection" || step === "call-api" ? "border-blue-600" : "border-gray-300"
              }`}>
              {step === "call-api" && result?.success ? <Check size={16} /> : 3}
            </div>
            <span className="text-xs mt-1">API Call</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded break-words">{error}</div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
        {step === "initial" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">1. Select Flow Type</h2>
            <div className="space-y-3">
              <button
                onClick={() => handleAuthTypeSelect("pregen")}
                disabled={loading}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-between hover:border-blue-500 transition-colors disabled:opacity-50">
                <div>
                  <h3 className="font-medium">Pre-Generated Wallet Flow</h3>
                  <p className="text-sm text-gray-600">Server creates/uses wallet based on email</p>
                </div>
                <ArrowRight
                  className="text-gray-400"
                  size={20}
                />
              </button>
              {/* <button
                onClick={() => handleAuthTypeSelect("session")}
                disabled={true}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-between hover:border-blue-500 transition-colors disabled:opacity-50">
                <div>
                  <h3 className="font-medium">Session Flow</h3>
                  <p className="text-sm text-gray-600">Client authenticates via email popup</p>
                </div>
                <ArrowRight
                  className="text-gray-400"
                  size={20}
                />
              </button> */}
            </div>
          </div>
        )}

        {step === "email" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              2. {authType === "pregen" ? "Enter Email for Pre-Gen Wallet" : "Authenticate Session via Email"}
            </h2>
            <div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user's email"
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("initial");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={loading || !email}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : authType === "pregen" ? (
                    "Create/Verify Wallet"
                  ) : (
                    "Authenticate"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {(step === "api-selection" || step === "call-api") && authenticated && (
          <div>
            <h2 className="text-lg font-semibold mb-4">3. Select API to Call</h2>
            <p className="text-sm text-gray-600 mb-3">
              Using:{" "}
              <span className="font-medium">
                {authType === "pregen" ? `Pre-gen flow (Email: ${email})` : `Session flow`}
              </span>
            </p>

            <div
              className={`grid grid-cols-2 gap-3 mb-6 ${step === "call-api" ? "opacity-50 pointer-events-none" : ""}`}>
              {apiOptions.map((api) => (
                <button
                  key={api.id}
                  onClick={() => handleAPISelect(api.id)}
                  disabled={step === "call-api"}
                  className={`p-3 bg-white border-2 rounded-lg text-center hover:border-blue-500 transition-colors ${
                    selectedAPI === api.id && step === "call-api"
                      ? "border-blue-600 ring-2 ring-blue-300"
                      : "border-gray-200"
                  }`}>
                  <span className="font-medium text-sm">{api.name}</span>
                </button>
              ))}
            </div>

            {step === "call-api" && selectedAPI && (
              <div className="mt-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <p className="text-sm">
                    <span className="font-semibold">Calling Endpoint:</span> /examples/{selectedAPI}/{authType}
                  </p>
                </div>

                {result && (
                  <div
                    className={`p-4 rounded-lg ${
                      result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    } mb-4`}>
                    {result.success ? (
                      <div className="flex items-start">
                        <Check
                          className="text-green-500 mr-2 mt-1 flex-shrink-0"
                          size={16}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-green-800">Success!</h3>
                          <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-48 whitespace-pre-wrap break-words">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-800">
                        <h3 className="font-semibold">Error</h3>
                        <p className="mt-1 break-words">{result.message}</p>
                      </div>
                    )}
                  </div>
                )}

                {!loading && result && (
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => {
                        setResult(null);
                        setError("");
                        setStep("api-selection");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm">
                      Choose different API
                    </button>
                    <button
                      onClick={callSelectedAPI}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                      {`Call ${apiOptions.find((api) => api.id === selectedAPI)?.name} API Again`}
                    </button>
                  </div>
                )}
                {!loading && !result && (
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => {
                        setResult(null);
                        setError("");
                        setStep("api-selection");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm">
                      Back to API Selection
                    </button>
                    <button
                      onClick={callSelectedAPI}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                      {`Call ${apiOptions.find((api) => api.id === selectedAPI)?.name} API`}
                    </button>
                  </div>
                )}
                {loading && (
                  <div className="flex justify-center items-center mt-6">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-blue-600">Calling API...</span>
                  </div>
                )}
              </div>
            )}
            <div className="mt-8 border-t pt-4">
              <button
                onClick={resetFlow}
                className="text-sm text-gray-600 hover:text-blue-600">
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFlowUI;
