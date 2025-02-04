import ParaWeb from '@getpara/web-sdk';

export const logout = async (para?: ParaWeb) => {
  if (!para) {
    throw new Error('no para instance');
  }

  try {
    await para.logout();
  } catch (e) {
    throw new Error(e);
  }
};
