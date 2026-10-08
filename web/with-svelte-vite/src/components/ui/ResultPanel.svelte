<script lang="ts" module>
  export interface ResultField {
    label: string;
    value: string;
    testId?: string;
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import Alert from "@/components/ui/Alert.svelte";
  import Badge from "@/components/ui/Badge.svelte";
  import CopyButton from "@/components/ui/CopyButton.svelte";
  import Icon from "@/components/ui/Icon.svelte";
  import LoadingMark from "@/components/ui/LoadingMark.svelte";
  import type { ResultStatus } from "@/lib/resultStatus";
  import type { CopyStatus } from "@/lib/useCopyToClipboard.svelte.js";

  interface Props {
    status: ResultStatus;
    title?: string;
    emptyMessage?: string;
    pendingLabel?: string;
    pendingMessage?: string;
    successLabel?: string;
    fields?: ResultField[];
    copyLabel?: string;
    copiedMessage?: string;
    copyStatus?: CopyStatus;
    onCopy?: () => void;
    explorerHref?: string;
    explorerLabel?: string;
    explorerTestId?: string;
    errorTitle?: string;
    errorMessage?: string;
    errorTestId?: string;
    children?: Snippet;
  }

  let {
    status,
    title = "Result",
    emptyMessage = "The result appears here.",
    pendingLabel = "Pending",
    pendingMessage,
    successLabel,
    fields = [],
    copyLabel = "Copy",
    copiedMessage = "Copied to the clipboard",
    copyStatus = "idle",
    onCopy,
    explorerHref,
    explorerLabel = "View on explorer",
    explorerTestId,
    errorTitle = "Something went wrong",
    errorMessage,
    errorTestId,
    children,
  }: Props = $props();

  const titleId = $props.id();
  const showsFields = $derived(fields.length > 0 && (status === "success" || status === "pending"));
  const showsActions = $derived(status === "success" && (onCopy || explorerHref));
</script>

<section aria-labelledby={titleId} class="grid content-start gap-5 px-gutter py-8 md:px-sheet-x">
  <header class="flex min-h-7 items-center gap-3">
    <h2 id={titleId} class="mr-auto font-mono text-mono-label text-muted uppercase">{title}</h2>
    <div role="status" class="flex items-center">
      {#if status === "pending"}
        <span class="inline-flex items-center gap-2 text-label">
          <LoadingMark />
          {pendingLabel}
          {#if pendingMessage}
            <span class="sr-only">{pendingMessage}</span>
          {/if}
        </span>
      {/if}
      {#if status === "success" && successLabel}
        <Badge variant="outline">{successLabel}</Badge>
      {/if}
    </div>
  </header>

  {#if status === "empty"}
    <div
      class="grid min-h-60 place-content-center justify-items-center gap-4 border border-dashed border-border-strong p-6 text-center text-caption text-muted">
      <span aria-hidden="true" class="pixel-grid size-10"></span>
      <p class="max-w-[28ch]">{emptyMessage}</p>
    </div>
  {/if}

  {#if status === "pending" && pendingMessage}
    <p aria-hidden="true" class="text-caption text-muted">{pendingMessage}</p>
  {/if}

  {#if showsFields}
    <dl class="grid gap-4">
      {#each fields as field (field.label)}
        <div class="grid gap-2">
          <dt class="font-mono text-mono-label text-muted uppercase">{field.label}</dt>
          <dd data-testid={field.testId} class="border border-border bg-surface p-4 font-mono text-code [overflow-wrap:anywhere]">{field.value}</dd>
        </div>
      {/each}
    </dl>
  {/if}

  {#if showsActions}
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
      {#if onCopy}
        <CopyButton label={copyLabel} {copiedMessage} status={copyStatus} {onCopy} />
      {/if}
      {#if explorerHref}
        <a
          href={explorerHref}
          data-testid={explorerTestId}
          target="_blank"
          rel="noreferrer"
          class="focus-ring inline-flex items-center gap-1 text-label text-foreground underline decoration-border-strong underline-offset-4">
          {explorerLabel}
          <Icon name="arrow-up-right" className="size-icon-sm" />
        </a>
      {/if}
    </div>
  {/if}

  {#if status === "error"}
    {#if errorMessage}
      <Alert variant="destructive" title={errorTitle} testId={errorTestId}>{errorMessage}</Alert>
    {:else}
      <Alert variant="destructive" title={errorTitle} testId={errorTestId} />
    {/if}
  {/if}

  {@render children?.()}
</section>
