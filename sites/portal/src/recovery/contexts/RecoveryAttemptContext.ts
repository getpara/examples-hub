import { createContext } from 'react';
import type { RecoveryStatus } from '@getpara/web-sdk';
import emptyFunction from '../emptyFunction';

export enum RecoveryType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
}

interface RecoveryAttemptContextType {
  status: RecoveryStatus | null;
  setStatus: (status: RecoveryStatus | null) => void;
  initiatedAt: Date | null;
  setInitiatedAt: (initiatedAt: Date | null) => void;
  type: RecoveryType;
  setType: (type: RecoveryType | null) => void;
  twoFactorVerifiedInSession: boolean | null;
  setTwoFactorVerifiedInSession: (twoFactorVerifiedInSession: boolean | null) => void;
}

export const RecoveryAttemptContext = createContext<RecoveryAttemptContextType>({
  status: null,
  setStatus: emptyFunction,
  initiatedAt: null,
  setInitiatedAt: emptyFunction,
  type: null,
  setType: emptyFunction,
  twoFactorVerifiedInSession: null,
  setTwoFactorVerifiedInSession: emptyFunction,
});
