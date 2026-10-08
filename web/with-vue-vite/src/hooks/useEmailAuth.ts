import { ref } from "vue";
import { useEmailOrPhoneAuth } from "@/hooks/useEmailOrPhoneAuth";

export function useEmailAuth() {
  const email = ref("");
  const verification = useEmailOrPhoneAuth();

  async function submit(): Promise<void> {
    const address = email.value.trim();

    if (!address) {
      return;
    }

    await verification.authenticate({ email: address });
  }

  return {
    email,
    step: verification.step,
    verifyUrl: verification.verifyUrl,
    passkeyUrl: verification.passkeyUrl,
    isPending: verification.isPending,
    errorMessage: verification.errorMessage,
    submit,
    openPasskeyWindow: verification.openPasskeyWindow,
    cancel: verification.cancel,
  };
}
