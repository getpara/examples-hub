import type { OAuthProviderOption } from "@/types/auth";
import { AuthCard } from "./AuthCard";
import { OAuthButtons } from "./OAuthButtons";

interface OAuthAuthProps {
  providers: readonly OAuthProviderOption[];
  activeProvider: OAuthProviderOption["method"] | null;
  error: string | null;
  isPending: boolean;
  onAuthenticate: (method: OAuthProviderOption["method"]) => void;
  onCancel: () => void;
}

export function OAuthAuth({
  providers,
  activeProvider,
  error,
  isPending,
  onAuthenticate,
  onCancel,
}: OAuthAuthProps) {
  return (
    <AuthCard
      title="Sign in with OAuth"
      description="Use Para OAuth hooks with your own provider buttons."
      error={error}>
      <OAuthButtons
        providers={providers}
        activeProvider={activeProvider}
        onAuthenticate={onAuthenticate}
        isPending={isPending}
      />

      {isPending && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted p-3 text-center text-sm text-muted-foreground">
            Waiting for authentication...
          </div>
          <button type="button" onClick={onCancel} className="btn-secondary min-h-11 w-full px-4 text-sm">
            Cancel
          </button>
        </div>
      )}
    </AuthCard>
  );
}
