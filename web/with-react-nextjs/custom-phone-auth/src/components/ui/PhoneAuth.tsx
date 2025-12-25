"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  useAccount,
  useClient,
  useSignUpOrLogIn,
  useWaitForLogin,
  useWaitForWalletCreation,
  getPortalBaseURL,
  type AuthStateVerify,
} from "@getpara/react-sdk";

type Step = "phone" | "verify";

// Common country codes
const COUNTRY_CODES = [
  { code: "+1", label: "US/CA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+49", label: "DE (+49)" },
  { code: "+33", label: "FR (+33)" },
  { code: "+81", label: "JP (+81)" },
  { code: "+86", label: "CN (+86)" },
  { code: "+91", label: "IN (+91)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+55", label: "BR (+55)" },
  { code: "+52", label: "MX (+52)" },
];

export function PhoneAuth() {
  const { isConnected } = useAccount();
  const para = useClient();

  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { signUpOrLogIn, isPending: isSigningUp } = useSignUpOrLogIn();
  const { waitForLogin, isPending: isWaitingForLogin } = useWaitForLogin();
  const { waitForWalletCreation, isPending: isWaitingForWallet } = useWaitForWalletCreation();

  const shouldCancelPolling = useRef(false);

  // Listen for iframe messages (verification complete)
  useEffect(() => {
    if (step !== "verify" || !para) return;

    const handleMessage = (event: MessageEvent) => {
      const portalBase = getPortalBaseURL(para.ctx);
      if (!event.origin.startsWith(portalBase)) return;

      if (event.data?.type === "CLOSE_WINDOW" && event.data.success) {
        // Verification complete, iframe can close
        setVerifyUrl(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [step, para]);

  // Start polling for login completion
  const startPolling = useCallback(
    (needsSignup: boolean) => {
      shouldCancelPolling.current = false;

      if (needsSignup) {
        // New user - wait for wallet creation
        waitForWalletCreation(
          { isCanceled: () => shouldCancelPolling.current },
          {
            onSuccess: () => {
              setStep("phone");
              setVerifyUrl(null);
            },
            onError: (err) => {
              setError(err.message || "Wallet creation failed");
              setStep("phone");
              setVerifyUrl(null);
            },
          }
        );
      } else {
        // Existing user - wait for login
        waitForLogin(
          { isCanceled: () => shouldCancelPolling.current },
          {
            onSuccess: ({ needsWallet }) => {
              if (needsWallet) {
                waitForWalletCreation(
                  { isCanceled: () => shouldCancelPolling.current },
                  {
                    onSuccess: () => {
                      setStep("phone");
                      setVerifyUrl(null);
                    },
                  }
                );
              } else {
                setStep("phone");
                setVerifyUrl(null);
              }
            },
            onError: (err) => {
              setError(err.message || "Login failed");
              setStep("phone");
              setVerifyUrl(null);
            },
          }
        );
      }
    },
    [waitForLogin, waitForWalletCreation]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Format phone as `+${number}` (e.g., "+14155551234")
    const phone = `${countryCode}${phoneNumber.replace(/\D/g, "")}` as `+${number}`;

    signUpOrLogIn(
      { auth: { phone } },
      {
        onSuccess: (authState) => {
          if (authState?.stage === "verify") {
            const verifyState = authState as AuthStateVerify;
            if (verifyState.loginUrl) {
              setVerifyUrl(verifyState.loginUrl);
              setStep("verify");

              // Start polling based on next stage
              const needsSignup = verifyState.nextStage === "signup";
              startPolling(needsSignup);
            }
          }
        },
        onError: (err) => {
          setError(err.message || "Authentication failed");
        },
      }
    );
  };

  const handleCancel = () => {
    shouldCancelPolling.current = true;
    setStep("phone");
    setVerifyUrl(null);
    setError(null);
  };

  if (isConnected) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-none border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Sign in with Phone</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone number
              </label>
              <div className="flex gap-2">
                <select
                  id="countryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={isSigningUp}
                  className="px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white">
                  {COUNTRY_CODES.map(({ code, label }) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={isSigningUp}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigningUp || !phoneNumber}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
              {isSigningUp ? "Loading..." : "Continue with Phone"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Verification iframe */}
            {verifyUrl && (
              <div className="border border-gray-200 rounded-none overflow-hidden">
                <iframe
                  src={verifyUrl}
                  className="w-full h-[400px] border-0"
                  allow="publickey-credentials-get *; publickey-credentials-create *"
                  title="Para Verification"
                />
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              {isWaitingForLogin && "Waiting for verification..."}
              {isWaitingForWallet && "Creating wallet..."}
            </div>

            <button
              onClick={handleCancel}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-none hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
