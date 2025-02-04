import ParaWeb from '@getpara/web-sdk';

export const waitForPasskeyAndCreateWallet = async (para?: ParaWeb) => {
  if (!para) {
    throw new Error('no para instance');
  }

  try {
    const resp = await para.waitForPasskeyAndCreateWallet();

    if (!resp) {
      throw new Error('error during waitForAccountCreation');
    }
    return resp;
  } catch (e) {
    throw new Error(e);
  }
};
