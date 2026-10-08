<script setup lang="ts">
import { computed, reactive } from "vue";
import Alert from "@/components/ui/Alert.vue";
import Button from "@/components/ui/Button.vue";
import Icon from "@/components/ui/Icon.vue";
import OAuthProviderList from "@/components/ui/OAuthProviderList.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import SelectField from "@/components/ui/SelectField.vue";
import SignInPanel from "@/components/ui/SignInPanel.vue";
import StatusHint from "@/components/ui/StatusHint.vue";
import TextField from "@/components/ui/TextField.vue";
import VerificationFrame from "@/components/ui/VerificationFrame.vue";
import { useCombinedAuth } from "@/hooks/useCombinedAuth";
import { formatErrorMessage } from "@/lib/format";
import { getVerifyDescription, getVerifyTitle } from "@/lib/signInCopy";
import { AUTH_TABS, COUNTRY_CODES, OAUTH_PROVIDERS } from "@/lib/signInOptions";

defineProps<{ network: string }>();

const auth = reactive(useCombinedAuth());

const errorMessage = computed(() => formatErrorMessage(auth.errorMessage));

const verifyDestination = computed(() =>
  auth.activeTab === "email" ? auth.email.email : `${auth.phone.countryCode} ${auth.phone.phoneNumber}`
);

const isVerifying = computed(
  () => auth.activeTab !== "social" && auth.step === "verify" && Boolean(auth.verifyUrl || auth.passkeyUrl)
);
</script>

<template>
  <SignInPanel
    v-if="isVerifying"
    :title="getVerifyTitle(Boolean(auth.verifyUrl), Boolean(auth.passkeyUrl))"
    :description="getVerifyDescription(verifyDestination, Boolean(auth.verifyUrl), Boolean(auth.passkeyUrl))"
    :network="network">
    <Alert
      v-if="errorMessage"
      variant="destructive"
      title="Sign in failed">
      {{ errorMessage }}
    </Alert>
    <VerificationFrame
      v-if="auth.verifyUrl"
      :url="auth.verifyUrl" />
    <template v-if="auth.passkeyUrl">
      <Button
        size="lg"
        full-width
        @click="auth.openPasskeyWindow">
        <template #icon>
          <Icon
            name="fingerprint-simple"
            class-name="size-icon-md" />
        </template>
        Open Passkey Verification
      </Button>
      <StatusHint>Waiting for the passkey window to finish.</StatusHint>
    </template>
    <Button
      variant="outline"
      size="lg"
      full-width
      @click="auth.cancel">
      Cancel
    </Button>
  </SignInPanel>

  <SignInPanel
    v-else
    description="Use your email, phone number, or a social account."
    :network="network">
    <SegmentedControl
      label="Sign in with"
      :options="AUTH_TABS"
      :value="auth.activeTab"
      :on-change="auth.setActiveTab"
      :disabled="auth.isPending" />
    <Alert
      v-if="errorMessage"
      variant="destructive"
      title="Sign in failed">
      {{ errorMessage }}
    </Alert>

    <form
      v-if="auth.activeTab === 'email'"
      class="grid gap-4"
      @submit.prevent="auth.email.submit">
      <TextField
        v-model="auth.email.email"
        label="Email address"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        :disabled="auth.email.isPending"
        required
        data-testid="email-input" />
      <Button
        type="submit"
        size="lg"
        full-width
        :is-loading="auth.email.isPending"
        :disabled="!auth.email.email.trim()"
        data-testid="continue-email-button">
        Continue with Email
      </Button>
    </form>

    <form
      v-else-if="auth.activeTab === 'phone'"
      class="grid gap-4"
      @submit.prevent="auth.phone.submit">
      <SelectField
        v-model="auth.phone.countryCode"
        label="Country"
        :options="COUNTRY_CODES"
        :disabled="auth.phone.isPending" />
      <TextField
        v-model="auth.phone.phoneNumber"
        label="Phone number"
        type="tel"
        autocomplete="tel-national"
        placeholder="123-456-7890"
        :prefix="auth.phone.countryCode"
        :disabled="auth.phone.isPending"
        required
        data-testid="phone-input" />
      <Button
        type="submit"
        size="lg"
        full-width
        :is-loading="auth.phone.isPending"
        :disabled="!auth.phone.phoneNumber.trim()"
        data-testid="continue-phone-button">
        Continue with Phone
      </Button>
    </form>

    <template v-else>
      <OAuthProviderList
        :providers="OAUTH_PROVIDERS"
        :on-select="auth.oauth.authenticate"
        :active-id="auth.oauth.activeProvider"
        :disabled="auth.oauth.isPending"
        layout="grid"
        label-prefix="" />
      <Alert
        v-if="auth.oauth.isPending"
        title="Continue in the pop-up">
        Complete authentication in the popup window.
      </Alert>
      <Button
        v-if="auth.oauth.isPending"
        variant="outline"
        size="lg"
        full-width
        @click="auth.oauth.cancel">
        Cancel
      </Button>
    </template>
  </SignInPanel>
</template>
