import { useId, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PickerIcon } from "@/components/ui/PickerIcon";
import { PressableRow, type PressableRowPosition } from "@/components/ui/PressableRow";

export interface WalletPickerOption {
  id: string;
  name: string;
  description: string;
  mark: ReactNode;
  connectingDescription?: string;
  testId?: string;
}

interface WalletPickerProps {
  isOpen: boolean;
  onClose: () => void;
  options: WalletPickerOption[];
  onSelect: (id: string) => void;
  connectingId?: string;
  title?: string;
  emptyMessage?: string;
  closeLabel?: string;
  testId?: string;
  closeTestId?: string;
}

function rowPosition(index: number, count: number): PressableRowPosition {
  if (count === 1) {
    return "standalone";
  }

  if (index === 0) {
    return "group-first";
  }

  return index === count - 1 ? "group-last" : "group-middle";
}

export function WalletPicker({
  isOpen,
  onClose,
  options,
  onSelect,
  connectingId,
  title = "Connect a wallet",
  emptyMessage = "No wallets are available.",
  closeLabel = "Close",
  testId,
  closeTestId,
}: WalletPickerProps) {
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
    <div
      className="fixed inset-0 z-20 grid items-end bg-foreground/48 md:place-items-center"
      onClick={closeOnBackdrop}
      onKeyDown={closeOnEscape}>
      <section
        role="dialog"
        aria-labelledby={titleId}
        data-testid={testId}
        className="grid w-full gap-5 border-t border-border-strong bg-background px-gutter py-5 text-foreground shadow-menu md:w-105 md:border md:p-6">
        <header className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-heading tracking-snug">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            autoFocus
            onClick={onClose}
            data-testid={closeTestId}
            icon={<Icon name="x" className="size-icon-md" />}>
            {closeLabel}
          </Button>
        </header>
        {options.length === 0 ? (
          <p className="text-caption text-muted">{emptyMessage}</p>
        ) : (
          <div className="grid">
            {options.map((option, index) => {
              const isConnecting = option.id === connectingId;

              return (
                <PressableRow
                  key={option.id}
                  title={option.name}
                  subtitle={isConnecting ? (option.connectingDescription ?? "Continue in your wallet") : option.description}
                  leading={option.mark}
                  trailing={<PickerIcon name={isConnecting ? "clock" : "caret-right"} className="size-6" />}
                  position={rowPosition(index, options.length)}
                  tone={index === 0 ? "accent" : "default"}
                  aria-busy={isConnecting || undefined}
                  onClick={() => {
                    if (!isConnecting) {
                      onSelect(option.id);
                    }
                  }}
                  data-testid={option.testId}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
