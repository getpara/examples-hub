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
    <form onSubmit={onSubmit} className="rounded-none border border-gray-200">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Transfer ETH</h3>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
            To Address
          </label>
          <input
            id="to"
            type="text"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 rounded-none border border-gray-300 focus:border-gray-400 focus:outline-none"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (ETH)
          </label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.001"
            className="w-full px-3 py-2 rounded-none border border-gray-300 focus:border-gray-400 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-none bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950 disabled:bg-gray-400 transition-colors cursor-pointer">
          {isLoading ? "Sending..." : "Send Transaction"}
        </button>
      </div>
    </form>
  );
}