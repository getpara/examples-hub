import { ParaInternal } from '@getpara/react-common';
import ParaWeb, { CoreMethod, CoreMethodName, CoreMethodParams, CoreMethodResponse, CoreMethods } from '@getpara/web-sdk';

export type CoreAction<method extends CoreMethodName & keyof CoreMethods> = (
  para?: ParaWeb,
  ...args: [CoreMethodParams<method>]
) => Promise<Awaited<CoreMethodResponse<method>>>;

export function generateAction<const method extends CoreMethodName & keyof CoreMethods>(method: method): CoreAction<method> {
  return (async (_para?: ParaWeb, ...args: [CoreMethodParams<method>] | []): Promise<CoreMethodResponse<method>> => {
    if (!_para) {
      throw new Error('no para instance');
    }

    const para = _para as ParaInternal;

    return typeof para[method] === 'function'
      ? await (para[method] as CoreMethod<method> & Function)(...args)
      : (para[method] as CoreMethodResponse<method>);
  }) as CoreAction<method>;
}
