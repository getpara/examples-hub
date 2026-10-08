<script lang="ts">
  import Button from "@/components/ui/Button.svelte";
  import CopyButton from "@/components/ui/CopyButton.svelte";
  import Icon from "@/components/ui/Icon.svelte";
  import type { CopyStatus } from "@/lib/useCopyToClipboard.svelte.js";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    address: string;
    title?: string;
    connectionLabel?: string;
    addressCopyStatus?: CopyStatus;
    onCopyAddress?: () => void;
    explorerHref?: string;
    explorerLabel?: string;
    onDisconnect: () => void;
    isDisconnecting?: boolean;
    disconnectLabel?: string;
    disconnectTestId?: string;
  }

  let {
    isOpen,
    onClose,
    address,
    title = "Account",
    connectionLabel = "Connected with Para",
    addressCopyStatus = "idle",
    onCopyAddress,
    explorerHref,
    explorerLabel = "View on explorer",
    onDisconnect,
    isDisconnecting = false,
    disconnectLabel = "Disconnect",
    disconnectTestId,
  }: Props = $props();

  const titleId = $props.id();

  function closeOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

{#if isOpen}
  <div role="presentation" class="fixed inset-0 z-20" onclick={closeOnBackdrop} onkeydown={closeOnEscape}>
    <div
      role="presentation"
      class="mx-auto flex max-w-sheet justify-end px-gutter pt-[calc(var(--spacing-header)+8px)] md:px-sheet-x"
      onclick={closeOnBackdrop}>
      <section
        role="dialog"
        aria-labelledby={titleId}
        class="grid w-90 max-w-full gap-5 border border-border-strong bg-background p-6 text-foreground shadow-menu">
        <header class="flex items-center justify-between gap-4">
          <h2 id={titleId} class="text-heading tracking-snug">{title}</h2>
          <Button variant="ghost" size="icon" autofocus onclick={onClose}>
            {#snippet icon()}
              <Icon name="x" className="size-icon-md" />
            {/snippet}
            Close
          </Button>
        </header>
        <div class="grid gap-2">
          <span class="font-mono text-mono-label text-muted uppercase">{connectionLabel}</span>
          <code class="border border-border bg-surface p-3 font-mono text-code [overflow-wrap:anywhere]">{address}</code>
        </div>
        {#if onCopyAddress || explorerHref}
          <div class="flex flex-wrap gap-2">
            {#if onCopyAddress}
              <CopyButton
                size="md"
                label="Copy address"
                copiedMessage="Address copied"
                status={addressCopyStatus}
                onCopy={onCopyAddress} />
            {/if}
            {#if explorerHref}
              <a
                href={explorerHref}
                target="_blank"
                rel="noreferrer"
                class="focus-ring state-layer inline-flex min-h-control-md items-center gap-2 px-control-x text-label tracking-ui text-foreground">
                <Icon name="arrow-up-right" className="size-icon-md" />
                {explorerLabel}
              </a>
            {/if}
          </div>
        {/if}
        <div class="border-t border-border pt-4">
          <Button variant="destructive" isLoading={isDisconnecting} onclick={onDisconnect} data-testid={disconnectTestId}>
            {#snippet icon()}
              <Icon name="sign-out" className="size-icon-md" />
            {/snippet}
            {disconnectLabel}
          </Button>
        </div>
      </section>
    </div>
  </div>
{/if}
