import ParaWeb from '@getpara/web-sdk';

export interface WaitForLoginAndSetupArgs {
  loginWindow?: Window;
  skipSessionRefresh?: boolean;
}

export const waitForLoginAndSetup = async (para?: ParaWeb, args?: WaitForLoginAndSetupArgs) => {
  if (!para) {
    throw new Error('no para instance');
  }

  if (!args) {
    throw new Error('no valid args passed to waitForLoginAndSetup');
  }

  try {
    const resp = await para.waitForLoginAndSetup(args);

    if (resp.isError) {
      throw new Error('error during waitForLoginAndSetup');
    }
    return resp;
  } catch (e) {
    throw new Error(e);
  }
};
