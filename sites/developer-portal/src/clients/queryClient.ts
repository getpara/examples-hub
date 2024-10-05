import { captureException, withScope } from '@sentry/react';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (err, _variables, _context, mutation) => {
      withScope(scope => {
        scope.setContext('mutation', {
          mutationId: mutation.mutationId,
          variables: mutation.state.variables,
        });
        if (mutation.options.mutationKey) {
          scope.setFingerprint(
            // Duplicate to prevent modification
            Array.from(mutation.options.mutationKey) as string[],
          );
        }
        captureException(err);
      });
    },
  }),
  queryCache: new QueryCache({
    onError: (err, query) => {
      withScope(scope => {
        scope.setContext('query', { queryHash: query.queryHash });
        scope.setFingerprint([query.queryHash]);
        captureException(err);
      });
    },
  }),
});
