import { UseMutationResult } from '@tanstack/react-query';
import { Compute, UnionStrictOmit } from './utils.js';

export type UseMutationReturnType<data = unknown, error = Error, variables = void, context = unknown> = Compute<
  UnionStrictOmit<UseMutationResult<data, error, variables, context>, 'mutate' | 'mutateAsync'>
>;
