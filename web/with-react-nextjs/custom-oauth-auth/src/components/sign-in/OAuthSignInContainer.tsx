import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { OAuthProviderList } from "@/components/ui/OAuthProviderList";
import { SignInPanel } from "@/components/ui/SignInPanel";
import type { UseOAuthAuthReturn } from "@/hooks/useOAuthAuth";
import { describeSignInError } from "@/lib/signInCopy";
import { OAUTH_PROVIDERS, getOAuthProviderLabel } from "@/lib/signInOptions";

interface OAuthSignInContainerProps {
  oauth: UseOAuthAuthReturn;
  network: string;
}

const SIGN_IN_DESCRIPTION = "Use your Google, Apple, Discord, or X account.";

export function OAuthSignInContainer({ oauth, network }: OAuthSignInContainerProps) {
  const error = describeSignInError(oauth.error);
  const oauthProviderLabel = oauth.isPending ? getOAuthProviderLabel(oauth.activeProvider) : null;

  return (
    <SignInPanel
      description={
        oauthProviderLabel ? `Finish signing in with ${oauthProviderLabel} in the pop-up window.` : SIGN_IN_DESCRIPTION
      }
      network={network}>
      {error && (
        <Alert variant="destructive" title={error.title}>
          {error.message}
        </Alert>
      )}
      <OAuthProviderList
        providers={OAUTH_PROVIDERS}
        onSelect={oauth.authenticate}
        activeId={oauth.isPending ? oauth.activeProvider : null}
        disabled={oauth.isPending}
      />
      {oauth.isPending && (
        <Button variant="outline" size="lg" fullWidth onClick={oauth.cancel}>
          Cancel
        </Button>
      )}
    </SignInPanel>
  );
}
