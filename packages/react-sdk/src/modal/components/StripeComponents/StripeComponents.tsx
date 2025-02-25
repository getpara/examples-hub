import React from 'react';
import { OnrampSessionResult } from '@stripe/crypto';

export const STRIPE_PUBLISHABLE_KEY =
  'pk_live_51MvquNGrzDeP5yP9EgVSMBPQbrbg0oHDjPIIXypePd0jzOFjbadyfO7wBKLHhUtbKIUiEUVC3YYcTJyAmJ8xA7JE00T2UDfYKz';
export const STRIPE_PUBLISHABLE_KEY_TEST =
  'pk_test_51MvquNGrzDeP5yP98WgPaAUgQ50I3OpfPhVfiLO47FBHepJnZRPO62IzZY2uxT5ovhSS10RwcTcnaVil1mcJOzIi00dHapODdS';

const CryptoElementsContext = React.createContext<{ onramp: any }>({ onramp: null });
CryptoElementsContext.displayName = 'CryptoElementsContext';

export const CryptoElements = ({ stripeOnramp, children }) => {
  const [ctx, setContext] = React.useState(() => ({
    onramp: null,
  }));

  React.useEffect(() => {
    let isMounted = true;

    Promise.resolve(stripeOnramp).then(onramp => {
      if (onramp && isMounted) {
        setContext(ctx => (ctx.onramp ? ctx : { onramp }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stripeOnramp]);

  return <CryptoElementsContext.Provider value={ctx}>{children}</CryptoElementsContext.Provider>;
};

// React hook to get StripeOnramp from context
export const useStripeOnramp = () => {
  const context = React.useContext(CryptoElementsContext);
  return context?.onramp;
};

// React element to render Onramp UI
const useOnrampSessionListener = (type, session, callback) => {
  React.useEffect(() => {
    if (session && callback) {
      const listener = e => callback(e.payload);
      session.addEventListener(type, listener);
      return () => {
        session.removeEventListener(type, listener);
      };
    }
    return () => {};
  }, [session, callback, type]);
};

export const OnrampElement = ({
  clientSecret,
  appearance,
  onReady = () => {},
  onSessionChange,
  ...props
}: {
  clientSecret: string;
  appearance: 'dark' | 'light';
  onReady?: () => void;
  onSessionChange: (_: { session: OnrampSessionResult }) => void;
}) => {
  const stripeOnramp = useStripeOnramp();
  const onrampElementRef = React.useRef<HTMLDivElement>(null);
  const [session, setSession] = React.useState();

  const appearanceJSON = JSON.stringify(appearance);
  React.useEffect(() => {
    const containerRef = onrampElementRef.current;
    if (containerRef) {
      // NB: ideally we want to be able to hot swap/update onramp iframe
      // This currently results a flash if one needs to mint a new session when they need to udpate fixed transaction details
      containerRef.innerHTML = '';

      if (clientSecret && stripeOnramp) {
        setSession(
          stripeOnramp
            .createSession({
              clientSecret,
              appearance: { theme: appearance },
            })
            .mount(containerRef),
        );
      }
    }
  }, [appearanceJSON, clientSecret, stripeOnramp]);

  useOnrampSessionListener('onramp_ui_loaded', session, onReady);
  useOnrampSessionListener('onramp_session_updated', session, onSessionChange);

  return <div {...props} ref={onrampElementRef}></div>;
};
