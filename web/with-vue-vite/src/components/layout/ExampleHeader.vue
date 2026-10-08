<script setup lang="ts">
import Button from "@/components/ui/Button.vue";
import Icon from "@/components/ui/Icon.vue";
import { shortenAddress } from "@/lib/format";

withDefaults(
  defineProps<{
    scope: string;
    isConnected: boolean;
    address?: string;
    isConnecting?: boolean;
    connectLabel?: string;
    onConnect?: () => void;
    onOpenAccount?: () => void;
    isAccountOpen?: boolean;
    homeHref?: string;
  }>(),
  {
    address: "",
    isConnecting: false,
    connectLabel: "Connect",
    onConnect: undefined,
    onOpenAccount: undefined,
    isAccountOpen: undefined,
    homeHref: "/",
  }
);

const CHIP_CLASS =
  "inline-flex min-h-control-sm items-center gap-2 border border-border-strong bg-surface px-3 font-mono text-code text-foreground";
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-border bg-background">
    <h1 class="sr-only">{{ scope }}</h1>
    <div
      class="mx-auto flex min-h-header max-w-sheet items-center gap-3 border-border px-gutter md:gap-6 md:border-x md:px-sheet-x">
      <a
        :href="homeHref"
        class="focus-ring inline-flex min-w-0 items-center gap-3 text-foreground">
        <img
          src="/para-logo.svg"
          alt="Para"
          width="86"
          height="22"
          class="hidden h-[22px] w-auto md:block" />
        <img
          src="/para-mark.svg"
          alt="Para"
          width="23"
          height="22"
          class="block h-[22px] w-auto md:hidden" />
        <span class="truncate border-l border-border-strong pl-3 font-mono text-mono-label text-muted uppercase">
          {{ scope }}
        </span>
      </a>

      <div class="ml-auto flex flex-none items-center">
        <button
          v-if="isConnected && onOpenAccount"
          type="button"
          :aria-label="`Account ${address}`"
          aria-haspopup="dialog"
          :aria-expanded="isAccountOpen"
          data-testid="account-address-display"
          :data-address="address"
          :class="`${CHIP_CLASS} focus-ring cursor-pointer transition-colors duration-200 ease-brand hover:bg-surface-2`"
          @click="onOpenAccount">
          <span
            aria-hidden="true"
            class="size-2 flex-none bg-success" />
          <span>{{ shortenAddress(address) }}</span>
          <Icon
            name="caret-down"
            class-name="size-icon-sm text-muted" />
        </button>
        <span
          v-else-if="isConnected"
          data-testid="account-address-display"
          :data-address="address"
          :class="CHIP_CLASS">
          <span
            aria-hidden="true"
            class="size-2 flex-none bg-success" />
          <span>{{ shortenAddress(address) }}</span>
        </span>
        <Button
          v-else-if="onConnect || isConnecting"
          size="sm"
          :is-loading="isConnecting"
          data-testid="header-connect-button"
          @click="onConnect?.()">
          {{ connectLabel }}
        </Button>
        <span
          v-else
          role="status"
          class="inline-flex items-center gap-2 font-mono text-mono-label text-muted uppercase">
          <span
            aria-hidden="true"
            class="size-2 flex-none border border-border-strong" />
          Signed out
        </span>
      </div>
    </div>
  </header>
</template>
