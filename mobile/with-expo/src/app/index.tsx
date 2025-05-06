import { usePara } from "@/providers/para/usePara";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated, isInitialized } = usePara();

  if (!isInitialized) {
    return null;
  }

  return <Redirect href={isAuthenticated ? "/home" : "/auth"} />;
}
