import { AuthMethod } from '@getpara/user-management-client';
import ParaWeb from '@getpara/web-sdk';

export async function supportedLoginAuthMethods(para: ParaWeb): Promise<Set<AuthMethod>> {
  const { supportedAuthMethods, hasPasswordWithoutPIN } = await para.ctx.client.getSupportedAuthMethodsV2(
    para.authInfo.auth,
  );

  const authMethods = new Set<AuthMethod>();
  for (const type of supportedAuthMethods) {
    switch (type) {
      case 'PASSWORD':
        if (hasPasswordWithoutPIN) {
          authMethods.add(AuthMethod.PASSWORD);
        }
        break;
      case 'PASSKEY':
        authMethods.add(AuthMethod.PASSKEY);
        break;
      case 'PIN':
        authMethods.add(AuthMethod.PIN);
        break;
    }
  }
  return authMethods;
}
