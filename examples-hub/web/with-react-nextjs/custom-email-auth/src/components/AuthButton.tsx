import React from "react";

interface AuthButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  onClick: () => void;
  loadingText?: string;
  children: React.ReactNode;
  "data-testid"?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  isLoading,
  disabled,
  onClick,
  loadingText = "Loading...",
  children,
  "data-testid": dataTestId,
}) => (
  <button
    disabled={disabled || isLoading}
    onClick={onClick}
    data-testid={dataTestId}
    className="bg-gray-900 hover:bg-gray-950 text-white px-4 py-2 rounded-none w-full disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
    {isLoading ? loadingText : children}
  </button>
);
