<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<p role="status" class="text-center text-caption text-muted">{@render children()}</p>
