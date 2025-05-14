import ParaWeb, { ConstructorOpts, Environment } from '@getpara/web-sdk';

export class ParaBridge extends ParaWeb {
  #isPasskeySupported: boolean;

  constructor(
    env: Environment,
    apiKey: string,
    { isPasskeySupported = false, ...opts }: ConstructorOpts & { isPasskeySupported: boolean },
  ) {
    super(env, apiKey, opts);

    this.#isPasskeySupported = isPasskeySupported;
  }

  async isPasskeySupported(): Promise<boolean> {
    return this.#isPasskeySupported;
  }
}
