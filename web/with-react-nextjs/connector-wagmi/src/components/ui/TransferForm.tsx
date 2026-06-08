interface TransferFormProps {
  to: string;
  amount: string;
  isLoading: boolean;
  onToChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function TransferForm({ to, amount, isLoading, onToChange, onAmountChange, onSubmit }: TransferFormProps) {
  return (
    <form onSubmit={onSubmit} data-testid="transfer-form" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="text-lg font-semibold text-card-foreground">Transfer ETH</h2>
        <p className="mt-1 text-sm text-muted-foreground">Send a small Sepolia testnet transaction.</p>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div>
          <label htmlFor="to" className="mb-1 block text-sm font-medium text-card-foreground">
            To Address
          </label>
          <input
            id="to"
            type="text"
            data-testid="tx-to-input"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none transition-colors focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="mb-1 block text-sm font-medium text-card-foreground">
            Amount (ETH)
          </label>
          <input
            id="amount"
            type="text"
            data-testid="tx-amount-input"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.001"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none transition-colors focus:border-primary"
            required
          />
        </div>
        <button
          type="submit"
          data-testid="tx-submit-button"
          disabled={isLoading}
          className="btn-primary w-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isLoading ? "Sending..." : "Send Transaction"}
        </button>
      </div>
    </form>
  );
}
