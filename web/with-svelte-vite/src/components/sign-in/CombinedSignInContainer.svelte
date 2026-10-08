<script lang="ts">
  import Alert from "@/components/ui/Alert.svelte";
  import Button from "@/components/ui/Button.svelte";
  import Icon from "@/components/ui/Icon.svelte";
  import OAuthProviderList from "@/components/ui/OAuthProviderList.svelte";
  import SegmentedControl from "@/components/ui/SegmentedControl.svelte";
  import SelectField from "@/components/ui/SelectField.svelte";
  import SignInPanel from "@/components/ui/SignInPanel.svelte";
  import StatusHint from "@/components/ui/StatusHint.svelte";
  import TextField from "@/components/ui/TextField.svelte";
  import VerificationFrame from "@/components/ui/VerificationFrame.svelte";
  import type { CombinedAuth } from "@/hooks/useCombinedAuth.svelte.js";
  import { formatErrorMessage } from "@/lib/format";
  import { SIGN_IN_DESCRIPTION, getVerifyDescription, getVerifyTitle } from "@/lib/signInCopy";
  import { AUTH_TABS, COUNTRY_CODES, OAUTH_PROVIDERS } from "@/lib/signInOptions";

  interface Props {
    auth: CombinedAuth;
    network: string;
  }

  let { auth, network }: Props = $props();

  const email = $derived(auth.email);
  const phone = $derived(auth.phone);
  const oauth = $derived(auth.oauth);
  const errorMessage = $derived(formatErrorMessage(auth.error));
  const destination = $derived(
    auth.activeTab === "email" ? email.email : `${phone.countryCode} ${phone.phoneNumber}`
  );
  const hasFrame = $derived(Boolean(auth.verifyUrl));
  const hasPasskey = $derived(Boolean(auth.passkeyUrl));

  function submitEmail(event: SubmitEvent) {
    event.preventDefault();
    void email.submit();
  }

  function submitPhone(event: SubmitEvent) {
    event.preventDefault();
    void phone.submit();
  }
</script>

{#snippet errorAlert()}
  {#if errorMessage}
    <Alert variant="destructive" title="Sign in failed">{errorMessage}</Alert>
  {/if}
{/snippet}

{#if auth.activeTab !== "social" && auth.step === "verify" && (hasFrame || hasPasskey)}
  <SignInPanel
    title={getVerifyTitle(hasFrame, hasPasskey)}
    description={getVerifyDescription(destination, hasFrame, hasPasskey)}
    {network}>
    {@render errorAlert()}
    {#if auth.verifyUrl}
      <VerificationFrame url={auth.verifyUrl} />
    {/if}
    {#if hasPasskey}
      <Button size="lg" fullWidth onclick={auth.openPasskeyWindow}>
        {#snippet icon()}
          <Icon name="fingerprint-simple" className="size-icon-md" />
        {/snippet}
        Open Passkey Verification
      </Button>
      <StatusHint>Waiting for the passkey window to finish.</StatusHint>
    {/if}
    <Button variant="outline" size="lg" fullWidth onclick={auth.cancel}>Cancel</Button>
  </SignInPanel>
{:else}
  <SignInPanel description={SIGN_IN_DESCRIPTION} {network}>
    <SegmentedControl
      label="Sign in with"
      options={AUTH_TABS}
      value={auth.activeTab}
      onChange={auth.setActiveTab}
      disabled={auth.isPending} />
    {@render errorAlert()}

    {#if auth.activeTab === "email"}
      <form onsubmit={submitEmail} class="grid gap-4">
        <TextField
          label="Email address"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          value={email.email}
          oninput={(event) => email.setEmail(event.currentTarget.value)}
          disabled={email.isPending}
          required
          data-testid="email-input" />
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={email.isPending}
          disabled={!email.email.trim()}
          data-testid="continue-email-button">
          Continue with Email
        </Button>
      </form>
    {:else if auth.activeTab === "phone"}
      <form onsubmit={submitPhone} class="grid gap-4">
        <SelectField
          label="Country"
          options={COUNTRY_CODES}
          value={phone.countryCode}
          onchange={(event) => phone.setCountryCode(event.currentTarget.value)}
          disabled={phone.isPending} />
        <TextField
          label="Phone number"
          type="tel"
          autocomplete="tel-national"
          placeholder="123-456-7890"
          prefix={phone.countryCode}
          value={phone.phoneNumber}
          oninput={(event) => phone.setPhoneNumber(event.currentTarget.value)}
          disabled={phone.isPending}
          required
          data-testid="phone-input" />
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={phone.isPending}
          disabled={!phone.phoneNumber.trim()}
          data-testid="continue-phone-button">
          Continue with Phone
        </Button>
      </form>
    {:else}
      <OAuthProviderList
        providers={OAUTH_PROVIDERS}
        onSelect={oauth.authenticate}
        activeId={oauth.activeProvider}
        disabled={oauth.isPending}
        layout="grid"
        labelPrefix="" />
      {#if oauth.isPending}
        <Alert title="Continue in the pop-up">Complete authentication in the popup window.</Alert>
        <Button variant="outline" size="lg" fullWidth onclick={oauth.cancel}>Cancel</Button>
      {/if}
    {/if}
  </SignInPanel>
{/if}
