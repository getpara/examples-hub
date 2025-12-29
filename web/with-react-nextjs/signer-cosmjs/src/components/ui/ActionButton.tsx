interface ActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function ActionButton({
  onClick,
  isLoading,
  disabled,
  loadingText,
  children,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isLoading || disabled}>
      {isLoading ? (loadingText || "Loading...") : children}
    </button>
  );
}
