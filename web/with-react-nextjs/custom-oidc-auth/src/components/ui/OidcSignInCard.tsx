interface OidcSignInCardProps {
  isReady: boolean;
  isPending: boolean;
  status: string;
  error: string | null;
  onSignIn: () => void;
}

export function OidcSignInCard({ isReady, isPending, status, error, onSignIn }: OidcSignInCardProps) {
  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/[0.04]">
        <div className="space-y-3 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-card-foreground">Sign in with OIDC</h1>
        </div>

        {error && (
          <div className="mt-6 animate-fade-in rounded-xl border border-destructive/15 bg-destructive/8 px-4 py-3">
            <p className="break-words text-sm text-destructive" data-testid="custom-oidc-error">
              {error}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onSignIn}
          disabled={!isReady || isPending}
          data-testid="custom-oidc-signin"
          className="btn-primary mt-6 w-full px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {!isReady ? 'Initializing Para…' : isPending ? 'Working…' : 'Sign in with OIDC Provider'}
        </button>

        {status && (
          <p className="mt-4 text-center text-sm text-muted-foreground" data-testid="custom-oidc-status">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
