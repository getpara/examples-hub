"use client";

interface SignMessageFormProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignMessageForm({ message, isLoading, onMessageChange, onSubmit }: SignMessageFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-6 bg-white rounded-none border border-gray-200">
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message to Sign
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Enter a message to sign..."
          className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          rows={4}
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
        {isLoading ? "Signing..." : "Sign Message"}
      </button>
    </form>
  );
}