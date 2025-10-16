import { ENV } from '../constants';
import { Environment } from '@getpara/web-sdk';
import { WarningBanner } from '@getpara/react-common';
import { styled } from 'styled-components';
import { isIFramed } from '../utils/isIFramed';

export const BetaBannerNoChakra = () => {
  if (ENV === Environment.PROD || isIFramed) {
    return null;
  }

  return (
    <BannerWrapper>
      <WarningBanner>
        You are using Para in a development (non-production) environment: {ENV}. Be wary of sharing sensitive information.
      </WarningBanner>
    </BannerWrapper>
  );
};

const BannerWrapper = styled.div`
  position: fixed;
  left: 8px;
  right: 8px;
  top: 8px;
  z-index: 9999;
  max-width: calc(100% - 16px);
`;
