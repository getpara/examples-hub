import { useParaViemAccount } from "@getpara/react-sdk/evm";

export function useGuardianAccount() {
  const { viemAccount, isLoading } = useParaViemAccount();

  return {
    account: viemAccount ?? null,
    isLoading,
  };
}
