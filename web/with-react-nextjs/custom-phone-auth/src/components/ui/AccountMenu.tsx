import { useId, type KeyboardEvent, type MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Icon } from "@/components/ui/Icon";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  title?: string;
  connectionLabel?: string;
  addressCopyStatus?: CopyStatus;
  onCopyAddress?: () => void;
  explorerHref?: string;
  explorerLabel?: string;
  onDisconnect: () => void;
  isDisconnecting?: boolean;
  disconnectLabel?: string;
  disconnectTestId?: string;
}

export function AccountMenu({
  isOpen,
  onClose,
  address,
  title = "Account",
  connectionLabel = "Connected with Para",
  addressCopyStatus = "idle",
  onCopyAddress,
  explorerHref,
  explorerLabel = "View on explorer",
  onDisconnect,
  isDisconnecting = false,
  disconnectLabel = "Disconnect",
  disconnectTestId,
}: AccountMenuProps) {
  const titleId = useId();

  if (!isOpen) {
    return null;
  }

  const closeOnBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const closeOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-20" onClick={closeOnBackdrop} onKeyDown={closeOnEscape}>
      <div
        className="mx-auto flex max-w-sheet justify-end px-gutter pt-[calc(var(--spacing-header)+8px)] md:px-sheet-x"
        onClick={closeOnBackdrop}>
        <section
          role="dialog"
          aria-labelledby={titleId}
          className="grid w-90 max-w-full gap-5 border border-border-strong bg-background p-6 text-foreground shadow-menu">
          <header className="flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-heading tracking-snug">
              {title}
            </h2>
            <Button variant="ghost" size="icon" autoFocus onClick={onClose} icon={<Icon name="x" className="size-icon-md" />}>
              Close
            </Button>
          </header>
          <div className="grid gap-2">
            <span className="font-mono text-mono-label text-muted uppercase">{connectionLabel}</span>
            <code className="border border-border bg-surface p-3 font-mono text-code [overflow-wrap:anywhere]">{address}</code>
          </div>
          {(onCopyAddress || explorerHref) && (
            <div className="flex flex-wrap gap-2">
              {onCopyAddress && (
                <CopyButton
                  size="md"
                  label="Copy address"
                  copiedMessage="Address copied"
                  status={addressCopyStatus}
                  onCopy={onCopyAddress}
                />
              )}
              {explorerHref && (
                <a
                  href={explorerHref}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring state-layer inline-flex min-h-control-md items-center gap-2 px-control-x text-label tracking-ui text-foreground">
                  <Icon name="arrow-up-right" className="size-icon-md" />
                  {explorerLabel}
                </a>
              )}
            </div>
          )}
          <div className="border-t border-border pt-4">
            <Button
              variant="destructive"
              isLoading={isDisconnecting}
              onClick={onDisconnect}
              data-testid={disconnectTestId}
              icon={<Icon name="sign-out" className="size-icon-md" />}>
              {disconnectLabel}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
