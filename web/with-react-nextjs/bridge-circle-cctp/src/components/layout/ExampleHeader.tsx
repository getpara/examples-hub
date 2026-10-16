import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { shortenAddress } from "@/lib/format";

interface ExampleHeaderProps {
  scope: string;
  isConnected: boolean;
  address?: string;
  isConnecting?: boolean;
  connectLabel?: string;
  onConnect?: () => void;
  onOpenAccount?: () => void;
  isAccountOpen?: boolean;
  homeHref?: string;
}

const CHIP_CLASS =
  "inline-flex min-h-control-sm items-center gap-2 border border-border-strong bg-surface px-3 font-mono text-code text-foreground";

export function ExampleHeader({
  scope,
  isConnected,
  address = "",
  isConnecting = false,
  connectLabel = "Connect",
  onConnect,
  onOpenAccount,
  isAccountOpen,
  homeHref = "/",
}: ExampleHeaderProps) {
  const chipContent = (
    <>
      <span aria-hidden="true" className="size-2 flex-none bg-success" />
      <span>{shortenAddress(address)}</span>
    </>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <h1 className="sr-only">{scope}</h1>
      <div className="mx-auto flex min-h-header max-w-sheet items-center gap-3 border-border px-gutter md:gap-6 md:border-x md:px-sheet-x">
        <a href={homeHref} className="focus-ring inline-flex min-w-0 items-center gap-3 text-foreground">
          <img src="/para-logo.svg" alt="Para" width={86} height={22} className="hidden h-[22px] w-auto md:block" />
          <img src="/para-mark.svg" alt="Para" width={23} height={22} className="block h-[22px] w-auto md:hidden" />
          <span className="truncate border-l border-border-strong pl-3 font-mono text-mono-label text-muted uppercase">
            {scope}
          </span>
        </a>

        <div className="ml-auto flex flex-none items-center">
          {isConnected && onOpenAccount ? (
            <button
              type="button"
              onClick={onOpenAccount}
              aria-label={`Account ${address}`}
              aria-haspopup="dialog"
              aria-expanded={isAccountOpen}
              data-testid="account-address-display"
              data-address={address}
              className={`${CHIP_CLASS} focus-ring cursor-pointer transition-colors duration-200 ease-brand hover:bg-surface-2`}>
              {chipContent}
              <Icon name="caret-down" className="size-icon-sm text-muted" />
            </button>
          ) : isConnected ? (
            <span data-testid="account-address-display" data-address={address} className={CHIP_CLASS}>
              {chipContent}
            </span>
          ) : onConnect || isConnecting ? (
            <Button size="sm" isLoading={isConnecting} onClick={() => onConnect?.()} data-testid="header-connect-button">
              {connectLabel}
            </Button>
          ) : (
            <span role="status" className="inline-flex items-center gap-2 font-mono text-mono-label text-muted uppercase">
              <span aria-hidden="true" className="size-2 flex-none border border-border-strong" />
              Signed out
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
