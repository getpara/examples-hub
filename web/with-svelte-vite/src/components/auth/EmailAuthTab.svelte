<script lang="ts">
  import { authModal, signUpOrLoginWithEmail, verifyAccount, waitForLogin, waitForWalletCreation } from '@/stores/paraAuth';
  import AuthButton from './AuthButton.svelte';
  import OTPInput from './OTPInput.svelte';
  
  let popupWindow: Window | null = null;
  
  $: ({ email, verificationCode, step, isLoading, error } = $authModal);
  
  function openPopup(url: string, name: string) {
    popupWindow?.close();
    popupWindow = window.open(url, name, 'popup=true');
  }
  
  async function handleEmailSubmit() {
    if (!email) return;
    
    try {
      const authState = await signUpOrLoginWithEmail(email);
      
      if (authState.stage === 'login' && 'passkeyUrl' in authState && authState.passkeyUrl) {
        openPopup(authState.passkeyUrl, 'loginPopup');
        await waitForLogin(() => popupWindow?.closed ?? true);
      }
    } catch {
      // Error handled in store
    }
  }
  
  async function handleVerification() {
    if (!verificationCode) return;
    
    try {
      const authState = await verifyAccount(verificationCode);
      
      if ('passkeyUrl' in authState && authState.passkeyUrl) {
        openPopup(authState.passkeyUrl, 'signUpPopup');
        await waitForWalletCreation(() => Boolean(popupWindow?.closed));
      }
    } catch {
      // Error handled in store
    }
  }
  
  function handleEmailChange(e: Event) {
    const target = e.target as HTMLInputElement;
    authModal.update(state => ({ ...state, email: target.value }));
  }
  
  function handleOTPChange(value: string) {
    authModal.update(state => ({ ...state, verificationCode: value }));
  }
</script>

<div class="space-y-4">
  {#if step === 'select' || step === 'email'}
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
        Email Address
      </label>
      <input
        id="email"
        type="email"
        value={email}
        on:input={handleEmailChange}
        disabled={isLoading}
        placeholder="you@example.com"
        class="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        data-testid="email-input"
      />
    </div>
    
    <AuthButton
      {isLoading}
      disabled={!email}
      onClick={handleEmailSubmit}
      data-testid="continue-email-button"
    >
      Continue with Email
    </AuthButton>
  {/if}
  
  {#if step === 'verify'}
    <div class="text-center space-y-4">
      <p class="text-sm text-gray-600">
        We sent a verification code to {email}
      </p>
      
      <OTPInput
        value={verificationCode}
        onChange={handleOTPChange}
        disabled={isLoading}
      />
      
      <AuthButton
        {isLoading}
        disabled={!verificationCode || verificationCode.length !== 6}
        onClick={handleVerification}
        loadingText="Verifying..."
        data-testid="verify-wallet-button"
      >
        Verify & Create Wallet
      </AuthButton>
    </div>
  {/if}
  
  {#if step === 'login'}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p class="text-gray-600">Completing login...</p>
    </div>
  {/if}
  
  {#if error}
    <div class="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-none">
      {error}
    </div>
  {/if}
</div>