import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { userManagementClient } from '../clients/userManagementClient';
import { Partner } from '../types';
import { DEFAULT_HOMEPAGE_URL, DEFAULT_PARTNER } from '../constants';
import { validateColorInput } from '../utils/validateColorInput';
import { BorderRadius, generateTheme } from '@usecapsule/react-components';
import capsule from '../clients/capsule';
import { BetaBannerNoChakra } from './BetaBannerNoChakra';

export const ModalLayout = () => {
  const [searchParams] = useSearchParams();
  const paramsPartnerId = searchParams.get('partnerId');
  // TODO: Move this to the partner config
  const homepageUrl = searchParams.get('homepageUrl') ?? DEFAULT_HOMEPAGE_URL;

  // TODO: should we move this to the partner object and use the theme builder or keep for now to allow for overrides but deprecate?
  // THEMING
  const portalForegroundColor = validateColorInput(searchParams.get('portalForegroundColor'))
    ? searchParams.get('portalForegroundColor')
    : '';
  const portalBackgroundColor = validateColorInput(searchParams.get('portalBackgroundColor'))
    ? searchParams.get('portalBackgroundColor')
    : '';
  const portalPrimaryButtonColor = validateColorInput(searchParams.get('portalPrimaryButtonColor'))
    ? decodeURIComponent(searchParams.get('portalPrimaryButtonColor'))
    : '';
  const portalTextColor = validateColorInput(searchParams.get('portalTextColor'))
    ? decodeURIComponent(searchParams.get('portalTextColor'))
    : '';
  const portalPrimaryButtonTextColor = validateColorInput(searchParams.get('portalPrimaryButtonTextColor'))
    ? decodeURIComponent(searchParams.get('portalPrimaryButtonTextColor'))
    : '';
  const portalBorderRadius = searchParams.get('portalPrimaryButtonTextColor');

  useEffect(() => {
    // If background is provided with no foreground we can assume its legacy and to use the custom palette
    const isLegacy = portalBackgroundColor && !portalForegroundColor;

    capsule.portalBackgroundColor = portalBackgroundColor;
    capsule.portalPrimaryButtonColor = portalPrimaryButtonColor;
    capsule.portalTextColor = portalTextColor;
    capsule.portalTheme = {
      backgroundColor: portalBackgroundColor,
      foregroundColor: portalForegroundColor,
      borderRadius: portalBorderRadius as BorderRadius,
    };

    generateTheme({
      ...(isLegacy
        ? {
            backgroundColor: portalBackgroundColor,
            foregroundColor: portalPrimaryButtonColor,
            customPalette: {
              text: {
                primary: portalTextColor,
                secondary: portalTextColor,
                inverted: portalPrimaryButtonTextColor,
              },
            },
          }
        : {
            backgroundColor: portalBackgroundColor,
            foregroundColor: portalForegroundColor,
            borderRadius: portalBorderRadius as BorderRadius,
          }),
    });
  }, [
    portalForegroundColor,
    portalBackgroundColor,
    portalBorderRadius,
    portalPrimaryButtonColor,
    portalPrimaryButtonTextColor,
    portalTextColor,
  ]);

  const [partner, setPartner] = useState<Partner | undefined>();

  useEffect(() => {
    async function getPartner() {
      if (paramsPartnerId) {
        const detailsRes = (await userManagementClient.getPartner(paramsPartnerId)).data;
        setPartner(detailsRes.partner);
      } else {
        setPartner(DEFAULT_PARTNER);
      }
    }
    getPartner();
  }, []);

  if (!partner) return null;

  return (
    <>
      <BetaBannerNoChakra />
      <OuterContainer>
        <Outlet context={{ partner, homepageUrl }} />
      </OuterContainer>
    </>
  );
};

const OuterContainer = styled.div`
  background-color: var(--cpsl-color-modal-surface-footer);

  height: 100vh;
  height: 100dvh;
  width: 100vw;
  width: 100dvw;

  display: flex;
  justify-content: center;
  align-items: center;

  body {
    overflow: hidden;
  }
`;
