import { useEmailOrPhoneAuth } from "@/hooks/useEmailOrPhoneAuth.svelte.js";

export function useEmailAuth(onAuthenticated: () => Promise<void>) {
  let email = $state("");
  const verification = useEmailOrPhoneAuth(onAuthenticated);

  async function submit() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || verification.isPending) {
      return;
    }

    email = trimmedEmail;
    await verification.authenticate({ email: trimmedEmail });
  }

  return {
    get email() {
      return email;
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
    setEmail: (value: string) => {
      email = value;
    },
    submit,
    openPasskeyWindow: verification.openPasskeyWindow,
    cancel: verification.cancel,
  };
}
