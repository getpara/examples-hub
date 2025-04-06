import { CoreMethodName, CoreMethodParams, CoreMethods } from '@getpara/web-sdk';
import { CoreMethodHook } from '../../types/utils.js';
import { renameCoreMutations } from '../../utils/renameMutations.js';
import { useClient } from '../utils/index.js';
import { useMutation } from '@tanstack/react-query';
import { CoreAction } from '../../actions/utils.js';

export function generateHook<const method extends CoreMethodName & keyof CoreMethods>(
  method: method,
  action: CoreAction<method>,
  defaultParams?: CoreMethodParams<method>,
): () => CoreMethodHook<method> {
  return () => {
    const para = useClient();

    const mutation = useMutation({
      mutationFn: async (args?: CoreMethodParams<method>) => {
        const result = await action(para, (args ?? defaultParams)!);

        return result;
      },
    });

    return renameCoreMutations<method>(mutation, method);
  };
}
