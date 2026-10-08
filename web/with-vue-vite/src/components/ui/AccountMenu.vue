<script setup lang="ts">
import { nextTick, ref, useId, watch } from "vue";
import Button from "@/components/ui/Button.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import Icon from "@/components/ui/Icon.vue";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    title: "Account",
    connectionLabel: "Connected with Para",
    addressCopyStatus: "idle",
    onCopyAddress: undefined,
    explorerHref: undefined,
    explorerLabel: "View on explorer",
    isDisconnecting: false,
    disconnectLabel: "Disconnect",
    disconnectTestId: undefined,
  }
);

const titleId = useId();
const closeButton = ref<InstanceType<typeof Button> | null>(null);

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      closeButton.value?.focus();
    }
  },
  { immediate: true }
);

function closeOnBackdrop(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    props.onClose();
  }
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === "Escape") {
    props.onClose();
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-20"
    @click="closeOnBackdrop"
    @keydown="closeOnEscape">
    <div
      class="mx-auto flex max-w-sheet justify-end px-gutter pt-[calc(var(--spacing-header)+8px)] md:px-sheet-x"
      @click="closeOnBackdrop">
      <section
        role="dialog"
        :aria-labelledby="titleId"
        class="grid w-90 max-w-full gap-5 border border-border-strong bg-background p-6 text-foreground shadow-menu">
        <header class="flex items-center justify-between gap-4">
          <h2
            :id="titleId"
            class="text-heading tracking-snug">
            {{ title }}
          </h2>
          <Button
            ref="closeButton"
            variant="ghost"
            size="icon"
            @click="onClose">
            <template #icon>
              <Icon
                name="x"
                class-name="size-icon-md" />
            </template>
            Close
          </Button>
        </header>
        <div class="grid gap-2">
          <span class="font-mono text-mono-label text-muted uppercase">{{ connectionLabel }}</span>
          <code class="border border-border bg-surface p-3 font-mono text-code [overflow-wrap:anywhere]">{{ address }}</code>
        </div>
        <div
          v-if="onCopyAddress || explorerHref"
          class="flex flex-wrap gap-2">
          <CopyButton
            v-if="onCopyAddress"
            size="md"
            label="Copy address"
            copied-message="Address copied"
            :status="addressCopyStatus"
            :on-copy="onCopyAddress" />
          <a
            v-if="explorerHref"
            :href="explorerHref"
            target="_blank"
            rel="noreferrer"
            class="focus-ring state-layer inline-flex min-h-control-md items-center gap-2 px-control-x text-label tracking-ui text-foreground">
            <Icon
              name="arrow-up-right"
              class-name="size-icon-md" />
            {{ explorerLabel }}
          </a>
        </div>
        <div class="border-t border-border pt-4">
          <Button
            variant="destructive"
            :is-loading="isDisconnecting"
            :data-testid="disconnectTestId"
            @click="onDisconnect">
            <template #icon>
              <Icon
                name="sign-out"
                class-name="size-icon-md" />
            </template>
            {{ disconnectLabel }}
          </Button>
        </div>
      </section>
    </div>
  </div>
</template>
