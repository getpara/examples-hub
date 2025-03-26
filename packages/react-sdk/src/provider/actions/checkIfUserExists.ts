import ParaWeb from '@getpara/web-sdk';
import { Auth } from '@getpara/user-management-client';

export type CheckIfUserExistsArgs = Auth<'email'> | Auth<'phone'>;

export const checkIfUserExists = async (para?: ParaWeb, args?: CheckIfUserExistsArgs) => {
  if (!para) {
    throw new Error('no para instance');
  }

  if (!args) {
    throw new Error('no valid args passed to checkIfUserExists');
  }

  const isEmail = 'email' in args;
  const isPhone = 'phone' in args;

  if (!isEmail && !isPhone) {
    throw new Error('invalid user exists args');
  }

  try {
    return await (isEmail ? para.checkIfUserExists(args) : para.checkIfUserExistsByPhone(args));
  } catch (e) {
    throw new Error(e);
  }
};
