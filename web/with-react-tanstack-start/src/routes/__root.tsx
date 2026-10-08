import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import paraCss from "@getpara/react-sdk/styles.css?url";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { ParaModalFallback } from "@/components/ParaModalFallback";
import { ParaProvider } from "@/components/ParaProvider";
import globalsCss from "@/styles/globals.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: "Connect with the Para Modal and sign a message." },
      { title: "TanStack Start Example" },
    ],
    links: [
      { rel: "stylesheet", href: globalsCss },
      { rel: "stylesheet", href: paraCss },
      { rel: "icon", href: "/para-mark.svg", type: "image/svg+xml" },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ParaProvider fallback={<ParaModalFallback />}>{children}</ParaProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
