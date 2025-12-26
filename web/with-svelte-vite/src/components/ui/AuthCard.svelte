<script lang="ts">
  interface Props {
    error?: string | null;
    children?: import("svelte").Snippet;
  }

  let { error = null, children }: Props = $props();
</script>

<div class="bg-white border border-gray-200 p-6 w-full max-w-md mx-auto">
  <h2 class="text-xl font-semibold mb-6 text-center">Sign In</h2>

  {#if error}
    <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
      {error}
    </div>
  {/if}

  {@render children?.()}
</div>
