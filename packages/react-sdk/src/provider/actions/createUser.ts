import { Auth } from '@getpara/user-management-client';
import ParaWeb from '@getpara/web-sdk';

export type CreateUserArgs = Auth<'email'> | Auth<'phone'>;

export const createUser = async (para?: ParaWeb, args?: CreateUserArgs) => {
  if (!para) {
    throw new Error('no para instance');
  }

  if (!args) {
    throw new Error('no valid args passed to createUser');
  }

  const isEmail = 'email' in args;
  const isPhone = 'phone' in args;

  if (!isEmail && !isPhone) {
    throw new Error('invalid user creation args');
  }

  try {
    await (isEmail ? para.createUser(args) : para.createUserByPhone(args));
  } catch (e) {
    throw new Error(e);
  }
};
