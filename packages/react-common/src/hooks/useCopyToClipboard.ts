import { useCallback, useState } from 'react';

type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): [boolean, CopyFn] {
  const [copied, setCopied] = useState(false);

  const clearState = () => {
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const copy: CopyFn = useCallback(async text => {
    if (typeof navigator === 'undefined') {
      return;
    }

    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearState();
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopied(false);
      return false;
    }
  }, []);

  return [copied, copy];
}
