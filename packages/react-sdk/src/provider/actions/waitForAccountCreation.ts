import ParaWeb from '@getpara/web-sdk';

export const waitForAccountCreation = async (para?: ParaWeb) => {
  if (!para) {
    throw new Error('no para instance');
  }

  try {
    const isComplete = await para.waitForAccountCreation();

    if (!isComplete) {
      throw new Error('error during waitForAccountCreation');
    }
    return isComplete;
  } catch (e) {
    throw new Error(e);
  }
};
