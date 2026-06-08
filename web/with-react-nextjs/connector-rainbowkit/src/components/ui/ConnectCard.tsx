import type { ReactNode } from "react";

interface ConnectCardProps {
  connectButton: ReactNode;
}

export function ConnectCard({ connectButton }: ConnectCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Get started</p>
        <h2 className="text-xl font-semibold tracking-tight text-card-foreground">Connect Wallet</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Open RainbowKit and choose the Para wallet connector.
        </p>
      </div>
      <div data-testid="auth-connect-button">
        {connectButton}
      </div>
    </div>
  );
}
