<script lang="ts">
  export let isLoading: boolean = false;
  export let disabled: boolean = false;
  export let onClick: () => void = () => {};
  export let loadingText: string = 'Loading...';
  export let variant: 'primary' | 'secondary' = 'primary';
</script>

<button
  on:click={onClick}
  disabled={disabled || isLoading}
  class="w-full px-4 py-2 font-medium rounded-none transition-colors disabled:cursor-not-allowed
    {variant === 'primary' 
      ? 'bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400' 
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'}"
  {...$$restProps}
>
  {#if isLoading}
    <span class="flex items-center justify-center gap-2">
      <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      {loadingText}
    </span>
  {:else}
    <slot />
  {/if}
</button>