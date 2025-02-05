import React from "react";
import { OAuthMethod } from "@getpara/web-sdk";

interface OAuthOption {
  method: OAuthMethod;
  label: string;
  icon: string;
}

const oAuthOptions: OAuthOption[] = [
  {
    method: OAuthMethod.GOOGLE,
    label: "Continue with Google",
    icon: "/google.svg",
  },
  {
    method: OAuthMethod.TWITTER,
    label: "Continue with Twitter",
    icon: "/twitter.svg",
  },
  {
    method: OAuthMethod.APPLE,
    label: "Continue with Apple",
    icon: "/apple.svg",
  },
  {
    method: OAuthMethod.DISCORD,
    label: "Continue with Discord",
    icon: "/discord.svg",
  },
  {
    method: OAuthMethod.FACEBOOK,
    label: "Continue with Facebook",
    icon: "/facebook.svg",
  },
  {
    method: OAuthMethod.FARCASTER,
    label: "Continue with Farcaster",
    icon: "/farcaster.svg",
  },
];

interface OAuthButtonsProps {
  onSelect: (method: OAuthMethod) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onSelect, isLoading, disabled = false }) => {
  return (
    <div className=" flex flex-col gap-3">
      {oAuthOptions.map(({ method, label, icon }) => (
        <button
          key={method}
          onClick={() => onSelect(method)}
          disabled={isLoading || disabled}
          className="flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-none hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <img
            src={icon}
            alt=""
            className="w-5 h-5"
            aria-hidden="true"
          />
          <span className="text-sm font-medium">{isLoading ? "Loading..." : label}</span>
        </button>
      ))}
    </div>
  );
};
