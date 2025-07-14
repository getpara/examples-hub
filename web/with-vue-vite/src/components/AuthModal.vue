<template>
  <Modal
    :is-open="state.isOpen"
    @close="closeModal">
    <div class="space-y-4">
      <h2 class="text-xl font-bold">
        {{ isConnected ? "Account Settings" : "Connect Wallet" }}
      </h2>

      <template v-if="isConnected">
        <div class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-none border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Connected Account</p>
            <p class="text-sm font-mono text-gray-900">{{ address?.slice(0, 6) }}...{{ address?.slice(-4) }}</p>
          </div>

          <AuthButton
            :is-loading="state.isLoading"
            @click="handleLogout"
            loading-text="Logging out..."
            data-testid="logout-button">
            Logout
          </AuthButton>
        </div>
      </template>

      <template v-else>
        <!-- Tab Navigation -->
        <div class="flex border-b border-gray-200">
          <button
            @click="setActiveTab('email')"
            :class="tabClasses('email')"
            data-testid="email-tab">
            Email
          </button>
          <button
            @click="setActiveTab('phone')"
            :class="tabClasses('phone')"
            data-testid="phone-tab">
            Phone
          </button>
        </div>

        <!-- Tab Content -->
        <div>
          <EmailAuthTab v-if="state.activeTab === 'email'" />
          <PhoneAuthTab v-else-if="state.activeTab === 'phone'" />
        </div>

        <!-- Divider -->
        <AuthDivider />

        <!-- Social Auth Section -->
        <SocialAuthSection />
      </template>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { useParaAuth } from "@/composables/useParaAuth";
  import { useParaAccount } from "@/composables/useParaAccount";
  import Modal from "./ui/Modal.vue";
  import EmailAuthTab from "./auth/EmailAuthTab.vue";
  import PhoneAuthTab from "./auth/PhoneAuthTab.vue";
  import SocialAuthSection from "./auth/SocialAuthSection.vue";
  import AuthDivider from "./auth/AuthDivider.vue";
  import AuthButton from "./auth/AuthButton.vue";

  const { state, closeModal, setActiveTab, logout } = useParaAuth();
  const { isConnected, address } = useParaAccount();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Error handled in composable
    }
  }

  function tabClasses(tab: "email" | "phone") {
    const base = "flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors";
    const active = state.activeTab === tab;

    return `${base} ${
      active ? "text-gray-900 border-gray-900" : "text-gray-500 border-transparent hover:text-gray-700"
    }`;
  }
</script>
