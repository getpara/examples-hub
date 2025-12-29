<script lang="ts">
  import {
    activeTab,
    step,
    verifyUrl,
    isPending,
    error,
    cancel,
    type AuthTab,
  } from "@/stores/auth/combinedAuth";
  import AuthCard from "./AuthCard.svelte";
  import AuthTabs from "./AuthTabs.svelte";
  import EmailForm from "./EmailForm.svelte";
  import PhoneForm from "./PhoneForm.svelte";
  import OAuthButtons from "./OAuthButtons.svelte";
  import VerifyIframe from "./VerifyIframe.svelte";

  function handleTabChange(tab: AuthTab) {
    activeTab.set(tab);
  }

  function handleVerifyComplete() {
    // The store handles completion via waitForLogin/waitForWalletCreation
    // This is called when iframe posts success message
  }

  function handleVerifyCancel() {
    cancel();
  }
</script>

<AuthCard error={$error}>
  {#if $step === "input"}
    <AuthTabs activeTab={$activeTab} onTabChange={handleTabChange} />

    {#if $activeTab === "email"}
      <EmailForm isPending={$isPending} />
    {:else if $activeTab === "phone"}
      <PhoneForm isPending={$isPending} />
    {:else}
      <OAuthButtons isPending={$isPending} />
    {/if}
  {:else if $step === "verify" && $verifyUrl}
    <VerifyIframe
      verifyUrl={$verifyUrl}
      onComplete={handleVerifyComplete}
      onCancel={handleVerifyCancel}
    />
  {/if}
</AuthCard>
