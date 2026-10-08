<script lang="ts">
  import { cx } from "@/lib/classNames";

  interface Props {
    tone?: "accent" | "inverse";
    className?: string;
  }

  const DOTS: Array<[number, number]> = [
    [0, 0],
    [6, 0],
    [12, 0],
    [12, 6],
    [12, 12],
    [6, 12],
    [0, 12],
    [0, 6],
  ];

  let { tone = "accent", className }: Props = $props();
</script>

<svg
  viewBox="0 0 14 14"
  aria-hidden="true"
  class={cx("size-icon-md flex-none fill-current", tone === "accent" ? "text-accent" : "text-on-primary", className)}>
  {#each DOTS as [x, y], index (`${x}-${y}`)}
    <rect
      {x}
      {y}
      width="2"
      height="2"
      class="opacity-20 motion-safe:animate-loading-step motion-reduce:opacity-100"
      style:animation-delay="{index * 100}ms" />
  {/each}
</svg>
