<script lang="ts">
  import type { AuthTab } from "@/stores/auth/combinedAuth";

  interface Props {
    activeTab: AuthTab;
    onTabChange: (tab: AuthTab) => void;
  }

  let { activeTab, onTabChange }: Props = $props();

  const tabs: Array<{ id: AuthTab; label: string }> = [
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "social", label: "Social" },
  ];
</script>

<div class="flex border-b border-gray-200 mb-6">
  {#each tabs as tab}
    <button
      type="button"
      class="flex-1 py-2 text-sm font-medium text-center transition-colors {activeTab === tab.id
        ? 'text-gray-900 border-b-2 border-gray-900'
        : 'text-gray-500 hover:text-gray-700'}"
      onclick={() => onTabChange(tab.id)}
    >
      {tab.label}
    </button>
  {/each}
</div>
