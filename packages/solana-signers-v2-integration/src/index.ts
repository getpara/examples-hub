export { ParaSolanaSigner } from './solanaSigner.js';
export * from './types.js';

import { ParaSolanaSigner } from './solanaSigner.js';
import type { ParaSignerParams } from './types.js';

export function createParaSolanaSigner(params: ParaSignerParams) {
  return new ParaSolanaSigner(params);
}
