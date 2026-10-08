import { Icon } from "@/components/ui/Icon";

interface VerificationFrameProps {
  url: string;
  label?: string;
  title?: string;
}

const FRAME_SANDBOX = "allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts";
const FRAME_PERMISSIONS = "publickey-credentials-get *; publickey-credentials-create *";

export function VerificationFrame({ url, label = "Para verification", title = label }: VerificationFrameProps) {
  return (
    <div className="grid border border-border-strong bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 font-mono text-mono-label text-muted">
        <Icon name="lock-simple" />
        {label}
      </div>
      <div className="bg-[radial-gradient(var(--color-border)_1px,transparent_1.5px)] bg-size-[12px_12px]">
        <iframe
          src={url}
          title={title}
          allow={FRAME_PERMISSIONS}
          sandbox={FRAME_SANDBOX}
          className="block h-[400px] w-full border-0"
        />
      </div>
    </div>
  );
}
