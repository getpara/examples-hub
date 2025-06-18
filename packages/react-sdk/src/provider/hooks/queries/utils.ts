import ParaWeb, { CoreMethodName, CoreMethods } from '@getpara/web-sdk';
import { CoreMethodQueryHook } from '../../types/utils.js';
import { useClient } from '../utils/index.js';
import { useQuery } from '@tanstack/react-query';
import { CoreAction } from '../../actions/utils.js';

export function generateCoreQueryHook<const method extends CoreMethodName & keyof CoreMethods>(
  method: method,
  action: CoreAction<method> & ((_: ParaWeb) => Promise<unknown>),
): () => CoreMethodQueryHook<method> {
  return () => {
    const para = useClient();

    return useQuery({
      queryKey: [method],
      queryFn: async () => {
        if (!para) {
          return null;
        }

        const result = await action(para);

        return result ?? null;
      },
    });
  };
}
