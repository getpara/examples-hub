import { CoreMethodName, CoreMethodParams, CoreMethodResponse, CoreMethods } from '@getpara/web-sdk';
import { CoreMethodQueryHook } from '../../types/utils.js';
import { useClient } from '../utils/index.js';
import { useQuery } from '@tanstack/react-query';
import { CoreAction } from '../../actions/utils.js';

export function generateCoreQueryHook<const method extends CoreMethodName & keyof CoreMethods>(
  method: method,
  action: CoreAction<method>,
  { isGetter = false, defaultParams }: { isGetter?: boolean; defaultParams?: CoreMethodParams<method> } = {},
): (params?: CoreMethodParams<method>) => CoreMethodQueryHook<method> {
  return (params: CoreMethodParams<method> | undefined = defaultParams) => {
    const para = useClient();

    return useQuery<
      Awaited<CoreMethodResponse<method>> | null,
      Error,
      Awaited<CoreMethodResponse<method>> | null,
      [CoreMethodName, CoreMethodParams<method> | null, unknown]
    >({
      queryKey: [method, params ?? null, isGetter ? (para?.[method] ?? null) : null],
      queryFn: async ({ queryKey: [_, params] }) => {
        if (!para) {
          return null;
        }

        const result = params
          ? await action(para, params)
          : defaultParams
            ? await action(para, defaultParams)
            : await action(para);

        return result ?? null;
      },
    });
  };
}
