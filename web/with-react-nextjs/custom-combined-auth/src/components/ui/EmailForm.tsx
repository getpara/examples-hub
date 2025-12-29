interface EmailFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  disabled?: boolean;
}

export function EmailForm({ email, onEmailChange, onSubmit, isPending, disabled }: EmailFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          disabled={disabled || isPending}
          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !email || disabled}
        className="w-full px-4 py-2 bg-gray-900 text-white hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
        {isPending ? "Loading..." : "Continue with Email"}
      </button>
    </form>
  );
}
