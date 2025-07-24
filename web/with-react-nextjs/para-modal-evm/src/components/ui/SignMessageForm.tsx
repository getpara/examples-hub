interface SignMessageFormProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignMessageForm({
  message,
  isLoading,
  onMessageChange,
  onSubmit,
}: SignMessageFormProps) {
  return (
    <form onSubmit={onSubmit} data-testid="sign-message-form" className="bg-white rounded-none border border-gray-200 p-6 mb-4">
      <h3 className="text-lg font-medium mb-4">Sign Message</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message to sign
          </label>
          <textarea
            id="message"
            data-testid="sign-message-input"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Enter your message here..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          data-testid="sign-submit-button"
          disabled={!message.trim() || isLoading}
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
          {isLoading ? "Signing..." : "Sign Message"}
        </button>
      </div>
    </form>
  );
}