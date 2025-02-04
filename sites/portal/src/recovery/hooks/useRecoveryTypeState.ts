import { useState } from 'react';
import { STORAGE_PREFIX } from '@getpara/core-sdk';
import { RecoveryType } from '../contexts/RecoveryAttemptContext';

const useRecoveryTypeState = (initialValue: RecoveryType | null) => {
  const [state, setState] = useState(
    (sessionStorage.getItem(`${STORAGE_PREFIX}recoveryType`) as RecoveryType) || initialValue,
  );

  const setRecoveryType = (value: RecoveryType) => {
    setState(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}recoveryType`, value);
  };

  return [state, setRecoveryType] as const;
};

export default useRecoveryTypeState;
