interface OAuthProvider {
  method: string;
  label: string;
  icon: string;
}

interface OAuthButtonsProps {
  providers: readonly OAuthProvider[];
  activeProvider: string | null;
  onAuthenticate: (method: string) => void;
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
    <div className="space-y-3">
      {providers.map(({ method, label, icon }) => (
        <button
          key={method}
          onClick={() => onAuthenticate(method)}
          disabled={isPending || disabled}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <img src={icon} alt="" className="w-5 h-5" />
          <span className="text-sm font-medium">
            {activeProvider === method ? "Loading..." : `Continue with ${label}`}
          </span>
        </button>
      ))}
    </div>
  );
}
