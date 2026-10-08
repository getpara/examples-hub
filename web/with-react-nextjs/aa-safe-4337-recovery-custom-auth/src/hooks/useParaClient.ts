import { useEffect, useState } from "react";
import type ParaWeb from "@getpara/web-sdk";
import { para as paraClient } from "@/lib/para";

export function useParaClient() {
  const [para, setPara] = useState<ParaWeb | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!paraClient) {
        setErrorMessage("NEXT_PUBLIC_PARA_API_KEY is required.");
        return;
      }

      setPara(paraClient);

      try {
        await paraClient.init();
        await paraClient.setup();
        if (cancelled) return;
        setIsReady(true);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Could not initialize the wallet client.");
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  return { para, isReady, errorMessage };
}
