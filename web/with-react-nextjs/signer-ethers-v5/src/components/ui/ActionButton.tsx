interface ActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  loadingText?: string;
  type?: "button" | "submit";
  children: React.ReactNode;
}

export function ActionButton({
  onClick,
  isLoading,
  disabled,
  loadingText,
  type = "button",
  children,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="btn-primary w-full px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      disabled={isLoading || disabled}>
      {isLoading ? loadingText || "Loading..." : children}
    </button>
  );
}
