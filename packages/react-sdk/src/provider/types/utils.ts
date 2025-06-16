import ParaWeb, {
  CoreMethodName,
  CoreMethodParams,
  CoreMethodResponse,
  CoreMethods,
  InternalMethodName,
  InternalMethodParams,
  InternalMethodResponse,
  InternalMethods,
} from '@getpara/web-sdk';
import { UseMutationReturnType } from './query.js';
import {
  UseMutateFunction,
  UseMutateAsyncFunction,
  MutationState,
  Mutation,
  UseQueryResult,
  Query,
} from '@tanstack/react-query';

export type Compute<type> = { [key in keyof type]: type[key] } & unknown;

/** Strict version of built-in Omit type */
export type StrictOmit<type, keys extends keyof type> = Pick<type, Exclude<keyof type, keys>>;

export type UnionStrictOmit<type, keys extends keyof type> = type extends any ? StrictOmit<type, keys> : never;

export type ChangeFields<T, R> = Omit<T, keyof R> & R;

type CoreSyncMutationHook<method extends CoreMethodName & keyof CoreMethods> = {
  mutate: UseMutateFunction<Awaited<CoreMethodResponse<method>>, Error, CoreMethodParams<method> | void, unknown>;
} & {
  [K in method]: UseMutateFunction<Awaited<CoreMethodResponse<method>>, Error, CoreMethodParams<method> | void, unknown>;
};

type CoreAsyncMutationHook<method extends CoreMethodName & keyof CoreMethods> = {
  mutateAsync: UseMutateAsyncFunction<CoreMethodResponse<method>, Error, CoreMethodParams<method> | void, unknown>;
} & {
  [K in `${method}Async`]: UseMutateAsyncFunction<
    CoreMethodResponse<method>,
    Error,
    CoreMethodParams<method> | void,
    unknown
  >;
};

export type CoreMethodUseMutationReturnType<method extends CoreMethodName & keyof CoreMethods> = UseMutationReturnType<
  Awaited<CoreMethodResponse<method>>,
  Error,
  CoreMethodParams<method> | void,
  unknown
>;

export type CoreMethodMutation<method extends CoreMethodName & keyof CoreMethods> = Mutation<
  Awaited<CoreMethodResponse<method>>,
  Error,
  CoreMethodParams<method> | void,
  unknown
>;

export type CoreMethodQuery<method extends CoreMethodName & keyof CoreMethods> = Query<
  Awaited<CoreMethodResponse<method>>,
  Error
>;

export type CoreGetterQuery<name extends keyof typeof ParaWeb> = Query<(typeof ParaWeb)[name] | null, Error>;

export type CoreMethodMutationState<method extends CoreMethodName & keyof CoreMethods> = MutationState<
  Awaited<CoreMethodResponse<method>>,
  Error,
  CoreMethodParams<method> | void,
  unknown
>;

export type CoreMethodMutationHook<method extends CoreMethodName & keyof CoreMethods> = Compute<
  CoreMethodUseMutationReturnType<method> & CoreSyncMutationHook<method> & CoreAsyncMutationHook<method>
>;

export type CoreMethodQueryHook<method extends CoreMethodName & keyof CoreMethods> = UseQueryResult<
  Awaited<CoreMethodResponse<method>>,
  Error
>;

export type CoreGetterQueryHook<name extends keyof typeof ParaWeb> = UseQueryResult<(typeof ParaWeb)[name] | null, Error>;

export type CoreMethodMutationStateHook<method extends CoreMethodName & keyof CoreMethods> = () => Omit<
  CoreMethodUseMutationReturnType<method>,
  'reset'
>;

type InternalSyncMutationHook<method extends InternalMethodName & keyof InternalMethods> = {
  mutate: UseMutateFunction<Awaited<InternalMethodResponse<method>>, Error, InternalMethodParams<method> | void, unknown>;
};

type InternalAsyncMutationHook<method extends InternalMethodName & keyof InternalMethods> = {
  mutateAsync: UseMutateAsyncFunction<InternalMethodResponse<method>, Error, InternalMethodParams<method> | void, unknown>;
};

export type InternalMethodUseMutationReturnType<method extends InternalMethodName & keyof InternalMethods> =
  UseMutationReturnType<Awaited<InternalMethodResponse<method>>, Error, InternalMethodParams<method> | void, unknown>;

export type InternalMethodMutation<method extends InternalMethodName & keyof InternalMethods> = Mutation<
  Awaited<InternalMethodResponse<method>>,
  Error,
  InternalMethodParams<method> | void,
  unknown
>;

export type InternalMethodQuery<method extends InternalMethodName & keyof InternalMethods> = Query<
  Awaited<InternalMethodResponse<method>>,
  Error
>;

export type InternalGetterQuery<name extends keyof typeof ParaWeb> = Query<(typeof ParaWeb)[name] | null, Error>;

export type InternalMethodMutationState<method extends InternalMethodName & keyof InternalMethods> = MutationState<
  Awaited<InternalMethodResponse<method>>,
  Error,
  InternalMethodParams<method> | void,
  unknown
>;

export type InternalMethodMutationHook<method extends InternalMethodName & keyof InternalMethods> = Compute<
  InternalMethodUseMutationReturnType<method> & InternalSyncMutationHook<method> & InternalAsyncMutationHook<method>
>;

export type InternalMethodQueryHook<method extends InternalMethodName & keyof InternalMethods> = UseQueryResult<
  Awaited<InternalMethodResponse<method>>,
  Error
>;

export type InternalGetterQueryHook<name extends keyof typeof ParaWeb> = UseQueryResult<
  (typeof ParaWeb)[name] | null,
  Error
>;

export type InternalMethodMutationStateHook<method extends InternalMethodName & keyof InternalMethods> = () => Omit<
  InternalMethodUseMutationReturnType<method>,
  'reset'
>;
