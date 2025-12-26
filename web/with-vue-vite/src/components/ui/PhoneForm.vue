<script setup lang="ts">
import { ref } from "vue";
import { usePhoneAuth } from "@/composables/auth/usePhoneAuth";
import { COUNTRY_CODES } from "@/constants/auth";

defineProps<{
  isPending: boolean;
}>();

const { submit } = usePhoneAuth();
const countryCode = ref("+1");
const phoneNumber = ref("");

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!phoneNumber.value.trim()) return;
  await submit(phoneNumber.value.trim(), countryCode.value);
}
</script>

<template>
  <form @submit="handleSubmit" class="space-y-4">
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
        Phone Number
      </label>
      <div class="flex gap-2">
        <select
          v-model="countryCode"
          :disabled="isPending"
          class="px-2 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option v-for="{ code, label } in COUNTRY_CODES" :key="code" :value="code">
            {{ label }}
          </option>
        </select>
        <input
          id="phone"
          v-model="phoneNumber"
          type="tel"
          placeholder="123-456-7890"
          :disabled="isPending"
          required
          data-testid="phone-input"
          class="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>

    <button
      type="submit"
      :disabled="!phoneNumber.trim() || isPending"
      data-testid="continue-phone-button"
      class="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {{ isPending ? "Signing in..." : "Continue with Phone" }}
    </button>
  </form>
</template>
