import { ref } from "vue";
import { useEmailOrPhoneAuth } from "@/hooks/useEmailOrPhoneAuth";

export function usePhoneAuth() {
  const countryCode = ref("+1");
  const phoneNumber = ref("");
  const verification = useEmailOrPhoneAuth();

  async function submit(): Promise<void> {
    const digits = phoneNumber.value.replace(/\D/g, "");

    if (!digits) {
      return;
    }

    await verification.authenticate({ phone: `${countryCode.value}${digits}` as `+${number}` });
  }

  return {
    countryCode,
    phoneNumber,
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
