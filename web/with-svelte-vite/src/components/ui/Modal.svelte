<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  
  export let isOpen: boolean = false;
  export let onClose: () => void = () => {};
  
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="relative w-full max-w-md bg-white rounded-none shadow-xl"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <button
        on:click={onClose}
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close modal"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
{/if}

<svelte:window on:keydown={handleKeydown} />