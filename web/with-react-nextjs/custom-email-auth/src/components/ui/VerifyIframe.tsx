interface VerifyIframeProps {
  url: string;
  onCancel: () => void;
  statusMessage?: string;
}

const VERIFICATION_IFRAME_SANDBOX =
  "allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts";

export function VerifyIframe({ url, onCancel, statusMessage }: VerifyIframeProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-muted">
        <iframe
          src={url}
          className="h-[400px] w-full border-0"
          allow="publickey-credentials-get *; publickey-credentials-create *"
          sandbox={VERIFICATION_IFRAME_SANDBOX}
          title="Para Verification"
        />
      </div>

      {statusMessage && <div className="text-center text-sm text-muted-foreground">{statusMessage}</div>}

      <button
        type="button"
        onClick={onCancel}
        className="btn-secondary min-h-11 w-full px-4 text-sm">
        Cancel
      </button>
    </div>
  );
}
