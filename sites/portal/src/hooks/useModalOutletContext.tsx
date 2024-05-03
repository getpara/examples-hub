import { useOutletContext } from 'react-router-dom';
import { Partner } from '../types';

type ModalOutletContextType = { partner: Partner; homepageUrl: string; isDark: boolean };

export function useModalOutletContext() {
  return useOutletContext<ModalOutletContextType>();
}
