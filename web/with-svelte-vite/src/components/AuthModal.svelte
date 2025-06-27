<script lang="ts">
  import { authModal, closeModal, logout } from '@/stores/paraAuth';
  import { isConnected, address } from '@/stores/paraAccount';
  import Modal from './ui/Modal.svelte';
  import EmailAuthTab from './auth/EmailAuthTab.svelte';
  import PhoneAuthTab from './auth/PhoneAuthTab.svelte';
  import SocialAuthSection from './auth/SocialAuthSection.svelte';
  import AuthDivider from './auth/AuthDivider.svelte';
  import AuthButton from './auth/AuthButton.svelte';
  
  $: ({ isOpen, activeTab, isLoading } = $authModal);
  
  function setActiveTab(tab: 'email' | 'phone') {
    authModal.update(state => ({ 
      ...state, 
      activeTab: tab,
      step: tab === 'email' ? 'email' : 'phone',
      error: null 
    }));
  }
  
  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Error handled in store
    }
  }
</script>

<Modal {isOpen} onClose={closeModal}>
  <div class="space-y-4">
    <h2 class="text-xl font-bold">
      {$isConnected ? 'Account Settings' : 'Connect Wallet'}
    </h2>
    
    {#if $isConnected}
      <div class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-none border border-gray-200">
          <p class="text-sm text-gray-600 mb-1">Connected Account</p>
          <p class="text-sm font-mono text-gray-900">
            {$address?.slice(0, 6)}...{$address?.slice(-4)}
          </p>
        </div>
        
        <AuthButton
          {isLoading}
          onClick={handleLogout}
          loadingText="Logging out..."
        >
          Logout
        </AuthButton>
      </div>
    {:else}
      <!-- Tab Navigation -->
      <div class="flex border-b border-gray-200">
        <button
          on:click={() => setActiveTab('email')}
          class="flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors
            {activeTab === 'email' 
              ? 'text-gray-900 border-gray-900' 
              : 'text-gray-500 border-transparent hover:text-gray-700'}"
        >
          Email
        </button>
        <button
          on:click={() => setActiveTab('phone')}
          class="flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors
            {activeTab === 'phone' 
              ? 'text-gray-900 border-gray-900' 
              : 'text-gray-500 border-transparent hover:text-gray-700'}"
        >
          Phone
        </button>
      </div>
      
      <!-- Tab Content -->
      <div>
        {#if activeTab === 'email'}
          <EmailAuthTab />
        {:else if activeTab === 'phone'}
          <PhoneAuthTab />
        {/if}
      </div>
      
      <!-- Divider -->
      <AuthDivider />
      
      <!-- Social Auth Section -->
      <SocialAuthSection />
    {/if}
  </div>
</Modal>