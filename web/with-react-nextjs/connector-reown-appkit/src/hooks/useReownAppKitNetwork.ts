import { useAppKitNetwork } from "@reown/appkit/react";

export function useReownAppKitNetwork() {
  const { caipNetwork } = useAppKitNetwork();

  return {
    networkName: caipNetwork?.name ?? "Unknown",
  };
}
