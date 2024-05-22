import { HStack, Spacer, VStack } from '@chakra-ui/react';
import React, { useState, useEffect, useContext } from 'react';
import { RecoveryStatus } from '@usecapsule/web-sdk';
import RecoverWalletButton from './RecoverWalletButton';
import { RecoveryAttemptContext } from '../../contexts/RecoveryAttemptContext';
import { ENV } from '../../../constants';
import TwoFactorContext from '../../contexts/TwoFactorContext';

const timeDurations = {
  prod: { initiated: 48 * 60 * 60, ready: 72 * 60 * 60 },
  notProd: { initiated: 10, ready: 60 * 60 },
};

const calculateTargetTime = (initiatedAt: Date, status: RecoveryStatus, env: string): Date => {
  const addSeconds =
    env === 'prod'
      ? status === RecoveryStatus.INITIATED
        ? timeDurations.prod.initiated
        : timeDurations.prod.ready
      : status === RecoveryStatus.INITIATED
        ? timeDurations.notProd.initiated
        : timeDurations.notProd.ready;

  const targetTime = new Date(initiatedAt);
  targetTime.setSeconds(targetTime.getSeconds() + addSeconds);
  return targetTime;
};

const getTimeRemaining = (status: RecoveryStatus, initiatedAt: Date) => {
  if ([RecoveryStatus.EXPIRED, RecoveryStatus.FINISHED].includes(status)) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      message: status === RecoveryStatus.EXPIRED ? 'Time Expired' : 'Recovery was successful!',
    };
  }
  const now = new Date();
  const targetTime = calculateTargetTime(initiatedAt, status, ENV);
  const totalSeconds = Math.max(0, Math.floor((targetTime.getTime() - now.getTime()) / 1000));

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    message: '',
  };
};

const RecoveryMessage = ({ status }) => {
  const { is2FAFlow } = useContext(TwoFactorContext);

  switch (status as RecoveryStatus) {
    case RecoveryStatus.INITIATED:
      return (
        <VStack flexGrow={1}>
          <h2>Recovery Status: Attempt Initiated</h2>
          <p>{`Please come back to this page after 48 hours have elapsed (see timer)`}</p>
        </VStack>
      );
    case RecoveryStatus.READY:
      return (
        <div style={{ textAlign: 'left' }}>
          <h2>Recovery Status: Ready to Recover</h2>
          <p>You'll need to:</p>
          <HStack>
            <ul className="indent">
              <li>Confirm Email</li>
              {is2FAFlow && <li>Enter a 2FA Code...</li>}
            </ul>
            <Spacer />
            <RecoverWalletButton />
          </HStack>
        </div>
      );
    case RecoveryStatus.EXPIRED:
      return (
        <VStack flexGrow={1}>
          <h2>Recovery Status: Attempt Expired</h2>
          <p>Too much time elapsed from when the Recovery Attempt was initiated. Please restart the recovery process</p>
        </VStack>
      );
    case RecoveryStatus.FINISHED:
      return (
        <VStack flexGrow={1}>
          <h2>Recovery Status: Success</h2>
          <p>You're recovery status was a success</p>
        </VStack>
      );
    default:
      return null;
  }
};

const RecoveryTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, message: '' });
  const { status, setStatus, initiatedAt } = useContext(RecoveryAttemptContext);

  useEffect(() => {
    const updateTimer = () => {
      const remainingTime = getTimeRemaining(status, initiatedAt);
      setTimeRemaining(remainingTime);

      if (remainingTime.hours === 0 && remainingTime.minutes === 0 && remainingTime.seconds === 0) {
        if (status === RecoveryStatus.INITIATED) {
          setStatus(RecoveryStatus.READY);
        } else if (status === RecoveryStatus.READY) {
          setStatus(RecoveryStatus.EXPIRED);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status, initiatedAt]);

  return (
    <div className="App">
      <HStack spacing="28" marginTop="12">
        <RecoveryMessage status={status} />
        <Spacer />
        <VStack>
          <h1>
            {timeRemaining.message ||
              `${timeRemaining.hours} Hours: ${timeRemaining.minutes} Minutes: ${timeRemaining.seconds} Seconds`}
          </h1>
          <p>Time Remaining</p>
        </VStack>
      </HStack>
    </div>
  );
};

export default RecoveryTimer;
