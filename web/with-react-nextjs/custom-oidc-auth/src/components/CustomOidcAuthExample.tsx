"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeaderWithTestIds } from "@/components/layout/ExampleHeaderWithTestIds";
import { OidcSignInContainer } from "@/components/sign-in/OidcSignInContainer";
import { AccountMenu } from "@/components/ui/AccountMenu";
import { WalletActionsContainer } from "@/components/wallet/WalletActionsContainer";
import { useMfaChallenge } from "@/hooks/useMfaChallenge";
import { useOidcAuth } from "@/hooks/useOidcAuth";
import { useParaSession } from "@/hooks/useParaSession";
import { SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { useAccountMenu } from "@/lib/useAccountMenu";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function CustomOidcAuthExample() {
  const auth = useOidcAuth();
  const mfa = useMfaChallenge();
  const session = useParaSession();
  const addressCopy = useCopyToClipboard();
  const accountMenu = useAccountMenu(session.isConnected);

  const header = (
    <ExampleHeaderWithTestIds
      scope={EXAMPLE.scope}
      isConnected={session.isConnected}
      address={session.address}
      addressTestId="custom-oidc-address"
      onOpenAccount={accountMenu.toggle}
      isAccountOpen={accountMenu.isOpen}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  return (
    <div data-testid="custom-oidc-example">
      <AppShell header={header} footer={footer}>
        {session.isConnected ? (
          <>
            <AccountMenu
              isOpen={accountMenu.isOpen}
              onClose={accountMenu.close}
              address={session.address}
              onCopyAddress={() => addressCopy.copy(session.address)}
              addressCopyStatus={addressCopy.status}
              onDisconnect={() => session.disconnect()}
              isDisconnecting={session.isDisconnecting}
              disconnectLabel="Log out"
              disconnectTestId="custom-oidc-logout"
            />
            <WalletActionsContainer address={session.address} />
          </>
        ) : (
          <OidcSignInContainer auth={auth} mfa={mfa} network={SEPOLIA.networkLabel} />
        )}
      </AppShell>
    </div>
  );
}
