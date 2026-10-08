import { useEffect, useState } from "react";

export function useSecondsRemaining(deadlineInSeconds: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadlineInSeconds) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [deadlineInSeconds]);

  return deadlineInSeconds ? Math.max(deadlineInSeconds - Math.floor(now / 1000), 0) : 0;
}
