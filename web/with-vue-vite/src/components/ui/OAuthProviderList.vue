<script lang="ts">
export interface OAuthProviderOption<Id extends string> {
  id: Id;
  label: string;
  markSrc: string;
  testId?: string;
}
</script>

<script setup lang="ts" generic="Id extends string">
import Button from "@/components/ui/Button.vue";
import { cx } from "@/lib/classNames";

withDefaults(
  defineProps<{
    providers: ReadonlyArray<OAuthProviderOption<Id>>;
    onSelect: (id: Id) => void;
    activeId?: string | null;
    disabled?: boolean;
    layout?: "list" | "grid";
    labelPrefix?: string;
  }>(),
  { activeId: null, disabled: false, layout: "list", labelPrefix: "Continue with" }
);
</script>

<template>
  <div :class="cx('grid gap-2', layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1')">
    <Button
      v-for="provider in providers"
      :key="provider.id"
      variant="outline"
      size="lg"
      full-width
      class-name="justify-start!"
      :is-loading="activeId === provider.id"
      :disabled="activeId !== provider.id && (disabled || activeId !== null)"
      :data-testid="provider.testId"
      @click="onSelect(provider.id)">
      <template #icon>
        <img
          :src="provider.markSrc"
          alt=""
          width="20"
          height="20"
          class="size-icon-md" />
      </template>
      {{ `${labelPrefix} ${provider.label}` }}
    </Button>
  </div>
</template>
