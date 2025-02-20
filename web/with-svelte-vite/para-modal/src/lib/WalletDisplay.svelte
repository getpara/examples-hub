<script lang="ts">
  export let walletAddress: string | undefined;
</script>

<div class="text-center flex flex-col gap-2">
  <h2 class="text-xl font-bold">You are logged in!</h2>
  {#if walletAddress}
    <p>Your first wallet address is: <strong>{walletAddress}</strong></p>
  {:else}
    <p>No wallet found.</p>
  {/if}
</div>
