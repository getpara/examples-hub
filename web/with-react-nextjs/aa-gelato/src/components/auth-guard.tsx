"use client";

import { useAccount } from "@getpara/react-sdk";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { FullScreenLoader } from "./full-screen-loader";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isConnected, isLoading } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isConnected) {
      router.replace("/");
      return;
    }

    if (pathname === "/" && isConnected) {
      router.replace("/accounts");
      return;
    }
  }, [isConnected, isLoading, pathname, router]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isConnected && pathname !== "/") {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
