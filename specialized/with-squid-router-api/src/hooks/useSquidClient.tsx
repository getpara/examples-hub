import { useEffect, useState } from "react";
import { Squid } from "@0xsquid/sdk";
import { SQUID_INTEGRATOR_ID } from "@/constants";

let squidInstance: Squid | null = null;

export function useSquidClient() {
  const [client, setClient] = useState<Squid | null>(squidInstance);

  useEffect(() => {
    if (squidInstance) {
      setClient(squidInstance);
      return;
    }

    const initSquid = async () => {
      const squid = new Squid({
        baseUrl: "https://v2.api.squidrouter.com",
        integratorId: SQUID_INTEGRATOR_ID,
      });
      await squid.init();
      squidInstance = squid;
      setClient(squid);
    };

    initSquid();
  }, []);

  return client;
}
