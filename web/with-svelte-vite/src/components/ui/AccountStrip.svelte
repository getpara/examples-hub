<script lang="ts">
  import type { Snippet } from "svelte";
  import AccountStripCell from "@/components/ui/AccountStripCell.svelte";
  import Badge from "@/components/ui/Badge.svelte";
  import Button from "@/components/ui/Button.svelte";
  import CopyButton from "@/components/ui/CopyButton.svelte";
  import Icon from "@/components/ui/Icon.svelte";
  import type { CopyStatus } from "@/lib/useCopyToClipboard.svelte.js";

  interface Props {
    address: string;
    addressLabel?: string;
    addressBadge?: string;
    addressCopyStatus?: CopyStatus;
    onCopyAddress?: () => void;
    network: string;
    networkLabel?: string;
    balance?: string;
    balanceLabel?: string;
    isBalanceLoading?: boolean;
    isBalanceRefreshing?: boolean;
    onRefreshBalance?: () => void;
    children?: Snippet;
  }

  let {
    address,
    addressLabel = "Account",
    addressBadge,
    addressCopyStatus = "idle",
    onCopyAddress,
    network,
    networkLabel = "Network",
    balance,
    balanceLabel = "Balance",
    isBalanceLoading = false,
    isBalanceRefreshing = false,
    onRefreshBalance,
    children,
  }: Props = $props();

  const showsBalance = $derived(balance !== undefined || isBalanceLoading);
</script>

<section aria-label="Account" class="border-b border-border bg-surface">
  <div
    class="mx-auto flex max-w-sheet flex-wrap border-border md:min-h-[88px] md:flex-nowrap md:border-x max-md:*:basis-1/2 max-md:[&>*:first-child]:basis-full max-md:[&>*:nth-child(n+2)]:border-t max-md:[&>*:nth-child(2n+3)]:border-l md:[&>*+*]:border-l">
    <AccountStripCell label={addressLabel} isWide>
      <span class="truncate font-mono text-code">{address}</span>
      {#if addressBadge}
        <Badge variant="outline">{addressBadge}</Badge>
      {/if}
      {#if onCopyAddress}
        <CopyButton
          variant="ghost"
          size="icon"
          className="ml-auto"
          label="Copy address"
          copiedMessage="Address copied"
          status={addressCopyStatus}
          onCopy={onCopyAddress} />
      {/if}
    </AccountStripCell>

    {@render children?.()}

    <AccountStripCell label={networkLabel}>
      <span class="truncate text-label">{network}</span>
    </AccountStripCell>

    {#if showsBalance}
      <AccountStripCell label={balanceLabel} isBusy={isBalanceLoading}>
        {#if isBalanceLoading}
          <span aria-hidden="true" class="h-3 w-full max-w-24 bg-surface-muted"></span>
        {:else}
          <span data-testid="account-balance-display" class="truncate font-mono text-data tabular-nums">{balance}</span>
        {/if}
        {#if onRefreshBalance}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onclick={onRefreshBalance}
            disabled={isBalanceLoading}
            isLoading={isBalanceRefreshing}
            data-testid="account-refresh-balance">
            {#snippet icon()}
              <Icon name="refresh" className="size-icon-md" />
            {/snippet}
            Refresh balance
          </Button>
        {/if}
      </AccountStripCell>
    {/if}
  </div>
</section>
