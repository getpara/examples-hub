export function useAccountMenu(isConnected: () => boolean) {
  let isOpen = $state(false);
  let lastConnected: boolean | null = null;

  $effect(() => {
    const connected = isConnected();

    if (lastConnected !== null && lastConnected !== connected) {
      isOpen = false;
    }

    lastConnected = connected;
  });

  return {
    get isOpen() {
      return isOpen;
    },
    toggle: () => {
      isOpen = !isOpen;
    },
    close: () => {
      isOpen = false;
    },
  };
}
