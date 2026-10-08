import type { FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { OAuthProviderList } from "@/components/ui/OAuthProviderList";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectField } from "@/components/ui/SelectField";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { StatusHint } from "@/components/ui/StatusHint";
import { TextField } from "@/components/ui/TextField";
import { VerificationFrame } from "@/components/ui/VerificationFrame";
import type { UseCombinedAuthReturn } from "@/hooks/useCombinedAuth";
import { describeSignInError, getVerifyDescription, getVerifyTitle } from "@/lib/signInCopy";
import { AUTH_TABS, COUNTRY_CODES, OAUTH_PROVIDERS, getOAuthProviderLabel } from "@/lib/signInOptions";

interface CombinedSignInContainerProps {
  auth: UseCombinedAuthReturn;
  network: string;
}

const SIGN_IN_DESCRIPTION = "Use your email, phone number, or a social account.";

export function CombinedSignInContainer({ auth, network }: CombinedSignInContainerProps) {
  const { email, phone, oauth } = auth;
  const error = describeSignInError(auth.error);
  const errorAlert = error && (
    <Alert variant="destructive" title={error.title}>
      {error.message}
    </Alert>
  );

  if (auth.activeTab !== "social" && auth.step === "verify" && (auth.verifyUrl || auth.passkeyUrl)) {
    const hasFrame = Boolean(auth.verifyUrl);
    const hasPasskey = Boolean(auth.passkeyUrl);
    const destination = auth.activeTab === "email" ? email.email : `${phone.countryCode} ${phone.phoneNumber}`;

    return (
      <SignInPanel
        title={getVerifyTitle(auth.activeTab, hasFrame, hasPasskey)}
        description={getVerifyDescription(destination, hasFrame, hasPasskey)}
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

  const oauthProviderLabel = oauth.isPending ? getOAuthProviderLabel(oauth.activeProvider) : null;

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    email.submit();
  };

  const submitPhone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    phone.submit();
  };

  return (
    <SignInPanel
      description={
        oauthProviderLabel ? `Finish signing in with ${oauthProviderLabel} in the pop-up window.` : SIGN_IN_DESCRIPTION
      }
      network={network}>
      <SegmentedControl
        label="Sign in with"
        options={AUTH_TABS}
        value={auth.activeTab}
        onChange={auth.setActiveTab}
        disabled={auth.isPending}
      />
      {errorAlert}

      {auth.activeTab === "email" && (
        <form onSubmit={submitEmail} className="grid gap-4">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email.email}
            onChange={(event) => email.setEmail(event.target.value)}
            disabled={email.isPending}
            required
          />
          <Button type="submit" size="lg" fullWidth isLoading={email.isPending} disabled={!email.email}>
            Continue
          </Button>
        </form>
      )}

      {auth.activeTab === "phone" && (
        <form onSubmit={submitPhone} className="grid gap-4">
          <SelectField
            label="Country"
            options={COUNTRY_CODES}
            value={phone.countryCode}
            onChange={(event) => phone.setCountryCode(event.target.value)}
            disabled={phone.isPending}
          />
          <TextField
            label="Phone number"
            type="tel"
            autoComplete="tel-national"
            placeholder="(555) 123-4567"
            prefix={phone.countryCode}
            value={phone.phoneNumber}
            onChange={(event) => phone.setPhoneNumber(event.target.value)}
            disabled={phone.isPending}
            required
          />
          <Button type="submit" size="lg" fullWidth isLoading={phone.isPending} disabled={!phone.phoneNumber}>
            Continue
          </Button>
        </form>
      )}

      {auth.activeTab === "social" && (
        <>
          <OAuthProviderList
            providers={OAUTH_PROVIDERS}
            onSelect={oauth.authenticate}
            activeId={oauth.isPending ? oauth.activeProvider : null}
            disabled={oauth.isPending}
          />
          {oauth.isPending && (
            <Button variant="outline" size="lg" fullWidth onClick={oauth.cancel}>
              Cancel
            </Button>
          )}
        </>
      )}
    </SignInPanel>
  );
}
