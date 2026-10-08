<script lang="ts" module>
  export interface OAuthProviderOption<Id extends string> {
    id: Id;
    label: string;
    markSrc: string;
    testId?: string;
  }
</script>

<script lang="ts" generics="Id extends string">
  import Button from "@/components/ui/Button.svelte";
  import { cx } from "@/lib/classNames";

  interface Props {
    providers: ReadonlyArray<OAuthProviderOption<Id>>;
    onSelect: (id: Id) => void;
    activeId?: string | null;
    disabled?: boolean;
    layout?: "list" | "grid";
    labelPrefix?: string;
  }

  let {
    providers,
    onSelect,
    activeId = null,
    disabled = false,
    layout = "list",
    labelPrefix = "Continue with",
  }: Props = $props();
</script>

<div class={cx("grid gap-2", layout === "grid" ? "grid-cols-2" : "grid-cols-1")}>
  {#each providers as provider (provider.id)}
    {@const isActive = activeId === provider.id}
    <Button
      variant="outline"
      size="lg"
      fullWidth
      className="justify-start!"
      isLoading={isActive}
      disabled={!isActive && (disabled || activeId !== null)}
      onclick={() => onSelect(provider.id)}
      data-testid={provider.testId}>
      {#snippet icon()}
        <img src={provider.markSrc} alt="" width={20} height={20} class="size-icon-md" />
      {/snippet}
      {`${labelPrefix} ${provider.label}`.trim()}
    </Button>
  {/each}
</div>
