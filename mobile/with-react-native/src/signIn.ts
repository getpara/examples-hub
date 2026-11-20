import InAppBrowser from 'react-native-inappbrowser-reborn';
import type { StateSnapshot } from '@getpara/react-native-wallet';
import { para } from './para';

// Deep link the in-app browser returns to (see the `para-sdk-demo` scheme in Info.plist / AndroidManifest.xml).
const APP_REDIRECT_URL = 'para-sdk-demo://para';

type EmailOrPhone = { email: string } | { phone: `+${number}` };

/**
 * Signs in with an email or phone (auth v2). Para's hosted page sends and checks the code, then signs the user in
 * or creates their account. While the call runs, this opens the pages Para asks for and runs the steps that need
 * this device's passkey.
 */
export async function signInWithEmailOrPhone(
  auth: EmailOrPhone,
): Promise<void> {
  let lastUrl: string | null = null;
  let passkeyStep = false;
  let failure: unknown = null;
  const fail = (error: unknown) => {
    failure = failure ?? error;
  };

  const openPortal = async (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    const result = await InAppBrowser.openAuth(
      `${url}${separator}nativeCallbackUrl=${encodeURIComponent(APP_REDIRECT_URL)}`,
      APP_REDIRECT_URL,
    );
    if (result.type === 'cancel' && !passkeyStep) {
      fail(new Error('Sign-in was canceled'));
    }
  };

  const stopWatchingState = para.onStatePhaseChange(
    ({ authStateInfo }: StateSnapshot) => {
      const { verificationUrl, passwordUrl, isCredentialSetup, passkeyId } =
        authStateInfo;

      // A new account at a passkey partner creates its passkey on this device after the code
      if (isCredentialSetup && passkeyId && !passkeyStep) {
        passkeyStep = true;
        para.registerPasskey(passkeyId).catch(fail);
        return;
      }

      // The code page, or a password page for a new account at a password partner
      const url = verificationUrl ?? passwordUrl;
      if (url && url !== lastUrl) {
        lastUrl = url;
        openPortal(url).catch(fail);
      }
    },
  );

  // A returning account protected by a passkey on this device: the hosted page hands the step back after the code
  const stopWatchingPasskey = para.onPasskeyLoginRequired(() => {
    passkeyStep = true;
    InAppBrowser.closeAuth();
    para.loginWithPasskey().catch(fail);
  });

  try {
    await para.authenticateWithEmailOrPhone({
      auth,
      sessionPollingCallbacks: { isCanceled: () => failure !== null },
    });
  } catch (error) {
    throw failure ?? error;
  } finally {
    stopWatchingState();
    stopWatchingPasskey();
  }
  if (failure) {
    throw failure;
  }
}
