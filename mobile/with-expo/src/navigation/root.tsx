import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { usePara } from "@/providers/para/usePara";
import ErrorIndicator from "@/components/ErrorIndicator";
import LoadingIndicator from "@/components/LoadingIndicator";

export function RootNavigation({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, isInitializing, hasError, error } = usePara();

  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "auth";
  const inHomeGroup = segments[0] === "home";

  useEffect(() => {
    if (isInitializing || !isInitialized) {
      return;
    }
    const refreshAuth = async () => {
      if (isAuthenticated) {
        if (inAuthGroup) {
          router.replace("/home");
        }
      } else {
        if (inHomeGroup) {
          router.replace("/auth");
        }
      }
    };

    refreshAuth();
  }, [isInitialized, isInitializing, isAuthenticated]);

  const handleRetry = () => {
    router.replace("/");
  };

  if (isInitializing || !isInitialized) {
    return (
      <LoadingIndicator
        title="Initializing Para"
        subtitle="Setting up your secure wallet environment"
      />
    );
  }

  if (hasError && error) {
    return (
      <ErrorIndicator
        title="Initialization Error"
        message={error.message}
        actionText="Retry"
        onAction={handleRetry}
      />
    );
  }

  return <>{children}</>;
}

export default RootNavigation;
