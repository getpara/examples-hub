"use client";

import { useAccount } from "@getpara/react-sdk";
import type { TOAuthMethod } from "@getpara/react-sdk";
import { useOAuthAuth } from "@/hooks/useOAuthAuth";
import { OAUTH_PROVIDERS } from "@/constants/auth";
import { AuthCard } from "./AuthCard";
import { OAuthButtons } from "./OAuthButtons";

export function OAuthAuth() {
  const { isConnected } = useAccount();
  const { activeProvider, authenticate, cancel, error, isPending } = useOAuthAuth();

  if (isConnected) return null;

  return (
    <AuthCard title="Sign in with OAuth" error={error}>
      <OAuthButtons
        providers={OAUTH_PROVIDERS}
        activeProvider={activeProvider}
        onAuthenticate={(method) => authenticate(method as TOAuthMethod)}
        isPending={isPending}
      />

      {isPending && (
        <div className="mt-4 space-y-3">
          <div className="text-center text-sm text-gray-500">Waiting for authentication...</div>
          <button
            onClick={cancel}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
            Cancel
          </button>
        </div>
      )}
    </AuthCard>
  );
}
