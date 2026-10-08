interface QrCodeProps {
  src: string | null;
  label: string;
  testId?: string;
}

const FRAME_CLASS = "size-40 justify-self-center border border-border-strong bg-surface p-2";

export function QrCode({ src, label, testId }: QrCodeProps) {
  if (!src) {
    return <span aria-hidden="true" className={`block ${FRAME_CLASS}`} />;
  }

  return <img src={src} alt={label} width={160} height={160} data-testid={testId} className={FRAME_CLASS} />;
}
