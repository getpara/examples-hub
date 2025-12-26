<script lang="ts">
  import { submit } from "@/stores/auth/emailAuth";

  interface Props {
    isPending: boolean;
  }

  let { isPending }: Props = $props();
  let email = $state("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!email.trim() || isPending) return;
    await submit(email.trim());
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
      Email Address
    </label>
    <input
      id="email"
      type="email"
      bind:value={email}
      placeholder="you@example.com"
      disabled={isPending}
      required
      data-testid="email-input"
      class="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  </div>

  <button
    type="submit"
    disabled={!email.trim() || isPending}
    data-testid="continue-email-button"
    class="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
  >
    {isPending ? "Signing in..." : "Continue with Email"}
  </button>
</form>
