import { useOutletContext } from 'react-router-dom';
import { Partner } from '../types';

type ModalOutletContextType = {
  partner: Partner;
  homepageUrl: string;
  isDark: boolean;
  toggleBranding: (_?: boolean) => void;
};

export function useModalOutletContext() {
  return useOutletContext<ModalOutletContextType>();
}
