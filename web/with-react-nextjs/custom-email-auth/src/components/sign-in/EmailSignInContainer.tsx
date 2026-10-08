import type { FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { StatusHint } from "@/components/ui/StatusHint";
import { TextField } from "@/components/ui/TextField";
import { VerificationFrame } from "@/components/ui/VerificationFrame";
import type { UseEmailAuthReturn } from "@/hooks/useEmailAuth";
import { describeSignInError, getVerifyDescription, getVerifyTitle } from "@/lib/signInCopy";

interface EmailSignInContainerProps {
  auth: UseEmailAuthReturn;
  network: string;
}

export function EmailSignInContainer({ auth, network }: EmailSignInContainerProps) {
  const error = describeSignInError(auth.error);
  const errorAlert = error && (
    <Alert variant="destructive" title={error.title}>
      {error.message}
    </Alert>
  );

  if (auth.step === "verify" && (auth.verifyUrl || auth.passkeyUrl)) {
    const hasFrame = Boolean(auth.verifyUrl);
    const hasPasskey = Boolean(auth.passkeyUrl);

    return (
      <SignInPanel
        title={getVerifyTitle("email", hasFrame, hasPasskey)}
        description={getVerifyDescription(auth.email, hasFrame, hasPasskey)}
        network={network}>
        {errorAlert}
        {auth.verifyUrl && <VerificationFrame url={auth.verifyUrl} />}
        {hasPasskey && (
          <>
            <Button
              size="lg"
              fullWidth
              onClick={auth.openPasskeyWindow}
              icon={<Icon name="fingerprint-simple" className="size-icon-md" />}>
              Open Passkey Verification
            </Button>
            <StatusHint>Waiting for the passkey window to finish.</StatusHint>
          </>
        )}
        <Button variant="outline" size="lg" fullWidth onClick={auth.cancel}>
          Cancel
        </Button>
      </SignInPanel>
    );
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    auth.submit();
  };

  return (
    <SignInPanel description="Sign in or create an account with your email." network={network}>
      {errorAlert}
      <form onSubmit={submit} className="grid gap-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={auth.email}
          onChange={(event) => auth.setEmail(event.target.value)}
          disabled={auth.isPending}
          required
        />
        <Button type="submit" size="lg" fullWidth isLoading={auth.isPending} disabled={!auth.email}>
          Continue
        </Button>
      </form>
    </SignInPanel>
  );
}
