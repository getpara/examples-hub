<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    aside?: Snippet;
  }

  let { children, aside }: Props = $props();
</script>

<div
  class="mx-auto grid w-full max-w-sheet flex-1 grid-cols-1 content-start border-border md:border-x lg:grid-cols-[minmax(0,1fr)_var(--spacing-aside)] lg:content-stretch">
  <div class="grid content-start divide-y divide-border">{@render children()}</div>
  {#if aside}
    <div class="border-t border-border lg:border-t-0 lg:border-l">{@render aside()}</div>
  {/if}
</div>
