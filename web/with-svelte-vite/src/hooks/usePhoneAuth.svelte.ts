import { useEmailOrPhoneAuth } from "@/hooks/useEmailOrPhoneAuth.svelte.js";

const DEFAULT_COUNTRY_CODE = "+1";

export function usePhoneAuth(onAuthenticated: () => Promise<void>) {
  let countryCode = $state(DEFAULT_COUNTRY_CODE);
  let phoneNumber = $state("");
  const verification = useEmailOrPhoneAuth(onAuthenticated);

  async function submit() {
    const trimmedNumber = phoneNumber.trim();

    if (!trimmedNumber || verification.isPending) {
      return;
    }

    phoneNumber = trimmedNumber;
    const phone = `${countryCode}${trimmedNumber.replace(/\D/g, "")}` as `+${number}`;
    await verification.authenticate({ phone });
  }

  return {
    get countryCode() {
      return countryCode;
    },
    get phoneNumber() {
      return phoneNumber;
    },
    get step() {
      return verification.step;
    },
    get verifyUrl() {
      return verification.verifyUrl;
    },
    get passkeyUrl() {
      return verification.passkeyUrl;
    },
    get isPending() {
      return verification.isPending;
    },
    get error() {
      return verification.error;
    },
    setCountryCode: (value: string) => {
      countryCode = value;
    },
    setPhoneNumber: (value: string) => {
      phoneNumber = value;
    },
    submit,
    openPasskeyWindow: verification.openPasskeyWindow,
    cancel: verification.cancel,
  };
}
