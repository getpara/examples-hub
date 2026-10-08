"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Sheet } from "@/components/layout/Sheet";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { ChainCard } from "@/components/ui/ChainCard";
import { ChainCardGrid } from "@/components/ui/ChainCardGrid";
import { ChainMark } from "@/components/ui/ChainMark";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { useConnectedChains } from "@/hooks/useConnectedChains";
import { useCosmosSignMessage } from "@/hooks/useCosmosSignMessage";
import { useEvmSignMessage } from "@/hooks/useEvmSignMessage";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { useSolanaSignMessage } from "@/hooks/useSolanaSignMessage";
import { useStellarSignMessage } from "@/hooks/useStellarSignMessage";
import { CHAINS, HELLO_WORLD_MESSAGE, SIGN_IN_NETWORK_LABEL, formatChainCount, type ChainId } from "@/lib/chain";
import { getChainCardStatus } from "@/lib/chainCardStatus";
import { EXAMPLE } from "@/lib/example";
import { formatErrorMessage, shortenAddress } from "@/lib/format";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useKeyedCopy } from "@/lib/useKeyedCopy";

export function ParaModalMultichainExample() {
  const wallet = useParaModalWallet();
  const connected = useConnectedChains();
  const signers = {
    evm: useEvmSignMessage(),
    cosmos: useCosmosSignMessage(),
    solana: useSolanaSignMessage(),
    stellar: useStellarSignMessage(),
  };
  const addressCopy = useCopyToClipboard();
  const signatureCopy = useKeyedCopy<ChainId>();

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={wallet.isConnected}
      address={wallet.address}
      onConnect={wallet.openModal}
      onOpenAccount={wallet.openModal}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  if (!wallet.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <SignInPanel
          description="Connect to continue. One Para account holds a wallet on each chain."
          network={SIGN_IN_NETWORK_LABEL}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  return (
    <AppShell header={header} footer={footer}>
      <AccountStrip
        address={wallet.address}
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        network={formatChainCount(connected.chains.length)}
        networkLabel="Networks"
      />
      <div data-testid="embedded-wallets" hidden>
        {JSON.stringify(connected.wallets)}
      </div>
      <Sheet>
        <ActionPanel
          title="Sign on each chain"
          api="useSignMessage · signAmino · signMessages · signBytes"
          description="Each wallet signs the same message with its own chain format."
        />
        <ChainCardGrid>
          {connected.chains.map(({ chainId, address }) => {
            const chain = CHAINS[chainId];
            const signer = signers[chainId];

            return (
              <ChainCard
                key={chainId}
                testId={`sign-card-${chainId}`}
                status={getChainCardStatus(signer)}
                mark={<ChainMark name={chain.mark} />}
                chain={chain.label}
                network={chain.network}
                address={address && shortenAddress(address)}
                message={HELLO_WORLD_MESSAGE}
                signature={signer.signature}
                signLabel={`Sign ${HELLO_WORLD_MESSAGE}`}
                onSign={signer.sign}
                signTestId="sign-submit-button"
                signatureTestId="sign-signature-display"
                copyStatus={signatureCopy.statusFor(chainId)}
                onCopySignature={() => signer.signature && signatureCopy.copyFor(chainId, signer.signature)}
                errorMessage={formatErrorMessage(signer.errorMessage)}
              />
            );
          })}
        </ChainCardGrid>
      </Sheet>
    </AppShell>
  );
}
