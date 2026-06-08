interface TransferFormProps {
  faucetAddress: string;
  amount: string;
  denom: string;
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
}

export function TransferForm({
  faucetAddress,
  amount,
  denom,
  isLoading,
  isReady,
  error,
  onAmountChange,
  onSubmit,
}: TransferFormProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up-delayed">
      <div className="px-6 py-4 border-b border-border/60">
        <h2 className="text-sm font-semibold">Return Tokens to Faucet</h2>
      </div>

      <div data-testid="transfer-form" className="p-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-destructive break-words">
              {error.message || "Transaction failed. Please try again."}
            </p>
          </div>
        )}

        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <label htmlFor="to" className="block text-xs text-muted-foreground mb-1">
            Recipient
          </label>
          <input
            id="to"
            type="text"
            data-testid="tx-to-input"
            value={faucetAddress}
            readOnly
            disabled
            className="w-full bg-transparent text-sm font-mono text-foreground outline-none disabled:opacity-100"
          />
        </div>

        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <label htmlFor="amount" className="block text-xs text-muted-foreground mb-1">
            Amount ({denom})
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            data-testid="tx-amount-input"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
            placeholder="0.001"
            className="w-full bg-transparent text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground"
            required
          />
        </div>

        <p className="text-[13px] font-mono text-muted-foreground leading-relaxed">
          Sends a token transfer through Graz using the connected Para wallet signer.
        </p>

        <button
          type="button"
          onClick={onSubmit}
          data-testid="tx-submit-button"
          disabled={isLoading || !isReady}
          className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isLoading ? "Sending..." : "Send Transaction"}
        </button>
      </div>
    </div>
  );
}
