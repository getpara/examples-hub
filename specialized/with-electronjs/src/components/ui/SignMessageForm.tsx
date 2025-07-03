interface SignMessageFormProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignMessageForm({ message, isLoading, onMessageChange, onSubmit }: SignMessageFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-8">
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message to Sign
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Enter your message here..."
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !message.trim()}
        className="w-full rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Signing...' : 'Sign Message'}
      </button>
    </form>
  );
}