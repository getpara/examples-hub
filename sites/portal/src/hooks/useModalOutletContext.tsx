import { PartnerEntity } from '@getpara/web-sdk';
import { useOutletContext } from 'react-router-dom';

type ModalOutletContextType = {
  partner: PartnerEntity;
  homepageUrl: string;
  isDark: boolean;
  toggleBranding: (_?: boolean) => void;
  trustedOrigin: string;
};

export function useModalOutletContext() {
  return useOutletContext<ModalOutletContextType>();
}
