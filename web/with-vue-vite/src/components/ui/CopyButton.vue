<script setup lang="ts">
import { computed } from "vue";
import Button, { type ButtonSize, type ButtonVariant } from "@/components/ui/Button.vue";
import Icon, { type IconName } from "@/components/ui/Icon.vue";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

const props = withDefaults(
  defineProps<{
    label: string;
    copiedMessage: string;
    status?: CopyStatus;
    onCopy: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
  }>(),
  { status: "idle", variant: "outline", size: "sm", className: undefined }
);

const ICON_NAMES: Record<CopyStatus, IconName> = {
  idle: "copy",
  copied: "check",
  failed: "warning",
};

const FAILED_MESSAGE = "Could not copy to the clipboard";

const visibleLabel = computed(() => {
  const visibleLabels: Record<CopyStatus, string> = { idle: props.label, copied: "Copied", failed: "Copy failed" };
  return props.size === "icon" ? props.label : visibleLabels[props.status];
});

const statusMessage = computed(() => {
  const statusMessages: Record<CopyStatus, string> = { idle: "", copied: props.copiedMessage, failed: FAILED_MESSAGE };
  return statusMessages[props.status];
});
</script>

<template>
  <Button
    :variant="variant"
    :size="size"
    :class-name="className"
    @click="onCopy">
    <template #icon>
      <Icon
        :name="ICON_NAMES[status]"
        class-name="size-icon-md" />
    </template>
    {{ visibleLabel }}
  </Button>
  <span
    role="status"
    class="sr-only">
    {{ statusMessage }}
  </span>
</template>
