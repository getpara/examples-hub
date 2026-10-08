<script lang="ts">
  import { onMount } from "svelte";
  import AppShell from "@/components/layout/AppShell.svelte";
  import ExampleFooter from "@/components/layout/ExampleFooter.svelte";
  import ExampleHeader from "@/components/layout/ExampleHeader.svelte";
  import Workbench from "@/components/layout/Workbench.svelte";
  import CombinedSignInContainer from "@/components/sign-in/CombinedSignInContainer.svelte";
  import AccountMenu from "@/components/ui/AccountMenu.svelte";
  import AccountStrip from "@/components/ui/AccountStrip.svelte";
  import ActionPanel from "@/components/ui/ActionPanel.svelte";
  import Button from "@/components/ui/Button.svelte";
  import ResultPanel from "@/components/ui/ResultPanel.svelte";
  import TextAreaField from "@/components/ui/TextAreaField.svelte";
  import { useAccountBalance } from "@/hooks/useAccountBalance.svelte.js";
  import { useCombinedAuth } from "@/hooks/useCombinedAuth.svelte.js";
  import { useParaSession } from "@/hooks/useParaSession.svelte.js";
  import { useSignHelloWorld } from "@/hooks/useSignHelloWorld.svelte.js";
  import { SEPOLIA, explorerAddressUrl } from "@/lib/chain";
  import { EXAMPLE } from "@/lib/example";
  import { formatBalance, formatErrorMessage } from "@/lib/format";
  import { getResultStatus } from "@/lib/resultStatus";
  import { useAccountMenu } from "@/lib/useAccountMenu.svelte.js";
  import { useCopyToClipboard } from "@/lib/useCopyToClipboard.svelte.js";

  const session = useParaSession();
  const auth = useCombinedAuth(session.refresh);
  const balance = useAccountBalance(() => session.walletId);
  const signing = useSignHelloWorld();
  const addressCopy = useCopyToClipboard();
  const signatureCopy = useCopyToClipboard();
  const accountMenu = useAccountMenu(() => session.isConnected);

  onMount(() => {
    void session.refresh();
  });

  $effect(() => {
    if (!session.isConnected) {
      signing.reset();
    }
  });
</script>

<AppShell>
  {#snippet header()}
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={session.isConnected}
      address={session.address}
      onOpenAccount={accountMenu.toggle}
      isAccountOpen={accountMenu.isOpen} />
  {/snippet}

  {#snippet footer()}
    <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />
  {/snippet}

  {#if !session.isConnected}
    <div data-testid="not-logged-in" class="flex flex-1 flex-col">
      <CombinedSignInContainer {auth} network={SEPOLIA.networkLabel} />
    </div>
  {:else}
    <AccountMenu
      isOpen={accountMenu.isOpen}
      onClose={accountMenu.close}
      address={session.address}
      onCopyAddress={() => addressCopy.copy(session.address)}
      addressCopyStatus={addressCopy.status}
      explorerHref={explorerAddressUrl(session.address)}
      explorerLabel={`View on ${SEPOLIA.explorerName}`}
      onDisconnect={() => session.disconnect()}
      isDisconnecting={session.isDisconnecting}
      disconnectTestId="header-disconnect-button" />
    <div data-testid="wallet-connected" class="flex flex-1 flex-col">
      <AccountStrip
        address={session.address}
        onCopyAddress={() => addressCopy.copy(session.address)}
        addressCopyStatus={addressCopy.status}
        network={SEPOLIA.name}
        balance={formatBalance(balance.balance, SEPOLIA.currencySymbol)}
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh} />
      <Workbench>
        <ActionPanel
          title="Sign a message"
          api={"createParaViemClient().signMessage({ message })"}
          description="Signing proves you control this account. It does not send a transaction or cost gas.">
          <TextAreaField label="Message" value={signing.message} readonly hint="The app signs this exact text." />
          {#snippet actions()}
            <Button
              size="lg"
              isLoading={signing.isPending}
              onclick={() => signing.signMessage()}
              data-testid="sign-message-button">
              {`Sign ${signing.message}`}
            </Button>
          {/snippet}
        </ActionPanel>
        {#snippet aside()}
          <ResultPanel
            status={getResultStatus({
              isPending: signing.isPending,
              errorMessage: signing.errorMessage,
              value: signing.signature,
            })}
            emptyMessage="The signature appears here after you sign."
            pendingMessage="Approve the request in the Para window."
            successLabel="Signed"
            fields={signing.signature ? [{ label: "Signature", value: signing.signature, testId: "sign-signature-display" }] : []}
            onCopy={() => signing.signature && signatureCopy.copy(signing.signature)}
            copiedMessage="Signature copied"
            copyStatus={signatureCopy.status}
            errorTitle="Signing failed"
            errorMessage={formatErrorMessage(signing.errorMessage)} />
        {/snippet}
      </Workbench>
    </div>
  {/if}
</AppShell>
