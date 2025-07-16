import { ParaInternal } from '@getpara/react-common';
import ParaWeb, {
  CoreMethod,
  CoreMethodName,
  CoreMethodParams,
  CoreMethodResponse,
  CoreMethods,
  InternalAction,
  InternalMethod,
  InternalMethodName,
  InternalMethodParams,
  InternalMethodResponse,
  InternalMethods,
} from '@getpara/web-sdk';

export type CoreAction<method extends CoreMethodName & keyof CoreMethods> = (
  para?: ParaWeb,
  ...args: [CoreMethodParams<method>] | []
) => Promise<Awaited<CoreMethodResponse<method>>>;

export function generateCoreAction<const method extends CoreMethodName & keyof CoreMethods>(
  method: method,
): CoreAction<method> {
  return (async (_para?: ParaWeb, ...args: [CoreMethodParams<method>] | []): Promise<CoreMethodResponse<method>> => {
    try {
      if (!_para) {
        throw new Error('no para instance');
      }

      const para = _para as ParaInternal;

      return typeof para[method] === 'function'
        ? await (para[method] as CoreMethod<method> & Function)(...args)
        : (para[method] as CoreMethodResponse<method>);
    } catch (e) {
      throw e;
    }
  }) as CoreAction<method>;
}

export function generateInternalAction<const method extends InternalMethodName & keyof InternalMethods>(
  method: method,
): InternalAction<method> {
  return (async (
    _para?: ParaInternal,
    ...args: [InternalMethodParams<method>] | []
  ): Promise<InternalMethodResponse<method>> => {
    try {
      if (!_para) {
        throw new Error('no para instance');
      }

      const para = _para as ParaInternal;

      return typeof para[method] === 'function'
        ? await (para[method] as InternalMethod<method> & Function)(...args)
        : (para[method] as InternalMethodResponse<method>);
    } catch (e) {
      throw e;
    }
  }) as InternalAction<method>;
}
