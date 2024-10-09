import { PropsWithChildren, createContext, useContext, useEffect, useMemo } from 'react';
import Capsule, { ConstructorOpts as CapsuleConstructorOpts, Environment as CapsuleEnvironment } from '@usecapsule/web-sdk';

interface CapsuleProviderProps extends PropsWithChildren {
  apiKey?: string;
  capsule?: Capsule;
  environment: CapsuleEnvironment;
  options?: CapsuleConstructorOpts;
  onMount?: (capsule: Capsule) => void;
}

export const CapsuleContext = createContext<Capsule>(undefined as unknown as Capsule);

/**
 * A React Context provider that provides a `Capsule` instance to its children. You can either provide a `Capsule` instance
 * directly or provide the necessary information to create a new instance. To access the `Capsule` instance, use the `useCapsule` hook.
 *
 * @component
 * @param {Capsule} props.capsule - The `Capsule` object to provide to the children. If not provided, a new instance will be created using the other props.
 * @param {CapsuleEnvironment} props.environment - The environment to use for the `Capsule` instance, if an instance is not passed. Defaults to `PROD`.
 * @param {string?} props.apiKey - The partner API key used to create the `Capsule` instance, if an instance is not passed. Defaults to `undefined`.
 * @param {CapsuleConstructorOpts?} props.options - The constructor options used to create the `Capsule` instance, if an instance is not passed. Defaults to an empty object.
 * @param {(_: Capsule) => void?} props.onMount - A callback function that is called with the `Capsule` instance after it is first created or modified.
 *
 * @example
 * // Provide a pre-created `Capsule` instance
 * const capsule = new Capsule();
 *
 * <CapsuleProvider capsule={capsule}>
 *   <ChildComponent />
 * </CapsuleProvider>
 *
 * // Provide the options for a new `Capsule` instance
 * <CapsuleProvider
 *   environment="DEV"
 *   apiKey="my-api-key"
 *   options={{
 *     useSessionStorage: true,
 *   }}
 * >
 *   <ChildComponent />
 * </CapsuleProvider>
 *
 * // Access the `Capsule` instance from within a child component
 * const ChildComponent = () => {
 *   const capsule = useCapsule();
 *
 *   return (
 *     <div>{capsule.getEmail()}</div>
 *   );
 * }
 */
export const CapsuleProvider = (props: CapsuleProviderProps) => {
  const { apiKey, environment, options, onMount, children } = props;

  const capsule = useMemo(
    () => props.capsule ?? new Capsule(environment, apiKey, options),
    [apiKey, environment, options, props.capsule],
  );

  useEffect(() => {
    onMount?.(capsule);
  }, [onMount, capsule]);

  return <CapsuleContext.Provider value={capsule}>{children}</CapsuleContext.Provider>;
};

/**
 * Returns the `Capsule` instance provided by the nearest `CapsuleProvider` in the component tree.
 */
export const useCapsule = () => useContext(CapsuleContext);
