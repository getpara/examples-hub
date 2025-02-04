import ParaCore from '@getpara/core-sdk';
import { WebUtils } from './WebUtils.js';

export class Para extends ParaCore {
  protected getPlatformUtils() {
    return new WebUtils();
  }
}
