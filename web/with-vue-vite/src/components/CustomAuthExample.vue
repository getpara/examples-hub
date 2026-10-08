<script setup lang="ts">
import { reactive } from "vue";
import AppShell from "@/components/layout/AppShell.vue";
import ExampleFooter from "@/components/layout/ExampleFooter.vue";
import ExampleHeader from "@/components/layout/ExampleHeader.vue";
import Workbench from "@/components/layout/Workbench.vue";
import CombinedSignInContainer from "@/components/sign-in/CombinedSignInContainer.vue";
import AccountMenu from "@/components/ui/AccountMenu.vue";
import AccountStrip from "@/components/ui/AccountStrip.vue";
import ActionPanel from "@/components/ui/ActionPanel.vue";
import Button from "@/components/ui/Button.vue";
import ResultPanel from "@/components/ui/ResultPanel.vue";
import TextAreaField from "@/components/ui/TextAreaField.vue";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useParaSession } from "@/hooks/useParaSession";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";
import { explorerAddressUrl, SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useAccountMenu } from "@/lib/useAccountMenu";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

const session = reactive(useParaSession());
const signing = reactive(useSignHelloWorld());
const balance = reactive(useAccountBalance(() => session.walletId));
const addressCopy = reactive(useCopyToClipboard());
const signatureCopy = reactive(useCopyToClipboard());
const accountMenu = reactive(useAccountMenu(() => session.isConnected));

function copySignature() {
  if (signing.signature) {
    void signatureCopy.copy(signing.signature);
  }
}
</script>

<template>
  <AppShell>
    <template #header>
      <ExampleHeader
        :scope="EXAMPLE.scope"
        :is-connected="session.isConnected"
        :address="session.address"
        :on-open-account="accountMenu.toggle"
        :is-account-open="accountMenu.isOpen" />
    </template>

    <div
      v-if="!session.isConnected"
      data-testid="not-logged-in">
      <CombinedSignInContainer :network="SEPOLIA.networkLabel" />
    </div>

    <div
      v-else
      class="flex flex-1 flex-col"
      data-testid="wallet-connected">
      <AccountMenu
        :is-open="accountMenu.isOpen"
        :on-close="accountMenu.close"
        :address="session.address"
        :on-copy-address="() => addressCopy.copy(session.address)"
        :address-copy-status="addressCopy.status"
        :explorer-href="explorerAddressUrl(session.address)"
        :explorer-label="`View on ${SEPOLIA.explorerName}`"
        :on-disconnect="session.disconnect"
        :is-disconnecting="session.isDisconnecting"
        disconnect-test-id="header-disconnect-button" />
      <AccountStrip
        :address="session.address"
        :on-copy-address="() => addressCopy.copy(session.address)"
        :address-copy-status="addressCopy.status"
        :network="SEPOLIA.name"
        :balance="formatBalance(balance.balance, SEPOLIA.currencySymbol)"
        :is-balance-loading="balance.isLoading"
        :is-balance-refreshing="balance.isRefreshing"
        :on-refresh-balance="balance.refresh" />
      <Workbench>
        <ActionPanel
          title="Sign a message"
          api="createParaViemClient().signMessage({ message })"
          description="Signing proves you control this account. It does not send a transaction or cost gas.">
          <TextAreaField
            label="Message"
            :model-value="signing.message"
            readonly
            hint="The app signs this exact text." />
          <template #actions>
            <Button
              size="lg"
              :is-loading="signing.isPending"
              data-testid="sign-message-button"
              @click="signing.signMessage">
              Sign {{ signing.message }}
            </Button>
          </template>
        </ActionPanel>
        <template #aside>
          <ResultPanel
            :status="
              getResultStatus({
                isPending: signing.isPending,
                errorMessage: signing.errorMessage,
                value: signing.signature,
              })
            "
            empty-message="The signature appears here after you sign."
            pending-message="Approve the request in the Para window."
            success-label="Signed"
            :fields="signing.signature ? [{ label: 'Signature', value: signing.signature, testId: 'sign-signature-display' }] : []"
            :on-copy="copySignature"
            copied-message="Signature copied"
            :copy-status="signatureCopy.status"
            error-title="Signing failed"
            :error-message="formatErrorMessage(signing.errorMessage)" />
        </template>
      </Workbench>
    </div>

    <template #footer>
      <ExampleFooter
        :docs-href="EXAMPLE.docsHref"
        :source-href="EXAMPLE.sourceHref" />
    </template>
  </AppShell>
</template>
