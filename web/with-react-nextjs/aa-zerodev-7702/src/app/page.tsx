import type { Metadata } from "next";
import { ZeroDev7702Example } from "@/components/ZeroDev7702Example";

export const metadata: Metadata = {
  title: "ZeroDev EIP-7702 Example",
  description: "Delegate smart account behavior to a Para wallet EOA with ZeroDev.",
};

export default function Home() {
  return (
    <>
      <ZeroDev7702Example />
      <noscript>
        <StaticDisconnectedPreview />
      </noscript>
    </>
  );
}

function StaticDisconnectedPreview() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
              P
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">ZeroDev 7702 Example</p>
              <p className="text-xs text-muted-foreground leading-tight">Para Account Abstraction</p>
            </div>
          </div>

          <button type="button" className="btn-secondary px-4 py-2 text-sm">
            Connect Wallet
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-lg p-8 text-center animate-fade-in-up">
          <div className="mx-auto mb-6 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <div className="h-7 w-7 rounded-full bg-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">Upgrade your EOA</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Connect a Para wallet to delegate smart account behavior with ZeroDev EIP-7702.
          </p>
          <button type="button" className="btn-primary w-full px-4 py-3" data-testid="auth-connect-button">
            Connect with Para
          </button>
        </div>
      </main>
    </div>
  );
}
