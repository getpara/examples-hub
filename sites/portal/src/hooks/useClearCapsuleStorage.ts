import { useEffect, useRef } from 'react';
import { usePara } from '../components';

export function useClearParaStorage() {
  const para = usePara();
  const isCleared = useRef(false);

  useEffect(() => {
    if (!isCleared.current) {
      para.clearStorage('local');
      isCleared.current = true;
    }
  }, []);
}
