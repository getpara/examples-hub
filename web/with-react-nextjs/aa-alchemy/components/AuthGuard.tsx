"use client";

import { useAccount } from "@getpara/react-sdk";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { FullScreenLoader } from "./FullScreenLoader";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isConnected, isLoading } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("[AuthGuard] isLoading:", isLoading);
    console.log("[AuthGuard] isConnected:", isConnected);
    console.log("[AuthGuard] pathname:", pathname);

    if (isLoading) {
      console.log("[AuthGuard] Still loading, skipping checks.");
      return;
    }

    if (!isConnected) {
      console.log("[AuthGuard] Not connected, redirecting to /");
      router.replace("/");
      return;
    }

    if (pathname === "/" && isConnected) {
      console.log("[AuthGuard] Connected user on /, redirecting to /accounts");
      router.replace("/accounts");
      return;
    }
  }, [isConnected, isLoading, pathname, router]);

  if (isLoading) {
    console.log("[AuthGuard] Rendering FullScreenLoader (loading)");
    return <FullScreenLoader />;
  }

  if (!isConnected && pathname !== "/") {
    console.log("[AuthGuard] Not connected and not on /, rendering FullScreenLoader (redirecting)");
    return <FullScreenLoader />;
  }

  console.log("[AuthGuard] Authenticated, rendering children");
  return <>{children}</>;
}
