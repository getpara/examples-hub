import { createContext } from 'react';
import { RecoveryStatus } from '../../library/Capsule';
import emptyFunction from '../emptyFunction';

interface RecoveryAttemptContextType {
  status: RecoveryStatus | null;
  setStatus: (status: RecoveryStatus | null) => void;
  initiatedAt: Date | null;
  setInitiatedAt: (initiatedAt: Date | null) => void;
}

export const RecoveryAttemptContext = createContext<RecoveryAttemptContextType>({
  status: null,
  setStatus: emptyFunction,
  initiatedAt: null,
  setInitiatedAt: emptyFunction,
});