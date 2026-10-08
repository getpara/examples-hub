<script lang="ts">
  import Icon from "@/components/ui/Icon.svelte";

  interface Props {
    url: string;
    label?: string;
    title?: string;
  }

  const FRAME_SANDBOX = "allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts";
  const FRAME_PERMISSIONS = "publickey-credentials-get *; publickey-credentials-create *";

  let { url, label = "Para verification", title }: Props = $props();
</script>

<div class="grid border border-border-strong bg-surface">
  <div class="flex items-center gap-2 border-b border-border px-3 py-2 font-mono text-mono-label text-muted">
    <Icon name="lock-simple" />
    {label}
  </div>
  <div class="bg-[radial-gradient(var(--color-border)_1px,transparent_1.5px)] bg-size-[12px_12px]">
    <iframe
      src={url}
      title={title ?? label}
      allow={FRAME_PERMISSIONS}
      sandbox={FRAME_SANDBOX}
      class="block h-[400px] w-full border-0"></iframe>
  </div>
</div>
