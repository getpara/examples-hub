<script lang="ts">
  export let message: string = "";
  export let isLoading: boolean = false;
  export let onMessageChange: (value: string) => void;
  export let onSubmit: (e: Event) => void;
</script>

<form on:submit={onSubmit} class="space-y-6" data-testid="sign-message-form">
  <div>
    <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
      Message to Sign
    </label>
    <textarea
      id="message"
      value={message}
      on:input={(e) => onMessageChange(e.currentTarget.value)}
      data-testid="sign-message-input"
      class="w-full px-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
      rows="4"
      placeholder="Enter your message here..."></textarea>
  </div>

  <button
    type="submit"
    disabled={isLoading || !message}
    class="w-full px-6 py-3 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    data-testid="sign-message-button">
    {isLoading ? "Signing..." : "Sign Message"}
  </button>
</form>