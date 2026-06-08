import type { Metadata } from "next";
import Image from "next/image";
import { GrazExample } from "@/components/GrazExample";

export const metadata: Metadata = {
  title: "Para + Graz Example",
  description: "Connect a Cosmos wallet through Para and Graz, then send a testnet token transfer.",
};

export default function Home() {
  return (
    <>
      <GrazExample />
      <noscript>
        <StaticDisconnectedPreview />
      </noscript>
    </>
  );
}

function StaticDisconnectedPreview() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/para.svg" alt="Para" width={60} height={20} className="h-5 w-auto" />
            <span className="text-xs font-medium text-muted-foreground">Graz Connector Example</span>
          </div>

          <button type="button" className="btn-primary px-5 py-1.5 text-sm">
            Connect Wallet
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="rounded-2xl border border-border bg-card p-10 shadow-xl shadow-black/[0.04] text-center">
            <Image
              src="/para.svg"
              alt="Para"
              width={84}
              height={28}
              className="h-7 w-auto mx-auto mb-8 opacity-80"
            />
            <h1 className="text-xl font-semibold tracking-tight text-card-foreground mb-3">
              Connect a Cosmos wallet
            </h1>
            <p className="text-[13px] font-mono text-muted-foreground leading-relaxed mb-8">
              Use Para through Graz to connect to Cosmos ICS Provider Testnet and send tokens.
            </p>
            <button type="button" className="btn-primary w-full px-4 py-2.5" data-testid="auth-connect-button">
              Connect with Para
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
