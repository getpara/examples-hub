import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import { API_KEY, ENVIRONMENT } from "~/constants";

const queryClient = new QueryClient();

const LazyParaProvider = React.lazy(() => import("@getpara/react-sdk").then((mod) => ({ default: mod.ParaProvider })));

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <ClientOnly fallback={null}>
      <QueryClientProvider client={queryClient}>
        <LazyParaProvider paraClientConfig={{ apiKey: API_KEY, env: ENVIRONMENT }}>{children}</LazyParaProvider>
      </QueryClientProvider>
    </ClientOnly>
  );
}
