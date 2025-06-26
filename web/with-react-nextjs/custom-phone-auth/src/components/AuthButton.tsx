"use client";

interface AuthButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  onClick: () => void;
  loadingText?: string;
  children: React.ReactNode;
}

export function AuthButton({
  isLoading,
  disabled,
  onClick,
  loadingText = "Loading...",
  children,
}: AuthButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      onClick={onClick}
      className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
      {isLoading ? loadingText : children}
    </button>
  );
}
