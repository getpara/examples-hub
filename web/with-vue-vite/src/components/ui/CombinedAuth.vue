<script setup lang="ts">
import { useCombinedAuth } from "@/composables/auth/useCombinedAuth";
import AuthCard from "./AuthCard.vue";
import AuthTabs from "./AuthTabs.vue";
import EmailForm from "./EmailForm.vue";
import PhoneForm from "./PhoneForm.vue";
import OAuthButtons from "./OAuthButtons.vue";
import VerifyIframe from "./VerifyIframe.vue";

const { activeTab, step, verifyUrl, isPending, error, cancel } = useCombinedAuth();

function handleVerifyComplete() {
  // The composable handles completion via waitForLogin/waitForWalletCreation
  // This is called when iframe posts success message
}

function handleVerifyCancel() {
  cancel();
}
</script>

<template>
  <AuthCard :error="error">
    <template v-if="step === 'input'">
      <AuthTabs v-model:active-tab="activeTab" />

      <EmailForm v-if="activeTab === 'email'" :is-pending="isPending" />
      <PhoneForm v-else-if="activeTab === 'phone'" :is-pending="isPending" />
      <OAuthButtons v-else :is-pending="isPending" />
    </template>

    <VerifyIframe
      v-else-if="step === 'verify' && verifyUrl"
      :verify-url="verifyUrl"
      @complete="handleVerifyComplete"
      @cancel="handleVerifyCancel"
    />
  </AuthCard>
</template>
