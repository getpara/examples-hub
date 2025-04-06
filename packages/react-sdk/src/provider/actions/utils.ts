import ParaWeb, { CoreMethod, CoreMethodName, CoreMethodParams, CoreMethodResponse, CoreMethods } from '@getpara/web-sdk';

export type CoreAction<method extends CoreMethodName & keyof CoreMethods> = (
  para?: ParaWeb,
  ...args: [CoreMethodParams<method>]
) => Promise<Awaited<CoreMethodResponse<method>>>;

export function generateAction<const method extends CoreMethodName & keyof CoreMethods>(method: method): CoreAction<method> {
  return (async (para?: ParaWeb, ...args: [CoreMethodParams<method>] | []): Promise<CoreMethodResponse<method>> => {
    if (!para) {
      throw new Error('no para instance');
    }

    return await (para[method] as CoreMethod<method>)(...args);
  }) as CoreAction<method>;
}
