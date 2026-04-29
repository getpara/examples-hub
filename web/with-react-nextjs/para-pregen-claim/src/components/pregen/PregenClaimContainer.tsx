"use client";

import { PregenClaimView } from "@/components/pregen/PregenClaimView";
import { usePregenClaimFlow } from "@/hooks/usePregenClaimFlow";

export function PregenClaimContainer() {
  const flow = usePregenClaimFlow();

  return <PregenClaimView {...flow} />;
}
