interface AuthCardProps {
  title: string;
  description?: string;
  error: string | null;
  children: React.ReactNode;
}

export function AuthCard({ title, description, error, children }: AuthCardProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-5">
        <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="space-y-5 px-6 py-5">
        {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        {children}
      </div>
    </div>
  );
}
