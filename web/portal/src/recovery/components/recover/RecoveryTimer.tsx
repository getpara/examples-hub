import { HStack, Spacer, VStack } from '@chakra-ui/react';
import React, { useState, useEffect, useContext } from 'react';
import { RecoveryStatus } from '../../../library/Capsule';
import RecoverWalletButton from './RecoverWalletButton';
import { RecoveryAttemptContext } from '../../contexts/RecoveryAttemptContext';

const RECOVERY_INITIATED_HOURS = 48;
const RECOVERY_READY_HOURS = 72;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  message?: string;
}

const getTimeRemaining = (status: RecoveryStatus, initiatedAt: Date): TimeRemaining => {
  const now = new Date();
  let targetTime;

  switch (status) {
    case RecoveryStatus.INITIATED:
      targetTime = new Date(initiatedAt);
      targetTime.setHours(targetTime.getHours() + RECOVERY_INITIATED_HOURS);
      break;
    case RecoveryStatus.READY:
      targetTime = new Date(initiatedAt);
      targetTime.setHours(targetTime.getHours() + RECOVERY_READY_HOURS);
      break;
    case RecoveryStatus.EXPIRED:
      return { hours: 0, minutes: 0, seconds: 0, message: 'Time Expired' };
    case RecoveryStatus.FINISHED:
      return { hours: 0, minutes: 0, seconds: 0, message: 'Recovery was successful!' };
    default:
      return { hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor((targetTime.getTime() - now.getTime()) / 1000);
  return {
    hours: Math.floor(totalSeconds / SECONDS_IN_HOUR),
    minutes: Math.floor((totalSeconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE),
    seconds: totalSeconds % SECONDS_IN_MINUTE
  };
};

const RecoveryMessage = ({ status }) => {
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
              <li>Enter a 2FA Code...</li>
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
}

const RecoveryTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ hours: 0, minutes: 0, seconds: 0 });
  const { status, setStatus, initiatedAt } = useContext(RecoveryAttemptContext);

  useEffect(() => {
    const updateTimer = () => {
      const remainingTime = getTimeRemaining(status, initiatedAt);
      setTimeRemaining(remainingTime);

      if (remainingTime.hours === 0 && remainingTime.minutes === 0 && remainingTime.seconds === 0) {
        switch (status) {
          case RecoveryStatus.INITIATED:
            setStatus(RecoveryStatus.READY);
            break;
          case RecoveryStatus.READY:
            setStatus(RecoveryStatus.EXPIRED);
            break;
          default:
            return;
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
            {timeRemaining.message || `${timeRemaining.hours} Hours: ${timeRemaining.minutes} Minutes: ${timeRemaining.seconds} Seconds`}
          </h1>
          <p>Time Remaining</p>
        </VStack>
      </HStack>
    </div>
  );
};

export default RecoveryTimer;
