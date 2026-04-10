interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  "data-testid"?: string;
}

export function ActionButton({
  onClick,
  disabled,
  isLoading,
  loadingText,
  children,
  type = "button",
  "data-testid": testId,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      data-testid={testId}
      className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
      {isLoading ? loadingText || "Loading..." : children}
    </button>
  );
}
