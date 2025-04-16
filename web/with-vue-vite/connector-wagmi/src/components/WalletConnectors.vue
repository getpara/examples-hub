<template>
  <div class="w-full max-w-md">
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-6">Para Wagmi Example</h2>

      <div class="space-y-6">
        <!-- Social Login Section -->
        <div v-if="paraConnector">
          <h3 class="text-sm font-medium text-gray-500 mb-3">Social Login</h3>
          <button
            @click="connectWallet(paraConnector)"
            class="w-full px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors">
            Connect with {{ paraConnector.name }}
          </button>
        </div>

        <!-- Other Wallets Section -->
        <div v-if="otherConnectors.length">
          <h3 class="text-sm font-medium text-gray-500 mb-3">Other Wallets</h3>
          <div class="space-y-2">
            <button
              v-for="connector in otherConnectors"
              :key="connector.id"
              @click="connectWallet(connector)"
              class="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
              Connect with {{ connector.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useConnect } from "@wagmi/vue";
  import { computed } from "vue";

  const { connect, connectors } = useConnect();

  const paraConnector = computed(() => connectors.find((connector) => connector.id === "para"));
  console.log("paraConnector", paraConnector.value);

  const otherConnectors = computed(() => connectors.filter((connector) => connector.id !== "para"));
  console.log("otherConnectors", otherConnectors.value);

  function connectWallet(connector) {
    connect({ connector });
  }
</script>
