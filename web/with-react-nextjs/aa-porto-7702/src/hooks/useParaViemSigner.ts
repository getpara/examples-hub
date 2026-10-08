import { useParaViemAccount } from "@getpara/react-sdk/evm";

export function useParaViemSigner() {
  const { viemAccount, isLoading } = useParaViemAccount();

  return {
    address: viemAccount?.address ?? null,
    isLoading,
  };
}
