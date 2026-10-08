<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { cx } from "@/lib/classNames";

  interface Props extends Omit<HTMLInputAttributes, "prefix"> {
    label: string;
    hint?: string;
    error?: string;
    prefix?: string;
    trailing?: string;
    className?: string;
  }

  let { label, hint, error, prefix, trailing, id, className, disabled, ...inputProps }: Props = $props();

  const generatedId = $props.id();
  const inputId = $derived(id ?? generatedId);
  const messageId = $derived(`${inputId}-message`);
  const message = $derived(error ?? hint);
</script>

<div class={cx("grid min-w-0 gap-2", disabled && "opacity-50", className)}>
  <label for={inputId} class="truncate text-label tracking-ui">{label}</label>
  <div
    class={cx(
      "flex min-h-control-lg items-stretch border bg-surface transition-[border-color,box-shadow] duration-200 ease-brand motion-reduce:transition-none",
      error
        ? "border-destructive shadow-[inset_0_-2px_0_var(--color-destructive)]"
        : "border-border-strong focus-within:border-foreground focus-within:shadow-[inset_0_-2px_0_var(--color-accent)]"
    )}>
    {#if prefix}
      <span class="flex flex-none items-center gap-1 border-r border-border pr-3 pl-4 text-body font-medium">{prefix}</span>
    {/if}
    <input
      id={inputId}
      {disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={message ? messageId : undefined}
      class="min-w-0 flex-1 bg-transparent px-4 text-body text-foreground caret-accent outline-none placeholder:text-muted disabled:cursor-not-allowed"
      {...inputProps} />
    {#if trailing}
      <span class="flex flex-none items-center pr-4 text-caption text-muted">{trailing}</span>
    {/if}
  </div>
  {#if message}
    <p id={messageId} class={cx("text-caption", error ? "text-destructive" : "text-muted")}>{message}</p>
  {/if}
</div>
