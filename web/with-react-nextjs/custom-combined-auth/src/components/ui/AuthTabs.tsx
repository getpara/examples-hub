import type { AuthTab } from "@/types/auth";

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
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
      {TABS.map(({ id, label }) => (
        <button
          type="button"
          key={id}
          onClick={() => onTabChange(id)}
          disabled={disabled}
          className={`min-h-10 rounded-md px-3 text-sm font-medium transition-colors ${
            activeTab === id
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-card-foreground"
          } disabled:cursor-not-allowed disabled:opacity-60`}>
          {label}
        </button>
      ))}
    </div>
  );
}
