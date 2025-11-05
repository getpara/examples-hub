import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CoreAuthInfo, ConstructorOpts as ParaConstructorOpts, Environment as ParaEnvironment } from '@getpara/web-sdk';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ParaPortal } from '../classes/ParaPortal';
import { DEFAULT_API_KEY } from '../constants';
import { AuthLoginParams } from '../types';
import { AuthExtras, AuthParams, extractAuthInfo } from '@getpara/user-management-client';
import { useExtractedParams } from '../hooks/useExtractedParams';
import { PortalEmitter } from '../classes';

interface ParaProviderProps extends PropsWithChildren {
  apiKey: string;
  partnerId?: string;
  para?: ParaPortal;
  environment: ParaEnvironment;
  options?: ParaConstructorOpts;
  onMount?: (para: ParaPortal) => void;
}

export const ParaContext = createContext<{ para: ParaPortal; portalEmitter: PortalEmitter | null }>(
  undefined as unknown as { para: ParaPortal; portalEmitter: PortalEmitter | null },
);

/**
 * A React Context provider that provides a `Para` instance to its children. You can either provide a `Para` instance
 * directly or provide the necessary information to create a new instance. To access the `Para` instance, use the `usePara` hook.
 *
 * @component
 * @param {Para} props.para - The `Para` object to provide to the children. If not provided, a new instance will be created using the other props.
 * @param {ParaEnvironment} props.environment - The environment to use for the `Para` instance, if an instance is not passed. Defaults to `PROD`.
 * @param {string?} props.apiKey - The partner API key used to create the `Para` instance, if an instance is not passed. Defaults to `undefined`.
 * @param {ParaConstructorOpts?} props.options - The constructor options used to create the `Para` instance, if an instance is not passed. Defaults to an empty object.
 * @param {(_: Para) => void?} props.onMount - A callback function that is called with the `Para` instance after it is first created or modified.
 *
 * @example
 * // Provide a pre-created `Para` instance
 * const para = new Para();
 *
 * <ParaProvider para={para}>
 *   <ChildComponent />
 * </ParaProvider>
 *
 * // Provide the options for a new `Para` instance
 * <ParaProvider
 *   environment="DEV"
 *   apiKey="my-api-key"
 *   options={{
 *     useSessionStorage: true,
 *   }}
 * >
 *   <ChildComponent />
 * </ParaProvider>
 *
 * // Access the `Para` instance from within a child component
 * const ChildComponent = () => {
 *   const para = usePara();
 *
 *   return (
 *     <div>{para.getEmail()}</div>
 *   );
 * }
 */

export const ParaProvider = (props: ParaProviderProps) => {
  const [searchParams] = useSearchParams();
  const { apiKey, environment, options, onMount, children, partnerId } = props;
  const paramsSupportedWalletTypes = searchParams.get('supportedWalletTypes');
  const loginCallbackRoute = searchParams.get('loginCallbackRoute');
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);

  const params = useExtractedParams<AuthLoginParams & AuthParams & AuthExtras>();

  const portalEmitter = useMemo(() => {
    return new PortalEmitter(params.origin);
  }, [params.origin]);
  // Check if current path is a callback route
  const isCallbackRoute = location.pathname.includes('/callback');

  const isExportPrivateKey =
    location.pathname.includes('/private-key') || loginCallbackRoute?.includes('/private-key') || false;

  const para = useMemo(() => {
    const opts = {
      ...options,
      isExportPrivateKey: isExportPrivateKey ?? false,
      ...(paramsSupportedWalletTypes
        ? { supportedWalletTypes: JSON.parse(decodeURIComponent(paramsSupportedWalletTypes)) }
        : {}),
      ...(partnerId && { portalPartnerId: partnerId }),
    };

    const client = props.para ?? new ParaPortal(environment, apiKey ?? DEFAULT_API_KEY, opts);

    return client;
  }, [apiKey, environment, options, props.para, paramsSupportedWalletTypes, partnerId, isExportPrivateKey]);
  para.ctx.isE2E = import.meta.env.VITE_IS_E2E === 'true';

  useEffect(() => {
    const setup = async () => {
      if (!para || hasInitialized.current || isCallbackRoute) {
        if (isCallbackRoute) {
          hasInitialized.current = true;
          setIsReady(true);
        }

        return;
      }

      await para.logout();
      onMount?.(para);
      hasInitialized.current = true;
      setIsReady(true);
    };

    setup();
  }, [para, onMount, isCallbackRoute]);

  useEffect(() => {
    async function setUserDetails() {
      if (!isReady || !para || !Object.keys(params).length) {
        return;
      }

      const authInfo: CoreAuthInfo = params.authInfo ?? {
        ...extractAuthInfo(params),
        pfpUrl: params.pfpUrl,
        displayName: params.displayName,
      };

      await para.setAuth(authInfo.auth, {
        extras: {
          displayName: authInfo.displayName ?? params.displayName,
          pfpUrl: authInfo.pfpUrl ?? params.pfpUrl,
          externalWallet: authInfo.externalWallet ?? params.externalWallet,
        },
        userId: params.userId,
      });

      if (params.pregenIds) {
        para.pregenIds = params.pregenIds;
      }
    }

    setUserDetails();
  }, [isReady, params]);

  if (!isReady) {
    return null;
  }

  return <ParaContext.Provider value={{ para, portalEmitter }}>{children}</ParaContext.Provider>;
};

/**
 * Returns the `Para` instance provided by the nearest `ParaProvider` in the component tree.
 */
export const usePara = () => {
  const { para } = useContext(ParaContext);
  return para;
};

export const usePortalEmitter = () => {
  const { portalEmitter } = useContext(ParaContext);
  return portalEmitter;
};
