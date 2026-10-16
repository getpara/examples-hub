import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

interface CopyButtonProps {
  label: string;
  copiedMessage: string;
  status?: CopyStatus;
  onCopy: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const ICON_NAMES: Record<CopyStatus, IconName> = {
  idle: "copy",
  copied: "check",
  failed: "warning",
};

const FAILED_MESSAGE = "Could not copy to the clipboard";

export function CopyButton({
  label,
  copiedMessage,
  status = "idle",
  onCopy,
  variant = "outline",
  size = "sm",
  className,
}: CopyButtonProps) {
  const visibleLabels: Record<CopyStatus, string> = { idle: label, copied: "Copied", failed: "Copy failed" };
  const statusMessages: Record<CopyStatus, string> = { idle: "", copied: copiedMessage, failed: FAILED_MESSAGE };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={onCopy}
        icon={<Icon name={ICON_NAMES[status]} className="size-icon-md" />}>
        {size === "icon" ? label : visibleLabels[status]}
      </Button>
      <span role="status" className="sr-only">
        {statusMessages[status]}
      </span>
    </>
  );
}
