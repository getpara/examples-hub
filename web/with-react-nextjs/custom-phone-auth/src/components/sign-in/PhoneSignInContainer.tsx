import type { FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SelectField } from "@/components/ui/SelectField";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { StatusHint } from "@/components/ui/StatusHint";
import { TextField } from "@/components/ui/TextField";
import { VerificationFrame } from "@/components/ui/VerificationFrame";
import type { UsePhoneAuthReturn } from "@/hooks/usePhoneAuth";
import { describeSignInError, getVerifyDescription, getVerifyTitle } from "@/lib/signInCopy";
import { COUNTRY_CODES } from "@/lib/signInOptions";

interface PhoneSignInContainerProps {
  auth: UsePhoneAuthReturn;
  network: string;
}

export function PhoneSignInContainer({ auth, network }: PhoneSignInContainerProps) {
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
        title={getVerifyTitle("phone", hasFrame, hasPasskey)}
        description={getVerifyDescription(`${auth.countryCode} ${auth.phoneNumber}`, hasFrame, hasPasskey)}
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
    <SignInPanel description="Use your phone number." network={network}>
      {errorAlert}
      <form onSubmit={submit} className="grid gap-4">
        <SelectField
          label="Country"
          options={COUNTRY_CODES}
          value={auth.countryCode}
          onChange={(event) => auth.setCountryCode(event.target.value)}
          disabled={auth.isPending}
        />
        <TextField
          label="Phone number"
          type="tel"
          autoComplete="tel-national"
          placeholder="(555) 123-4567"
          prefix={auth.countryCode}
          value={auth.phoneNumber}
          onChange={(event) => auth.setPhoneNumber(event.target.value)}
          disabled={auth.isPending}
          required
        />
        <Button type="submit" size="lg" fullWidth isLoading={auth.isPending} disabled={!auth.phoneNumber}>
          Continue
        </Button>
      </form>
    </SignInPanel>
  );
}
