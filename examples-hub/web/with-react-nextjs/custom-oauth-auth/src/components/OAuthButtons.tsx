import React from "react";
import { TOAuthMethod } from "@getpara/web-sdk";

interface OAuthOption {
  method: TOAuthMethod;
  label: string;
  icon: string;
}

const oAuthOptions: OAuthOption[] = [
  {
    method: "GOOGLE",
    label: "Continue with Google",
    icon: "/google.svg",
  },
  {
    method: "TWITTER",
    label: "Continue with Twitter",
    icon: "/twitter.svg",
  },
  {
    method: "APPLE",
    label: "Continue with Apple",
    icon: "/apple.svg",
  },
  {
    method: "DISCORD",
    label: "Continue with Discord",
    icon: "/discord.svg",
  },
  {
    method: "FACEBOOK",
    label: "Continue with Facebook",
    icon: "/facebook.svg",
  },
  {
    method: "FARCASTER",
    label: "Continue with Farcaster",
    icon: "/farcaster.svg",
  },
];

interface OAuthButtonsProps {
  onSelect: (method: TOAuthMethod) => void;
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
          data-testid={`auth-oauth-${method.toLowerCase()}`}
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
