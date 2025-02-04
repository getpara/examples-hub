import ParaWeb from '@getpara/web-sdk';

export const keepSessionAlive = async (para?: ParaWeb) => {
  if (!para) {
    throw new Error('no para instance');
  }

  try {
    const resp = await para.keepSessionAlive();

    if (!resp) {
      throw new Error('session expired');
    }
  } catch (e) {
    throw new Error(e);
  }
};
