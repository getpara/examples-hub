import type { AuthTab } from "@/hooks/useCombinedAuth";

interface AuthTabsProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  disabled?: boolean;
}

const TABS: { id: AuthTab; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "social", label: "Social" },
];

export function AuthTabs({ activeTab, onTabChange, disabled }: AuthTabsProps) {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          disabled={disabled}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === id
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          } disabled:cursor-not-allowed`}>
          {label}
        </button>
      ))}
    </div>
  );
}
