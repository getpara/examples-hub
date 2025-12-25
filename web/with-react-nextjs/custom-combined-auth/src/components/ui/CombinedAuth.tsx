"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  useAccount,
  useClient,
  useSignUpOrLogIn,
  useVerifyOAuth,
  useVerifyFarcaster,
  useWaitForLogin,
  useWaitForWalletCreation,
  getPortalBaseURL,
  type AuthStateVerify,
  type TOAuthMethod,
} from "@getpara/react-sdk";

type AuthTab = "email" | "phone" | "social";
type Step = "input" | "verify";

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

const OAUTH_PROVIDERS: { method: TOAuthMethod; label: string; icon: string }[] = [
  { method: "GOOGLE", label: "Google", icon: "/google.svg" },
  { method: "APPLE", label: "Apple", icon: "/apple.svg" },
  { method: "DISCORD", label: "Discord", icon: "/discord.svg" },
  { method: "TWITTER", label: "X", icon: "/twitter.svg" },
];

export function CombinedAuth() {
  const { isConnected } = useAccount();
  const para = useClient();

  // Tab and step state
  const [activeTab, setActiveTab] = useState<AuthTab>("email");
  const [step, setStep] = useState<Step>("input");

  // Form state
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Verification state
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<string | null>(null);

  // SDK hooks
  const { signUpOrLogIn, isPending: isSigningUp } = useSignUpOrLogIn();
  const { verifyOAuth, isPending: isVerifyingOAuth } = useVerifyOAuth();
  const { verifyFarcaster, isPending: isVerifyingFarcaster } = useVerifyFarcaster();
  const { waitForLogin, isPending: isWaitingForLogin } = useWaitForLogin();
  const { waitForWalletCreation, isPending: isWaitingForWallet } = useWaitForWalletCreation();

  const popupWindow = useRef<Window | null>(null);
  const shouldCancel = useRef(false);

  // Reset to initial state
  const resetState = useCallback(() => {
    setStep("input");
    setVerifyUrl(null);
    setActiveOAuthProvider(null);
  }, []);

  // Shared post-auth handler for both OTP and OAuth flows
  const handleAuthComplete = useCallback(
    (isNewUser: boolean) => {
      shouldCancel.current = false;

      if (isNewUser) {
        // New user - wait for wallet creation
        waitForWalletCreation(
          { isCanceled: () => shouldCancel.current },
          {
            onSuccess: () => resetState(),
            onError: (err) => {
              setError(err.message || "Wallet creation failed");
              resetState();
            },
          }
        );
      } else {
        // Existing user - wait for login
        waitForLogin(
          { isCanceled: () => shouldCancel.current },
          {
            onSuccess: ({ needsWallet }) => {
              if (needsWallet) {
                waitForWalletCreation(
                  { isCanceled: () => shouldCancel.current },
                  { onSuccess: () => resetState() }
                );
              } else {
                resetState();
              }
            },
            onError: (err) => {
              setError(err.message || "Login failed");
              resetState();
            },
          }
        );
      }
    },
    [waitForLogin, waitForWalletCreation, resetState]
  );

  // Listen for iframe messages (OTP verification complete)
  useEffect(() => {
    if (step !== "verify" || !para) return;

    const handleMessage = (event: MessageEvent) => {
      const portalBase = getPortalBaseURL(para.ctx);
      if (!event.origin.startsWith(portalBase)) return;

      if (event.data?.type === "CLOSE_WINDOW" && event.data.success) {
        setVerifyUrl(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [step, para]);

  // Email/Phone submit handler
  const handleEmailPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const auth =
      activeTab === "email"
        ? { email }
        : { phone: `${countryCode}${phoneNumber.replace(/\D/g, "")}` as `+${number}` };

    signUpOrLogIn(
      { auth },
      {
        onSuccess: (authState) => {
          if (authState?.stage === "verify") {
            const verifyState = authState as AuthStateVerify;
            if (verifyState.loginUrl) {
              setVerifyUrl(verifyState.loginUrl);
              setStep("verify");
              const needsSignup = verifyState.nextStage === "signup";
              handleAuthComplete(needsSignup);
            }
          }
        },
        onError: (err) => {
          setError(err.message || "Authentication failed");
        },
      }
    );
  };

  // OAuth click handler
  const handleOAuth = (method: TOAuthMethod) => {
    setError(null);
    setActiveOAuthProvider(method);
    shouldCancel.current = false;

    if (method === "FARCASTER") {
      verifyFarcaster(
        {
          onConnectUri: (uri) => {
            popupWindow.current = window.open(uri, "farcaster", "popup=true");
          },
          isCanceled: () => shouldCancel.current || !!popupWindow.current?.closed,
        },
        {
          onSuccess: (authState) => {
            if (authState.stage === "done") {
              handleAuthComplete(authState.isNewUser);
            }
          },
          onError: (err) => {
            setError(err.message);
            setActiveOAuthProvider(null);
          },
        }
      );
    } else if (method !== "TELEGRAM") {
      verifyOAuth(
        {
          method: method as Exclude<TOAuthMethod, "TELEGRAM" | "FARCASTER">,
          onOAuthUrl: (url) => {
            popupWindow.current = window.open(url, "oauth", "popup=true");
          },
          isCanceled: () => shouldCancel.current || !!popupWindow.current?.closed,
        },
        {
          onSuccess: (authState) => {
            if (authState.stage === "done") {
              handleAuthComplete(authState.isNewUser);
            }
          },
          onError: (err) => {
            setError(err.message);
            setActiveOAuthProvider(null);
          },
        }
      );
    }
  };

  // Cancel handler
  const handleCancel = () => {
    shouldCancel.current = true;
    popupWindow.current?.close();
    resetState();
    setError(null);
  };

  if (isConnected) return null;

  const isPending =
    isSigningUp || isVerifyingOAuth || isVerifyingFarcaster || isWaitingForLogin || isWaitingForWallet;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Sign in to your account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {step === "input" ? (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              {(["email", "phone", "social"] as AuthTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={isPending}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-gray-900 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  } disabled:cursor-not-allowed`}>
                  {tab === "email" ? "Email" : tab === "phone" ? "Phone" : "Social"}
                </button>
              ))}
            </div>

            {/* Email Tab */}
            {activeTab === "email" && (
              <form onSubmit={handleEmailPhoneSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isPending}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending || !email}
                  className="w-full px-4 py-2 bg-gray-900 text-white hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
                  {isSigningUp ? "Loading..." : "Continue with Email"}
                </button>
              </form>
            )}

            {/* Phone Tab */}
            {activeTab === "phone" && (
              <form onSubmit={handleEmailPhoneSubmit} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="countryCode"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={isPending}
                      className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white">
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
                      disabled={isPending}
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isPending || !phoneNumber}
                  className="w-full px-4 py-2 bg-gray-900 text-white hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
                  {isSigningUp ? "Loading..." : "Continue with Phone"}
                </button>
              </form>
            )}

            {/* Social Tab */}
            {activeTab === "social" && (
              <div className="space-y-3">
                {OAUTH_PROVIDERS.map(({ method, label, icon }) => (
                  <button
                    key={method}
                    onClick={() => handleOAuth(method)}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <img src={icon} alt="" className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {activeOAuthProvider === method ? "Loading..." : `Continue with ${label}`}
                    </span>
                  </button>
                ))}

                {(isVerifyingOAuth || isVerifyingFarcaster) && (
                  <div className="mt-4 space-y-3">
                    <div className="text-center text-sm text-gray-500">Waiting for authentication...</div>
                    <button
                      onClick={handleCancel}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Verification Step (Email/Phone OTP) */
          <div className="space-y-4">
            {verifyUrl && (
              <div className="border border-gray-200 overflow-hidden">
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
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
