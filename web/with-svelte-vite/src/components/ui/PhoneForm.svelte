<script lang="ts">
  import { submit } from "@/stores/auth/phoneAuth";
  import { COUNTRY_CODES } from "@/constants/auth";

  interface Props {
    isPending: boolean;
  }

  let { isPending }: Props = $props();
  let countryCode = $state("+1");
  let phoneNumber = $state("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!phoneNumber.trim() || isPending) return;
    await submit(phoneNumber.trim(), countryCode);
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
      Phone Number
    </label>
    <div class="flex gap-2">
      <select
        bind:value={countryCode}
        disabled={isPending}
        class="px-2 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {#each COUNTRY_CODES as { code, label }}
          <option value={code}>{label}</option>
        {/each}
      </select>
      <input
        id="phone"
        type="tel"
        bind:value={phoneNumber}
        placeholder="123-456-7890"
        disabled={isPending}
        required
        data-testid="phone-input"
        class="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  </div>

  <button
    type="submit"
    disabled={!phoneNumber.trim() || isPending}
    data-testid="continue-phone-button"
    class="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
  >
    {isPending ? "Signing in..." : "Continue with Phone"}
  </button>
</form>
