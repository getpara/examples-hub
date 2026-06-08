"use client";

import { useState } from "react";

interface CantonTapCardProps {
  onTap: (input: { amount: string }) => void;
  isPending: boolean;
  error: Error | null;
  preparedHash?: string;
  updateId?: string;
  defaultAmount?: string;
}

export function CantonTapCard({
  onTap,
  isPending,
  error,
  preparedHash,
  updateId,
  defaultAmount = "100",
}: CantonTapCardProps) {
  const [amount, setAmount] = useState(defaultAmount);

  const canTap = amount.trim().length > 0 && !isPending;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up-delayed">
      <div className="px-6 py-4 border-b border-border/60">
        <h2 className="text-sm font-semibold">Fund this party (DevNet tap)</h2>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-destructive">
              {error.message || "Tap failed. Please try again."}
            </p>
          </div>
        )}

        {updateId && !error && (
          <div className="rounded-xl bg-success/8 border border-success/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-success-foreground">
              Tap confirmed — your party now holds Amulet you can spend.
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Mints test Amulet to this party via AmuletRules&apos; DevNet Tap choice (LocalNet/DevNet only). Same prepare → Para-sign → execute loop as the other actions.
        </p>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground" htmlFor="canton-tap-amount">
            Amount
          </label>
          <input
            id="canton-tap-amount"
            data-testid="canton-tap-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            inputMode="decimal"
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={() => onTap({ amount })}
          data-testid="canton-tap-button"
          disabled={!canTap}
          className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isPending ? "Tapping..." : "Tap Amulet"}
        </button>

        {preparedHash && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">preparedTransactionHash (signed by Para)</p>
            <div className="rounded-xl bg-muted/60 px-4 py-3 break-all">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {preparedHash}
              </code>
            </div>
          </div>
        )}

        {updateId && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">updateId</p>
            <div
              className="rounded-xl bg-muted/60 px-4 py-3 break-all"
              data-testid="canton-tap-update-id-display">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {updateId}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
