import { useEffect, useRef } from 'react';
import { useCapsule } from '../components';

export function useClearCapsuleStorage() {
  const capsule = useCapsule();
  const isCleared = useRef(false);

  useEffect(() => {
    if (!isCleared.current) {
      capsule.clearStorage('local');
      isCleared.current = true;
    }
  }, []);
}
