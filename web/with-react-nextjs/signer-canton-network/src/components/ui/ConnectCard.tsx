interface ConnectCardProps {
  onConnect: () => void;
}

export function ConnectCard({ onConnect }: ConnectCardProps) {
  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      <div className="rounded-2xl border border-border bg-card p-10 shadow-xl shadow-black/[0.04] text-center">
        <img src="/para.svg" alt="Para" className="h-7 mx-auto mb-8 opacity-80" />

        <h1 className="text-xl font-semibold tracking-tight text-card-foreground mb-3">
          Onboard onto Canton
        </h1>
        <p className="text-[13px] font-mono text-muted-foreground leading-relaxed mb-8">
          Connect with Para to allocate a Canton external party backed by an embedded Ed25519 key.
        </p>

        <button
          onClick={onConnect}
          data-testid="auth-connect-button"
          className="btn-primary w-full px-4 py-2.5">
          Connect with Para
        </button>
      </div>
    </div>
  );
}
