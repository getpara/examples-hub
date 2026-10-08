<script lang="ts">
  import Icon from "@/components/ui/Icon.svelte";

  interface Props {
    docsHref: string;
    sourceHref: string;
    examplesHref?: string;
    note?: string;
  }

  const LINK_CLASS =
    "focus-ring inline-flex items-center gap-1 text-muted transition-colors duration-200 ease-brand hover:text-foreground hover:underline hover:underline-offset-[3px]";

  let {
    docsHref,
    sourceHref,
    examplesHref = "https://examples.getpara.com",
    note = "Testnet only. No real funds move.",
  }: Props = $props();

  const resourceLinks = $derived([
    { label: "Docs", href: docsHref },
    { label: "Source", href: sourceHref },
    { label: "getpara.com", href: "https://getpara.com" },
  ]);
</script>

<footer class="border-t border-border bg-background text-caption text-muted">
  <div
    class="mx-auto grid max-w-sheet gap-4 px-gutter py-6 md:flex md:min-h-header md:items-center md:gap-8 md:border-x md:border-border md:px-sheet-x md:py-0">
    <a href={examplesHref} class="{LINK_CLASS} text-label">
      <Icon name="caret-left" className="size-icon-sm" />
      All examples
    </a>
    <p class="inline-flex items-center gap-2">
      <span aria-hidden="true" class="size-1.5 flex-none bg-accent"></span>
      {note}
    </p>
    <nav aria-label="Resources" class="flex flex-wrap gap-x-6 gap-y-2 md:ml-auto">
      {#each resourceLinks as link (link.label)}
        <a href={link.href} target="_blank" rel="noreferrer" class={LINK_CLASS}>
          {link.label}
          <Icon name="arrow-up-right" className="size-icon-sm" />
        </a>
      {/each}
    </nav>
  </div>
</footer>
