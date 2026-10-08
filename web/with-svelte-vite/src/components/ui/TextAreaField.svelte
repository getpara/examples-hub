<script lang="ts">
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import { cx } from "@/lib/classNames";

  interface Props extends HTMLTextareaAttributes {
    label: string;
    hint?: string;
    error?: string;
    className?: string;
  }

  let { label, hint, error, id, className, disabled, rows = 3, ...textAreaProps }: Props = $props();

  const generatedId = $props.id();
  const textAreaId = $derived(id ?? generatedId);
  const messageId = $derived(`${textAreaId}-message`);
  const message = $derived(error ?? hint);
</script>

<div class={cx("grid min-w-0 gap-2", disabled && "opacity-50", className)}>
  <label for={textAreaId} class="text-label tracking-ui">{label}</label>
  <textarea
    id={textAreaId}
    {rows}
    {disabled}
    aria-invalid={error ? true : undefined}
    aria-describedby={message ? messageId : undefined}
    class={cx(
      "min-h-[88px] w-full resize-none border bg-surface px-3 py-2 text-body text-foreground caret-accent outline-none [overflow-wrap:anywhere] transition-[border-color,box-shadow] duration-200 ease-brand placeholder:text-muted disabled:cursor-not-allowed motion-reduce:transition-none",
      error
        ? "border-destructive shadow-[inset_0_-2px_0_var(--color-destructive)]"
        : "border-border-strong focus:border-foreground focus:shadow-[inset_0_-2px_0_var(--color-accent)]"
    )}
    {...textAreaProps}></textarea>
  {#if message}
    <p id={messageId} class={cx("text-caption", error ? "text-destructive" : "text-muted")}>{message}</p>
  {/if}
</div>
