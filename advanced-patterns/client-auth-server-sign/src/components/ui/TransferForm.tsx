interface TransferFormProps {
  to: string;
  amount: string;
  isLoading: boolean;
  onToChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TransferForm({ to, amount, isLoading, onToChange, onAmountChange, onSubmit }: TransferFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4">
      <div className="space-y-3">
        <label
          htmlFor="to"
          className="block text-sm font-medium text-gray-700">
          Recipient Address
        </label>
        <input
          id="to"
          type="text"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          placeholder="0x..."
          required
          disabled={isLoading}
          className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div className="space-y-3">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700">
          Amount (ETH)
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.0"
          step="0.01"
          required
          disabled={isLoading}
          className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={!to || !amount || isLoading}>
        {isLoading ? "Sending Transaction..." : "Send Transaction"}
      </button>
    </form>
  );
}
