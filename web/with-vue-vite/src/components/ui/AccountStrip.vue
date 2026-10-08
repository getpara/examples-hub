<script setup lang="ts">
import { computed } from "vue";
import AccountStripCell from "@/components/ui/AccountStripCell.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import Icon from "@/components/ui/Icon.vue";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

const props = withDefaults(
  defineProps<{
    address: string;
    addressLabel?: string;
    addressBadge?: string;
    addressCopyStatus?: CopyStatus;
    onCopyAddress?: () => void;
    network: string;
    networkLabel?: string;
    balance?: string;
    balanceLabel?: string;
    isBalanceLoading?: boolean;
    isBalanceRefreshing?: boolean;
    onRefreshBalance?: () => void;
  }>(),
  {
    addressLabel: "Account",
    addressBadge: undefined,
    addressCopyStatus: "idle",
    onCopyAddress: undefined,
    networkLabel: "Network",
    balance: undefined,
    balanceLabel: "Balance",
    isBalanceLoading: false,
    isBalanceRefreshing: false,
    onRefreshBalance: undefined,
  }
);

const showsBalance = computed(() => props.balance !== undefined || props.isBalanceLoading);
</script>

<template>
  <section
    aria-label="Account"
    class="border-b border-border bg-surface">
    <div
      class="mx-auto flex max-w-sheet flex-wrap border-border md:min-h-[88px] md:flex-nowrap md:border-x max-md:*:basis-1/2 max-md:[&>*:first-child]:basis-full max-md:[&>*:nth-child(n+2)]:border-t max-md:[&>*:nth-child(2n+3)]:border-l md:[&>*+*]:border-l">
      <AccountStripCell
        :label="addressLabel"
        is-wide>
        <span class="truncate font-mono text-code">{{ address }}</span>
        <Badge
          v-if="addressBadge"
          variant="outline">
          {{ addressBadge }}
        </Badge>
        <CopyButton
          v-if="onCopyAddress"
          variant="ghost"
          size="icon"
          class-name="ml-auto"
          label="Copy address"
          copied-message="Address copied"
          :status="addressCopyStatus"
          :on-copy="onCopyAddress" />
      </AccountStripCell>

      <slot />

      <AccountStripCell :label="networkLabel">
        <span class="truncate text-label">{{ network }}</span>
      </AccountStripCell>

      <AccountStripCell
        v-if="showsBalance"
        :label="balanceLabel"
        :is-busy="isBalanceLoading">
        <span
          v-if="isBalanceLoading"
          aria-hidden="true"
          class="h-3 w-full max-w-24 bg-surface-muted" />
        <span
          v-else
          data-testid="account-balance-display"
          class="truncate font-mono text-data tabular-nums">
          {{ balance }}
        </span>
        <Button
          v-if="onRefreshBalance"
          variant="ghost"
          size="icon"
          class-name="ml-auto"
          :disabled="isBalanceLoading"
          :is-loading="isBalanceRefreshing"
          data-testid="account-refresh-balance"
          @click="onRefreshBalance">
          <template #icon>
            <Icon
              name="refresh"
              class-name="size-icon-md" />
          </template>
          Refresh balance
        </Button>
      </AccountStripCell>
    </div>
  </section>
</template>
