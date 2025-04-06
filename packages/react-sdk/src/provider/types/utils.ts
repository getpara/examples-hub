import { CoreMethodName, CoreMethodParams, CoreMethodResponse, CoreMethods } from '@getpara/web-sdk';
import { UseMutationReturnType } from './query.js';
import { UseMutateFunction, UseMutateAsyncFunction } from '@tanstack/react-query';

export type Compute<type> = { [key in keyof type]: type[key] } & unknown;

/** Strict version of built-in Omit type */
export type StrictOmit<type, keys extends keyof type> = Pick<type, Exclude<keyof type, keys>>;

export type UnionStrictOmit<type, keys extends keyof type> = type extends any ? StrictOmit<type, keys> : never;

export type ChangeFields<T, R> = Omit<T, keyof R> & R;

type SyncHook<method extends CoreMethodName & keyof CoreMethods> = {
  mutate: UseMutateFunction<Awaited<CoreMethodResponse<method>>, Error, CoreMethodParams<method> | void, unknown>;
} & {
  [K in method]: UseMutateFunction<Awaited<CoreMethodResponse<method>>, Error, CoreMethodParams<method> | void, unknown>;
};

type AsyncHook<method extends CoreMethodName & keyof CoreMethods> = {
  mutateAsync: UseMutateAsyncFunction<CoreMethodResponse<method>, Error, CoreMethodParams<method> | void, unknown>;
} & {
  [K in `${method}Async`]: UseMutateAsyncFunction<
    CoreMethodResponse<method>,
    Error,
    CoreMethodParams<method> | void,
    unknown
  >;
};

export type CoreMethodHook<method extends CoreMethodName & keyof CoreMethods> = Compute<
  UseMutationReturnType<CoreMethods[method]['response'], Error, CoreMethods[method]['params'] | void, unknown> &
    SyncHook<method> &
    AsyncHook<method>
>;
