<script lang="ts">
  export let signature: string = "";
</script>

<div class="mt-6 rounded-none border border-gray-200">
  <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
    <h3 class="text-sm font-medium text-gray-900">Signature</h3>
  </div>
  <div class="px-6 py-3">
    <p class="text-sm text-gray-600 font-mono break-all">
      {signature}
    </p>
  </div>
</div>