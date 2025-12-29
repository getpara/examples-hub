interface ActionButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function ActionButton({
  onClick,
  isLoading = false,
  disabled = false,
  loadingText = "Processing...",
  children,
}: ActionButtonProps) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full py-3 px-4 bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
      {isLoading ? loadingText : children}
    </button>
  );
}
