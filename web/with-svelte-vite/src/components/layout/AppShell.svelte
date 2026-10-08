<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    header: Snippet;
    footer: Snippet;
    children: Snippet;
  }

  let { header, footer, children }: Props = $props();
</script>

<div class="flex min-h-screen flex-col bg-background font-sans text-foreground">
  {@render header()}
  <main class="flex flex-1 flex-col">{@render children()}</main>
  {@render footer()}
</div>
