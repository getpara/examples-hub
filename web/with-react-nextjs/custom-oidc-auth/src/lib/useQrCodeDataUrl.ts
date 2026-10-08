import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeResult {
  text: string;
  dataUrl: string | null;
  hasFailed: boolean;
}

export function useQrCodeDataUrl(text: string | null) {
  const [result, setResult] = useState<QrCodeResult | null>(null);

  useEffect(() => {
    if (!text) {
      return;
    }

    let isActive = true;

    QRCode.toString(text, { type: "svg", errorCorrectionLevel: "M", margin: 1 })
      .then((svg) => {
        if (isActive) {
          setResult({ text, dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, hasFailed: false });
        }
      })
      .catch(() => {
        if (isActive) {
          setResult({ text, dataUrl: null, hasFailed: true });
        }
      });

    return () => {
      isActive = false;
    };
  }, [text]);

  const current = result?.text === text ? result : null;

  return { dataUrl: current?.dataUrl ?? null, hasFailed: current?.hasFailed ?? false };
}
