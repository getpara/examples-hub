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
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-card-foreground">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          disabled={disabled || isPending}
          className="min-h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !email || disabled}
        className="btn-primary min-h-11 w-full px-4 text-sm">
        {isPending ? "Loading..." : "Continue with Email"}
      </button>
    </form>
  );
}
