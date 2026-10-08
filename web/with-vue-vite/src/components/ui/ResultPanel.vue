<script lang="ts">
export interface ResultField {
  label: string;
  value: string;
  testId?: string;
}
</script>

<script setup lang="ts">
import { computed, useId } from "vue";
import Alert from "@/components/ui/Alert.vue";
import Badge from "@/components/ui/Badge.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import Icon from "@/components/ui/Icon.vue";
import LoadingMark from "@/components/ui/LoadingMark.vue";
import type { ResultStatus } from "@/lib/resultStatus";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    title: "Result",
    emptyMessage: "The result appears here.",
    pendingLabel: "Pending",
    pendingMessage: undefined,
    successLabel: undefined,
    fields: () => [],
    copyLabel: "Copy",
    copiedMessage: "Copied to the clipboard",
    copyStatus: "idle",
    onCopy: undefined,
    explorerHref: undefined,
    explorerLabel: "View on explorer",
    explorerTestId: undefined,
    errorTitle: "Something went wrong",
    errorMessage: undefined,
    errorTestId: undefined,
  }
);

const titleId = useId();
const showsFields = computed(() => props.fields.length > 0 && (props.status === "success" || props.status === "pending"));
const showsActions = computed(() => props.status === "success" && Boolean(props.onCopy || props.explorerHref));
</script>

<template>
  <section
    :aria-labelledby="titleId"
    class="grid content-start gap-5 px-gutter py-8 md:px-sheet-x">
    <header class="flex min-h-7 items-center gap-3">
      <h2
        :id="titleId"
        class="mr-auto font-mono text-mono-label text-muted uppercase">
        {{ title }}
      </h2>
      <div
        role="status"
        class="flex items-center">
        <span
          v-if="status === 'pending'"
          class="inline-flex items-center gap-2 text-label">
          <LoadingMark />
          {{ pendingLabel }}
          <span
            v-if="pendingMessage"
            class="sr-only">
            {{ pendingMessage }}
          </span>
        </span>
        <Badge
          v-if="status === 'success' && successLabel"
          variant="outline">
          {{ successLabel }}
        </Badge>
      </div>
    </header>

    <div
      v-if="status === 'empty'"
      class="grid min-h-60 place-content-center justify-items-center gap-4 border border-dashed border-border-strong p-6 text-center text-caption text-muted">
      <span
        aria-hidden="true"
        class="pixel-grid size-10" />
      <p class="max-w-[28ch]">{{ emptyMessage }}</p>
    </div>

    <p
      v-if="status === 'pending' && pendingMessage"
      aria-hidden="true"
      class="text-caption text-muted">
      {{ pendingMessage }}
    </p>

    <dl
      v-if="showsFields"
      class="grid gap-4">
      <div
        v-for="field in fields"
        :key="field.label"
        class="grid gap-2">
        <dt class="font-mono text-mono-label text-muted uppercase">{{ field.label }}</dt>
        <dd
          :data-testid="field.testId"
          class="border border-border bg-surface p-4 font-mono text-code [overflow-wrap:anywhere]">{{ field.value }}</dd>
      </div>
    </dl>

    <div
      v-if="showsActions"
      class="flex flex-wrap items-center gap-x-5 gap-y-2">
      <CopyButton
        v-if="onCopy"
        :label="copyLabel"
        :copied-message="copiedMessage"
        :status="copyStatus"
        :on-copy="onCopy" />
      <a
        v-if="explorerHref"
        :href="explorerHref"
        :data-testid="explorerTestId"
        target="_blank"
        rel="noreferrer"
        class="focus-ring inline-flex items-center gap-1 text-label text-foreground underline decoration-border-strong underline-offset-4">
        {{ explorerLabel }}
        <Icon
          name="arrow-up-right"
          class-name="size-icon-sm" />
      </a>
    </div>

    <Alert
      v-if="status === 'error'"
      variant="destructive"
      :title="errorTitle"
      :test-id="errorTestId">
      {{ errorMessage }}
    </Alert>

    <slot />
  </section>
</template>
