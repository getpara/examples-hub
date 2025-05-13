import React from "react";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import "@getpara/react-sdk/styles.css";

const LazyParaContainer = React.lazy(() =>
  import("~/components/ParaContainer").then((mod) => ({
    default: mod.ParaContainer,
  }))
);

function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Modal Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates Para Modal in a TanStack Start app without sacrificing SSR.
      </p>

      <ClientOnly fallback={<p className="text-center">Loading Para components...</p>}>
        <LazyParaContainer />
      </ClientOnly>
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: Home,
});
