import { useCallback, useState } from "react";

export function useAccountMenu(isConnected: boolean) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastConnected, setLastConnected] = useState(isConnected);

  if (lastConnected !== isConnected) {
    setLastConnected(isConnected);
    setIsOpen(false);
  }

  const toggle = useCallback(() => setIsOpen((open) => !open), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, toggle, close };
}
