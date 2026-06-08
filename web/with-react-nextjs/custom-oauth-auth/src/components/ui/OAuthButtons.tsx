import Image from "next/image";
import type { OAuthProviderOption } from "@/types/auth";

interface OAuthButtonsProps {
  providers: readonly OAuthProviderOption[];
  activeProvider: OAuthProviderOption["method"] | null;
  onAuthenticate: (method: OAuthProviderOption["method"]) => void;
  isPending: boolean;
  disabled?: boolean;
}

export function OAuthButtons({
  providers,
  activeProvider,
  onAuthenticate,
  isPending,
  disabled,
}: OAuthButtonsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {providers.map(({ method, label, icon }) => (
        <button
          type="button"
          key={method}
          onClick={() => onAuthenticate(method)}
          disabled={isPending || disabled}
          className="btn-secondary flex min-h-11 w-full items-center justify-center gap-3 px-4 text-sm">
          <Image src={icon} alt="" width={20} height={20} className="h-5 w-5" />
          <span className="font-medium">
            {activeProvider === method ? "Loading..." : `Continue with ${label}`}
          </span>
        </button>
      ))}
    </div>
  );
}
