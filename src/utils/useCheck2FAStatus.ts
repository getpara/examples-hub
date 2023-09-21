import { useEffect, useState } from 'react';
import { Capsule } from '../Capsule';

const useCheck2FAStatus = (capsule: Capsule) => {
  const [is2FASetup, setis2FASetup] = useState(false);

  useEffect(() => {
    const check2FA = async () => {
      try {
        const { isSetup } = await capsule.check2FAStatus();
        setis2FASetup(isSetup);
      } catch (error) {
        console.error('An error occurred while checking 2FA:', error);
      }
    };

    check2FA();
  }, []); // Empty dependency array to run only once

  return is2FASetup;
};

export default useCheck2FAStatus;

