import ParaCore, { PlatformUtils } from '@getpara/core-sdk';
import { ServerUtils } from './ServerUtils.js';

export class Para extends ParaCore {
  protected getPlatformUtils(): PlatformUtils {
    return new ServerUtils();
  }
}
