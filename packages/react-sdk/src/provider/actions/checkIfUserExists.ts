import { CountryCallingCode } from 'libphonenumber-js';
import { CreateUserType } from './createUser.js';
import ParaWeb from '@getpara/web-sdk';

export interface CheckIfUserExistsArgs {
  type: CreateUserType;
  identifier: string;
  countryCode?: CountryCallingCode;
}

export const checkIfUserExists = async (para?: ParaWeb, args?: CheckIfUserExistsArgs) => {
  if (!para) {
    throw new Error('no para instance');
  }

  if (!args) {
    throw new Error('no valid args passed to checkIfUserExists');
  }

  try {
    return await (args.type === CreateUserType.EMAIL
      ? para.checkIfUserExists({ email: args.identifier })
      : para.checkIfUserExistsByPhone({ phone: args.identifier, countryCode: args.countryCode }));
  } catch (e) {
    throw new Error(e);
  }
};
