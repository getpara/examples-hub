<script lang="ts">
  export let show: boolean = false;
  export let type: "info" | "error" | "success" = "info";
  export let message: string = "";

  $: alertClasses = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    error: "bg-red-50 text-red-800 border-red-200",
    success: "bg-green-50 text-green-800 border-green-200",
  }[type];
</script>

{#if show}
  <div class="mb-6 rounded-none border p-4 {alertClasses}">
    <p class="text-sm font-medium">{message}</p>
  </div>
{/if}