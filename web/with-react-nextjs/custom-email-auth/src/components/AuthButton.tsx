import React from "react";

interface AuthButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  onClick: () => void;
  loadingText?: string;
  children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  isLoading,
  disabled,
  onClick,
  loadingText = "Loading...",
  children,
}) => (
  <button
    disabled={disabled || isLoading}
    onClick={onClick}
    className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-none w-full">
    {isLoading ? loadingText : children}
  </button>
);
