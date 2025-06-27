<script lang="ts">
  import { authModal, signUpOrLoginWithPhone, verifyAccount, waitForLogin, waitForWalletCreation } from '@/stores/paraAuth';
  import AuthButton from './AuthButton.svelte';
  import OTPInput from './OTPInput.svelte';
  
  let popupWindow: Window | null = null;
  
  $: ({ phoneNumber, countryCode, verificationCode, step, isLoading, error } = $authModal);
  
  const countryCodes = [
    { code: '+1', country: 'US/CA' },
    { code: '+44', country: 'UK' },
    { code: '+33', country: 'FR' },
    { code: '+49', country: 'DE' },
    { code: '+81', country: 'JP' },
    { code: '+86', country: 'CN' },
    { code: '+91', country: 'IN' },
  ];
  
  function openPopup(url: string, name: string) {
    popupWindow?.close();
    popupWindow = window.open(url, name, 'popup=true');
  }
  
  async function handlePhoneSubmit() {
    if (!phoneNumber || !countryCode) return;
    
    try {
      const authState = await signUpOrLoginWithPhone(phoneNumber, countryCode);
      
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
  
  function handlePhoneChange(e: Event) {
    const target = e.target as HTMLInputElement;
    authModal.update(state => ({ ...state, phoneNumber: target.value }));
  }
  
  function handleCountryCodeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    authModal.update(state => ({ ...state, countryCode: target.value }));
  }
  
  function handleOTPChange(value: string) {
    authModal.update(state => ({ ...state, verificationCode: value }));
  }
  
  function formatPhoneDisplay(phone: string, code: string): string {
    return `${code} ${phone}`;
  }
</script>

<div class="space-y-4">
  {#if step === 'select' || step === 'phone'}
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
        Phone Number
      </label>
      <div class="flex gap-2">
        <select
          value={countryCode}
          on:change={handleCountryCodeChange}
          disabled={isLoading}
          class="px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {#each countryCodes as { code, country }}
            <option value={code}>{code} {country}</option>
          {/each}
        </select>
        
        <input
          id="phone"
          type="tel"
          value={phoneNumber}
          on:input={handlePhoneChange}
          disabled={isLoading}
          placeholder="123 456 7890"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
    
    <AuthButton
      {isLoading}
      disabled={!phoneNumber || !countryCode}
      onClick={handlePhoneSubmit}
    >
      Continue with Phone
    </AuthButton>
  {/if}
  
  {#if step === 'verify'}
    <div class="text-center space-y-4">
      <p class="text-sm text-gray-600">
        We sent a verification code to {formatPhoneDisplay(phoneNumber, countryCode)}
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