import ParaWeb, { ConstructorOpts, Environment } from '@getpara/web-sdk';

export class ParaLegacyExample extends ParaWeb {
  simulateNoPasskey: boolean;

  constructor(env: Environment, apiKey: string, opts: ConstructorOpts & { simulateNoPasskey?: boolean }) {
    super(env, apiKey, opts);

    this.simulateNoPasskey = opts.simulateNoPasskey ?? false;
  }

  async isPasskeySupported() {
    return this.simulateNoPasskey ? false : await super.isPasskeySupported();
  }
}
