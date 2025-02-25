import ParaWeb from '@getpara/web-sdk';

export interface LogoutArgs {
  clearPregenWallets?: boolean;
}

export const logout = async (para?: ParaWeb, args?: LogoutArgs) => {
  if (!para) {
    throw new Error('no para instance');
  }

  try {
    await para.logout(args);
  } catch (e) {
    throw new Error(e);
  }
};
