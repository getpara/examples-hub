import ParaWeb from '@getpara/web-sdk';

export interface waitForAccountCreationArgs {
  popupWindow?: Window | null;
}

export const waitForAccountCreation = async (para?: ParaWeb, args?: waitForAccountCreationArgs) => {
  if (!para) {
    throw new Error('no para instance');
  }

  try {
    const isComplete = await para.waitForAccountCreation(args);

    if (!isComplete) {
      throw new Error('error during waitForAccountCreation');
    }
    return isComplete;
  } catch (e) {
    throw new Error(e);
  }
};
