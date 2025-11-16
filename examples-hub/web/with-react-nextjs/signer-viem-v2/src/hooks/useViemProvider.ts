import { useViem } from "@/context/ParaProvider";

export function useViemProvider() {
  const { publicClient } = useViem();
  return publicClient;
}