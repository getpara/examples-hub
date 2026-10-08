<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cx } from "@/lib/classNames";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    title: string;
    api?: string;
    description?: string;
    actions?: Snippet;
    hint?: string;
    children?: Snippet;
    className?: string;
  }

  let { title, api, description, actions, hint, children, className, ...sectionProps }: Props = $props();

  const titleId = $props.id();
</script>

<section
  aria-labelledby={titleId}
  class={cx("grid content-start gap-6 px-gutter pt-8 pb-10 md:px-sheet-x", className)}
  {...sectionProps}>
  <header class="grid gap-2">
    <h2 id={titleId} class="text-heading tracking-snug md:text-title">{title}</h2>
    {#if api}
      <code class="font-mono text-code break-words text-muted">{api}</code>
    {/if}
  </header>
  {#if description}
    <p class="max-w-[56ch] text-caption text-muted">{description}</p>
  {/if}
  {#if children}
    <div class="grid max-w-field gap-5">{@render children()}</div>
  {/if}
  {#if actions || hint}
    <div class="flex flex-wrap items-center gap-4 pt-2">
      {@render actions?.()}
      {#if hint}
        <p class="text-caption text-muted">{hint}</p>
      {/if}
    </div>
  {/if}
</section>
