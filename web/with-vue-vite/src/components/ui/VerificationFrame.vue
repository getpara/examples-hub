<script setup lang="ts">
import Icon from "@/components/ui/Icon.vue";

const props = withDefaults(defineProps<{ url: string; label?: string; title?: string }>(), {
  label: "Para verification",
  title: undefined,
});

const FRAME_SANDBOX = "allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts";
const FRAME_PERMISSIONS = "publickey-credentials-get *; publickey-credentials-create *";
</script>

<template>
  <div class="grid border border-border-strong bg-surface">
    <div class="flex items-center gap-2 border-b border-border px-3 py-2 font-mono text-mono-label text-muted">
      <Icon name="lock-simple" />
      {{ label }}
    </div>
    <div class="bg-[radial-gradient(var(--color-border)_1px,transparent_1.5px)] bg-size-[12px_12px]">
      <iframe
        :src="url"
        :title="props.title ?? label"
        :allow="FRAME_PERMISSIONS"
        :sandbox="FRAME_SANDBOX"
        class="block h-[400px] w-full border-0" />
    </div>
  </div>
</template>
