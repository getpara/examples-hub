<script lang="ts">
  import Button, { type ButtonSize, type ButtonVariant } from "@/components/ui/Button.svelte";
  import Icon, { type IconName } from "@/components/ui/Icon.svelte";
  import type { CopyStatus } from "@/lib/useCopyToClipboard.svelte.js";

  interface Props {
    label: string;
    copiedMessage: string;
    status?: CopyStatus;
    onCopy: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
  }

  const ICON_NAMES: Record<CopyStatus, IconName> = {
    idle: "copy",
    copied: "check",
    failed: "warning",
  };

  const FAILED_MESSAGE = "Could not copy to the clipboard";

  let { label, copiedMessage, status = "idle", onCopy, variant = "outline", size = "sm", className }: Props = $props();

  const visibleLabels = $derived<Record<CopyStatus, string>>({ idle: label, copied: "Copied", failed: "Copy failed" });
  const statusMessages = $derived<Record<CopyStatus, string>>({ idle: "", copied: copiedMessage, failed: FAILED_MESSAGE });
</script>

<Button {variant} {size} {className} onclick={onCopy}>
  {#snippet icon()}
    <Icon name={ICON_NAMES[status]} className="size-icon-md" />
  {/snippet}
  {size === "icon" ? label : visibleLabels[status]}
</Button>
<span role="status" class="sr-only">{statusMessages[status]}</span>
