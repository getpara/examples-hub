import ParaWeb from '@getpara/web-sdk';
import { CountryCallingCode } from 'libphonenumber-js';

export enum CreateUserType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

export interface CreateUserArgs {
  type: CreateUserType;
  identifier: string;
  countryCode?: CountryCallingCode;
}

export const createUser = async (para?: ParaWeb, args?: CreateUserArgs) => {
  if (!para) {
    throw new Error('no para instance');
  }

  if (!args) {
    throw new Error('no valid args passed to createUser');
  }

  try {
    await (args.type === CreateUserType.EMAIL
      ? para.createUser({ email: args.identifier })
      : para.createUserByPhone({ phone: args.identifier, countryCode: args.countryCode }));
  } catch (e) {
    throw new Error(e);
  }
};
