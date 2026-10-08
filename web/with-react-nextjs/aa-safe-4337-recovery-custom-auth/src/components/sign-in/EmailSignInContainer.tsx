import type { FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { StatusHint } from "@/components/ui/StatusHint";
import { TextField } from "@/components/ui/TextField";
import { VerificationFrame } from "@/components/ui/VerificationFrame";
import type { EmailPasskeyAuth } from "@/hooks/useEmailPasskeyAuth";
import { formatErrorMessage } from "@/lib/format";

interface EmailSignInContainerProps {
  auth: EmailPasskeyAuth;
  isReady: boolean;
  errorMessage: string | null;
  network: string;
}

export function EmailSignInContainer({ auth, isReady, errorMessage, network }: EmailSignInContainerProps) {
  const error = formatErrorMessage(errorMessage);
  const errorAlert = error && (
    <Alert variant="destructive" title="Sign in failed">
      {error}
    </Alert>
  );
  const cancelButton = (
    <Button variant="outline" size="lg" fullWidth onClick={auth.cancel}>
      Cancel
    </Button>
  );
  const codeDescription = `Enter the code sent to ${auth.email.trim()}.`;

  if (auth.verifyUrl) {
    return (
      <SignInPanel title="Check your email" description={codeDescription} network={network}>
        {errorAlert}
        <VerificationFrame url={auth.verifyUrl} />
        {cancelButton}
      </SignInPanel>
    );
  }

  if (auth.needsVerificationCode) {
    const submitCode = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void auth.submitVerificationCode();
    };

    return (
      <SignInPanel title="Check your email" description={codeDescription} network={network}>
        {errorAlert}
        <form onSubmit={submitCode} className="grid gap-4">
          <TextField
            label="Code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={auth.verificationCode}
            onChange={(event) => auth.setVerificationCode(event.target.value)}
            data-testid="custom-auth-otp-input"
          />
          <Button type="submit" size="lg" fullWidth isLoading={auth.isPending} data-testid="verify-code-button">
            Verify Code
          </Button>
        </form>
        {cancelButton}
      </SignInPanel>
    );
  }

  if (auth.passkeyUrl) {
    return (
      <SignInPanel
        title="Verify your passkey"
        description="Create or use your passkey to finish signing in."
        network={network}>
        {errorAlert}
        <Button
          size="lg"
          fullWidth
          onClick={auth.openPasskeyWindow}
          icon={<Icon name="fingerprint-simple" className="size-icon-md" />}
          data-testid="open-passkey-button">
          Open Passkey Verification
        </Button>
        {auth.isPasskeyWindowOpen && <StatusHint>Waiting for the passkey window to finish.</StatusHint>}
        {cancelButton}
      </SignInPanel>
    );
  }

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void auth.submit();
  };

  return (
    <SignInPanel
      title="Recover a Safe account"
      description="Sign in with your email to act as the recovery guardian for a Safe ERC-4337 account."
      network={network}>
      {errorAlert}
      <form onSubmit={submitEmail} className="grid gap-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={auth.email}
          onChange={(event) => auth.setEmail(event.target.value)}
          data-testid="custom-auth-email-input"
        />
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={auth.isPending}
          disabled={!isReady}
          data-testid="auth-connect-button">
          Continue
        </Button>
      </form>
    </SignInPanel>
  );
}
